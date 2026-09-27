import hashlib
import hmac
import logging
import re
import secrets
import smtplib
import sqlite3
import time
from contextlib import contextmanager
from email.message import EmailMessage
from pathlib import Path
from typing import Callable


class AuthError(Exception):
    def __init__(self, status_code: int, detail: str):
        self.status_code = status_code
        self.detail = detail


class AuthService:
    RECOVERY_TTL_SECONDS = 600
    RESET_TOKEN_TTL_SECONDS = 600
    RECOVERY_COOLDOWN_SECONDS = 60
    RECOVERY_MAX_PER_HOUR = 5
    LOGIN_MAX_ATTEMPTS = 5
    LOGIN_LOCK_SECONDS = 900

    def __init__(
        self,
        database: Path,
        secret: str,
        send_email: Callable[[str, str], None],
        clock: Callable[[], float] = time.time,
    ):
        if len(secret) < 32:
            raise ValueError("AULA_AUTH_SECRET must contain at least 32 characters.")
        self.database = Path(database)
        self.database.parent.mkdir(parents=True, exist_ok=True)
        self.secret = secret.encode("utf-8")
        self.send_email = send_email
        self.clock = clock
        self.initialize()

    logger = logging.getLogger(__name__)

    @contextmanager
    def connect(self):
        connection = sqlite3.connect(self.database, timeout=10)
        connection.row_factory = sqlite3.Row
        try:
            yield connection
            connection.commit()
        except Exception:
            connection.rollback()
            raise
        finally:
            connection.close()

    def initialize(self):
        with self.connect() as connection:
            connection.execute(
                """CREATE TABLE IF NOT EXISTS users (
                    email TEXT PRIMARY KEY,
                    role TEXT NOT NULL CHECK(role IN ('estudiante', 'profesor')),
                    name TEXT NOT NULL,
                    school_id TEXT NOT NULL,
                    grade TEXT NOT NULL DEFAULT '',
                    classroom TEXT NOT NULL DEFAULT '',
                    subjects TEXT NOT NULL DEFAULT 'todas',
                    pin_salt BLOB NOT NULL,
                    pin_hash BLOB NOT NULL,
                    created_at INTEGER NOT NULL
                )"""
            )
            connection.execute(
                """CREATE TABLE IF NOT EXISTS recovery (
                    email TEXT PRIMARY KEY,
                    code_hash BLOB,
                    code_expires INTEGER,
                    code_attempts INTEGER NOT NULL DEFAULT 0,
                    last_sent INTEGER NOT NULL,
                    token_hash BLOB,
                    token_expires INTEGER
                )"""
            )
            connection.execute(
                """CREATE TABLE IF NOT EXISTS recovery_limits (
                    bucket TEXT PRIMARY KEY,
                    count INTEGER NOT NULL,
                    window_started INTEGER NOT NULL,
                    last_sent INTEGER NOT NULL
                )"""
            )
            connection.execute(
                """CREATE TABLE IF NOT EXISTS auth_attempts (
                    bucket TEXT PRIMARY KEY,
                    count INTEGER NOT NULL,
                    window_started INTEGER NOT NULL
                )"""
            )

    @staticmethod
    def normalize_email(email: str) -> str:
        normalized = email.strip().lower()
        if len(normalized) > 254 or not re.fullmatch(
            r"[^@\s<>]+@(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,63}",
            normalized,
            flags=re.ASCII,
        ):
            raise AuthError(422, "Escribe un correo válido.")
        return normalized

    @staticmethod
    def pin_bytes(pin: str, salt: bytes) -> bytes:
        return hashlib.pbkdf2_hmac("sha256", pin.encode("utf-8"), salt, 600_000)

    def digest(self, purpose: str, value: str) -> bytes:
        return hmac.new(
            self.secret,
            f"{purpose}:{value}".encode("utf-8"),
            hashlib.sha256,
        ).digest()

    def public_user(self, row: sqlite3.Row) -> dict:
        return {
            "correo": row["email"],
            "role": row["role"],
            "nombre": row["name"],
            "colegioId": row["school_id"],
            "grado": row["grade"],
            "salon": row["classroom"],
            "materias": row["subjects"].split("\n") if row["subjects"] != "todas" else "todas",
        }

    def register(self, payload: dict) -> dict:
        email = self.normalize_email(payload["correo"])
        role = payload["role"]
        name = payload["nombre"].strip()
        school_id = str(payload["colegioId"]).strip()
        pin = str(payload["pin"])
        grade = str(payload.get("grado") or "").strip()
        classroom = str(payload.get("salon") or "").strip()
        subjects = payload.get("materias", "todas")
        if role not in {"estudiante", "profesor"}:
            raise AuthError(422, "Elige un tipo de cuenta válido.")
        if not name or len(name) > 120 or not school_id or len(school_id) > 32:
            raise AuthError(422, "Completa el nombre y el colegio.")
        if len(pin) != 4 or not pin.isascii() or not pin.isdigit():
            raise AuthError(422, "El PIN debe tener 4 dígitos.")
        if role == "estudiante" and (not grade or not classroom):
            raise AuthError(422, "Completa el grado y el salón.")
        if role == "profesor":
            if subjects != "todas" and (
                not isinstance(subjects, list)
                or not subjects
                or any(not isinstance(item, str) or len(item) > 80 for item in subjects)
            ):
                raise AuthError(422, "Elige al menos una materia.")
            subjects = "todas" if subjects == "todas" else "\n".join(subjects)
        else:
            subjects = "todas"

        salt = secrets.token_bytes(16)
        pin_hash = self.pin_bytes(pin, salt)
        try:
            with self.connect() as connection:
                connection.execute(
                    """INSERT INTO users
                    (email, role, name, school_id, grade, classroom, subjects, pin_salt, pin_hash, created_at)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)""",
                    (email, role, name, school_id, grade, classroom, subjects, salt, pin_hash, int(self.clock())),
                )
                row = connection.execute("SELECT * FROM users WHERE email=?", (email,)).fetchone()
        except sqlite3.IntegrityError as exc:
            raise AuthError(409, "Ya existe una cuenta con ese correo. Inicia sesión o recupérala.") from exc
        return self.public_user(row)

    def check_attempt_limit(self, connection, bucket: str, now: int):
        row = connection.execute(
            "SELECT count, window_started FROM auth_attempts WHERE bucket=?", (bucket,)
        ).fetchone()
        if row and now - row["window_started"] < self.LOGIN_LOCK_SECONDS:
            if row["count"] >= self.LOGIN_MAX_ATTEMPTS:
                raise AuthError(429, "Demasiados intentos. Espera 15 minutos antes de volver a intentar.")
        elif row:
            connection.execute("DELETE FROM auth_attempts WHERE bucket=?", (bucket,))

    def login(self, email: str, pin: str, client_ip: str) -> dict:
        normalized = self.normalize_email(email)
        now = int(self.clock())
        bucket = self.digest("login", f"{normalized}:{client_ip}").hex()
        user = None
        with self.connect() as connection:
            self.check_attempt_limit(connection, bucket, now)
            row = connection.execute("SELECT * FROM users WHERE email=?", (normalized,)).fetchone()
            valid = bool(
                row
                and len(pin) == 4
                and pin.isascii()
                and pin.isdigit()
                and hmac.compare_digest(self.pin_bytes(pin, row["pin_salt"]), row["pin_hash"])
            )
            if not valid:
                attempt = connection.execute(
                    "SELECT count, window_started FROM auth_attempts WHERE bucket=?", (bucket,)
                ).fetchone()
                if attempt and now - attempt["window_started"] < self.LOGIN_LOCK_SECONDS:
                    connection.execute(
                        "UPDATE auth_attempts SET count=count+1 WHERE bucket=?", (bucket,)
                    )
                else:
                    connection.execute(
                        "INSERT OR REPLACE INTO auth_attempts(bucket,count,window_started) VALUES(?,?,?)",
                        (bucket, 1, now),
                    )
            else:
                connection.execute("DELETE FROM auth_attempts WHERE bucket=?", (bucket,))
                user = self.public_user(row)
        if user is None:
            raise AuthError(401, "Correo o PIN incorrecto.")
        return user

    def request_recovery(self, email: str, smtp_configured: bool, client_ip: str) -> None:
        normalized = self.normalize_email(email)
        if not smtp_configured:
            raise AuthError(503, "La recuperación por correo no está configurada en el servidor.")
        now = int(self.clock())
        code = f"{secrets.randbelow(1_000_000):06d}"
        code_hash = self.digest("recovery-code", f"{normalized}:{code}")
        buckets = (
            (self.digest("recovery-email", normalized).hex(), self.RECOVERY_MAX_PER_HOUR),
            (self.digest("recovery-ip", client_ip).hex(), 10),
        )
        with self.connect() as connection:
            for bucket, max_per_hour in buckets:
                row = connection.execute(
                    "SELECT count,window_started,last_sent FROM recovery_limits WHERE bucket=?",
                    (bucket,),
                ).fetchone()
                if row and now - row["last_sent"] < self.RECOVERY_COOLDOWN_SECONDS:
                    raise AuthError(429, "Espera un minuto antes de pedir otro código.")
                if row and now - row["window_started"] < 3600 and row["count"] >= max_per_hour:
                    raise AuthError(429, "Se alcanzó el límite temporal de envío. Intenta más tarde.")
                count = row["count"] + 1 if row and now - row["window_started"] < 3600 else 1
                window_started = row["window_started"] if row and now - row["window_started"] < 3600 else now
                connection.execute(
                    """INSERT OR REPLACE INTO recovery_limits(bucket,count,window_started,last_sent)
                       VALUES(?,?,?,?)""",
                    (bucket, count, window_started, now),
                )
            connection.execute(
                """INSERT INTO recovery(email,code_hash,code_expires,code_attempts,last_sent,token_hash,token_expires)
                   VALUES(?,?,?,?,?,?,?)
                   ON CONFLICT(email) DO UPDATE SET
                     code_hash=excluded.code_hash,
                     code_expires=excluded.code_expires,
                     code_attempts=0,
                     last_sent=excluded.last_sent,
                     token_hash=NULL,
                     token_expires=NULL""",
                (normalized, code_hash, now + self.RECOVERY_TTL_SECONDS, 0, now, None, None),
            )
        try:
            self.send_email(normalized, code)
        except Exception as exc:
            self.logger.exception("Could not send an AULA account recovery email.")
            with self.connect() as connection:
                connection.execute("DELETE FROM recovery WHERE email=?", (normalized,))
            raise AuthError(503, "No se pudo enviar el correo de recuperación. Inténtalo más tarde.") from exc

    def verify_recovery_code(self, email: str, code: str) -> str:
        normalized = self.normalize_email(email)
        now = int(self.clock())
        token = None
        with self.connect() as connection:
            row = connection.execute(
                "SELECT * FROM recovery WHERE email=?", (normalized,)
            ).fetchone()
            valid = bool(
                row
                and row["code_hash"]
                and row["code_expires"] >= now
                and row["code_attempts"] < 5
                and len(code) == 6
                and code.isascii()
                and code.isdigit()
                and hmac.compare_digest(
                    self.digest("recovery-code", f"{normalized}:{code}"),
                    row["code_hash"],
                )
            )
            if not valid:
                if row and row["code_hash"] and row["code_attempts"] < 5:
                    connection.execute(
                        "UPDATE recovery SET code_attempts=code_attempts+1 WHERE email=?",
                        (normalized,),
                    )
            else:
                token = secrets.token_urlsafe(32)
                connection.execute(
                    """UPDATE recovery SET code_hash=NULL,code_expires=NULL,token_hash=?,token_expires=?
                       WHERE email=?""",
                    (self.digest("reset-token", f"{normalized}:{token}"), now + self.RESET_TOKEN_TTL_SECONDS, normalized),
                )
        if token is None:
            raise AuthError(400, "El código no es válido o venció. Solicita uno nuevo.")
        return token

    def reset_pin(self, email: str, token: str, new_pin: str, legacy_profile: dict | None = None) -> None:
        normalized = self.normalize_email(email)
        if len(new_pin) != 4 or not new_pin.isascii() or not new_pin.isdigit():
            raise AuthError(422, "El PIN debe tener 4 dígitos.")
        now = int(self.clock())
        token_hash = self.digest("reset-token", f"{normalized}:{token}")
        salt = secrets.token_bytes(16)
        pin_hash = self.pin_bytes(new_pin, salt)
        with self.connect() as connection:
            row = connection.execute(
                "SELECT token_hash,token_expires FROM recovery WHERE email=?", (normalized,)
            ).fetchone()
            valid = bool(
                row
                and row["token_hash"]
                and row["token_expires"] >= now
                and hmac.compare_digest(token_hash, row["token_hash"])
            )
            if not valid:
                raise AuthError(400, "La verificación venció. Solicita un nuevo código.")
            existing = connection.execute(
                "SELECT email FROM users WHERE email=?", (normalized,)
            ).fetchone()
            if existing:
                connection.execute(
                    "UPDATE users SET pin_salt=?,pin_hash=? WHERE email=?",
                    (salt, pin_hash, normalized),
                )
            elif legacy_profile:
                profile_email = self.normalize_email(str(legacy_profile.get("correo", "")))
                role = legacy_profile.get("role")
                name = str(legacy_profile.get("nombre", "")).strip()
                school_id = str(legacy_profile.get("colegioId", "")).strip()
                grade = str(legacy_profile.get("grado") or "").strip()
                classroom = str(legacy_profile.get("salon") or "").strip()
                subjects = legacy_profile.get("materias", "todas")
                if (
                    profile_email != normalized
                    or role not in {"estudiante", "profesor"}
                    or not name
                    or len(name) > 120
                    or not school_id
                    or len(school_id) > 32
                    or len(grade) > 40
                    or len(classroom) > 20
                ):
                    raise AuthError(400, "No se pudo migrar la cuenta local.")
                if role == "estudiante" and (not grade or not classroom):
                    raise AuthError(400, "No se pudo migrar la cuenta local.")
                if role == "profesor":
                    if subjects != "todas" and (
                        not isinstance(subjects, list)
                        or not subjects
                        or any(not isinstance(item, str) or len(item) > 80 for item in subjects)
                    ):
                        raise AuthError(400, "No se pudo migrar la cuenta local.")
                    subjects = "todas" if subjects == "todas" else "\n".join(subjects)
                else:
                    subjects = "todas"
                connection.execute(
                    """INSERT INTO users
                    (email,role,name,school_id,grade,classroom,subjects,pin_salt,pin_hash,created_at)
                    VALUES(?,?,?,?,?,?,?,?,?,?)""",
                    (normalized, role, name, school_id, grade, classroom, subjects, salt, pin_hash, now),
                )
            else:
                raise AuthError(400, "No encontramos una cuenta para ese correo.")
            connection.execute("DELETE FROM recovery WHERE email=?", (normalized,))


def smtp_sender_from_environment() -> Callable[[str, str], None]:
    import os

    host = os.getenv("SMTP_HOST", "").strip()
    port = int(os.getenv("SMTP_PORT", "587"))
    username = os.getenv("SMTP_USERNAME", "").strip()
    password = os.getenv("SMTP_PASSWORD", "")
    sender = os.getenv("SMTP_FROM", username).strip()
    use_ssl = os.getenv("SMTP_USE_SSL", "false").strip().lower() == "true"
    configured = all((host, username, password, sender))

    def send_email(address: str, code: str):
        if not configured:
            raise RuntimeError("SMTP is not configured.")
        message = EmailMessage()
        message["Subject"] = "Tu código para recuperar AULA"
        message["From"] = sender
        message["To"] = address
        message.set_content(
            f"Tu código de recuperación de AULA es: {code}\n"
            "Vence en 10 minutos. Si no solicitaste este código, ignora este mensaje."
        )
        if use_ssl:
            with smtplib.SMTP_SSL(host, port, timeout=15) as smtp:
                smtp.login(username, password)
                smtp.send_message(message)
        else:
            with smtplib.SMTP(host, port, timeout=15) as smtp:
                smtp.ehlo()
                smtp.starttls()
                smtp.ehlo()
                smtp.login(username, password)
                smtp.send_message(message)

    return send_email


def smtp_is_configured() -> bool:
    import os

    return all(
        os.getenv(key, "").strip()
        for key in ("SMTP_HOST", "SMTP_USERNAME", "SMTP_PASSWORD", "SMTP_FROM")
    )
