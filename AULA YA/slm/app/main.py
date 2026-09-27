import sqlite3
import os
import logging
from pathlib import Path
from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from dotenv import load_dotenv
from .auth import AuthError, AuthService, smtp_is_configured, smtp_sender_from_environment

ROOT = Path(__file__).resolve().parents[1]
DB = ROOT / "data/aula_rag.sqlite"
load_dotenv(ROOT / ".env")
app = FastAPI(title="SLM AULA Multi-Device", version="0.2")
logger = logging.getLogger(__name__)
cors_origins = [
    origin.strip()
    for origin in os.getenv(
        "AULA_CORS_ORIGINS",
        "http://localhost:8000,http://127.0.0.1:8000",
    ).split(",")
    if origin.strip()
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=False,
    allow_methods=["GET", "POST"],
    allow_headers=["Content-Type"],
)


def get_auth_service() -> AuthService:
    secret = os.getenv("AULA_AUTH_SECRET", "")
    if len(secret) < 32:
        raise AuthError(503, "La autenticación no está configurada en el servidor.")
    database = Path(os.getenv("AULA_AUTH_DB", str(ROOT / "data/aula_auth.sqlite")))
    if not database.is_absolute():
        database = ROOT / database
    return AuthService(database, secret, smtp_sender_from_environment())


class AccountRegistration(BaseModel):
    role: str = Field(max_length=20)
    nombre: str = Field(min_length=1, max_length=120)
    correo: str = Field(min_length=3, max_length=254)
    colegioId: str = Field(min_length=1, max_length=32)
    grado: str = Field(default="", max_length=40)
    salon: str = Field(default="", max_length=20)
    materias: str | list[str] = "todas"
    pin: str = Field(min_length=4, max_length=4)


class AccountLogin(BaseModel):
    correo: str = Field(min_length=3, max_length=254)
    pin: str = Field(min_length=1, max_length=20)


class RecoveryRequest(BaseModel):
    correo: str = Field(min_length=3, max_length=254)


class RecoveryVerification(BaseModel):
    correo: str = Field(min_length=3, max_length=254)
    codigo: str = Field(min_length=1, max_length=20)


class PinReset(BaseModel):
    correo: str = Field(min_length=3, max_length=254)
    token: str = Field(min_length=20, max_length=200)
    nuevo_pin: str = Field(min_length=4, max_length=4)
    legacy_profile: dict | None = None


def raise_auth_error(error: AuthError):
    raise HTTPException(status_code=error.status_code, detail=error.detail) from error

class Chat(BaseModel):
    grado: int
    materia: str
    tema: str | None = None
    pregunta: str
    modo: str = "explicar"
    device_tier: str = "auto"  # auto | alto | medio | bajo

def retrieve(x):
    con = sqlite3.connect(DB)
    params = [str(x.grado), x.materia]
    sql = "SELECT tema,tipo,response FROM contenido WHERE grado=? AND materia=?"
    if x.tema:
        sql += " AND tema=?"
        params.append(x.tema)
    sql += " LIMIT 5"
    rows = con.execute(sql, params).fetchall()
    con.close()
    return rows

def choose_tier(tier: str):
    # The app can determine this from RAM/CPU/model support.
    # A low-end phone never needs to load a generative model.
    if tier in {"alto", "medio", "bajo"}:
        return tier
    return "medio"

@app.get("/health")
def health():
    return {"ok": True, "service": "SLM AULA", "architecture": "adaptive"}


@app.post("/auth/register")
def register_account(payload: AccountRegistration):
    try:
        user = get_auth_service().register(payload.model_dump())
    except AuthError as error:
        raise_auth_error(error)
    logger.info("Registered AULA account.")
    return {"user": user}


@app.post("/auth/login")
def login_account(payload: AccountLogin, request: Request):
    try:
        user = get_auth_service().login(
            payload.correo,
            payload.pin,
            request.client.host if request.client else "unknown",
        )
    except AuthError as error:
        raise_auth_error(error)
    return {"user": user}


@app.post("/auth/recovery/request")
def request_account_recovery(payload: RecoveryRequest, request: Request):
    try:
        service = get_auth_service()
        service.request_recovery(
            payload.correo,
            smtp_is_configured(),
            request.client.host if request.client else "unknown",
        )
    except AuthError as error:
        raise_auth_error(error)
    return {
        "message": "Si existe una cuenta con ese correo, recibirás un código de recuperación.",
    }


@app.post("/auth/recovery/verify")
def verify_account_recovery(payload: RecoveryVerification):
    try:
        token = get_auth_service().verify_recovery_code(payload.correo, payload.codigo)
    except AuthError as error:
        raise_auth_error(error)
    return {"token": token}


@app.post("/auth/recovery/reset")
def reset_account_pin(payload: PinReset):
    try:
        get_auth_service().reset_pin(
            payload.correo,
            payload.token,
            payload.nuevo_pin,
            payload.legacy_profile,
        )
    except AuthError as error:
        raise_auth_error(error)
    return {"message": "PIN actualizado. Ya puedes iniciar sesión."}


@app.post("/chat")
def chat(x: Chat):
    tier = choose_tier(x.device_tier)
    rows = retrieve(x)

    if x.modo == "motivar":
        answer = "¡Casi! 💪 Vamos paso a paso. Intenta identificar primero qué información te da el ejercicio."
        niko = "motivar"
    elif x.modo == "recompensa":
        answer = "¡Muy bien! 🎉 Completaste la actividad."
        niko = "celebrar"
    elif rows:
        answer = rows[0][2]
        niko = "pensar"
    else:
        answer = "Vamos paso a paso. Dime qué parte del tema te resulta difícil y la dividimos en una idea pequeña."
        niko = "confundido"

    return {
        "answer": answer,
        "niko_state": niko,
        "recommended_topic": rows[0][0] if rows else x.tema,
        "context_used": len(rows),
        "offline_ready": True,
        "device_tier": tier,
        "ai_policy": {
            "alto": "local_sLM_or_remote",
            "medio": "small_local_sLM_or_remote",
            "bajo": "curated_content_only"
        }[tier]
    }
