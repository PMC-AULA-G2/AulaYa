import tempfile
import unittest
from pathlib import Path

from app.auth import AuthError, AuthService


class FakeClock:
    def __init__(self):
        self.value = 1_800_000_000

    def __call__(self):
        return self.value

    def advance(self, seconds):
        self.value += seconds


class AuthServiceTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.clock = FakeClock()
        self.outbox = []
        self.service = AuthService(
            Path(self.temp.name) / "auth.sqlite",
            "test-secret-with-at-least-32-characters",
            lambda email, code: self.outbox.append((email, code)),
            self.clock,
        )

    def tearDown(self):
        self.temp.cleanup()

    def register(self):
        return self.service.register(
            {
                "role": "estudiante",
                "nombre": "Estudiante de prueba",
                "correo": "alumna@example.edu",
                "colegioId": "12345",
                "grado": "8°",
                "salon": "A",
                "pin": "1234",
            }
        )

    def request_code(self):
        self.service.request_recovery("alumna@example.edu", True, "127.0.0.1")
        return self.outbox[-1][1]

    def test_register_and_login_never_store_plain_pin(self):
        user = self.register()
        self.assertEqual(user["correo"], "alumna@example.edu")
        self.assertEqual(self.service.login("ALUMNA@example.edu", "1234", "127.0.0.1"), user)
        with self.service.connect() as connection:
            stored = connection.execute("SELECT pin_hash FROM users").fetchone()["pin_hash"]
        self.assertNotEqual(stored, b"1234")

    def test_recovery_code_resets_pin_once(self):
        self.register()
        code = self.request_code()
        token = self.service.verify_recovery_code("alumna@example.edu", code)
        self.service.reset_pin("alumna@example.edu", token, "9876")
        self.assertEqual(
            self.service.login("alumna@example.edu", "9876", "127.0.0.1")["nombre"],
            "Estudiante de prueba",
        )
        with self.assertRaises(AuthError):
            self.service.reset_pin("alumna@example.edu", token, "1234")

    def test_invalid_code_attempts_persist_and_limit_verification(self):
        self.register()
        self.request_code()
        for _ in range(5):
            with self.assertRaises(AuthError):
                self.service.verify_recovery_code("alumna@example.edu", "000000")
        with self.assertRaises(AuthError):
            self.service.verify_recovery_code("alumna@example.edu", self.outbox[-1][1])

    def test_expired_code_cannot_be_used(self):
        self.register()
        code = self.request_code()
        self.clock.advance(self.service.RECOVERY_TTL_SECONDS + 1)
        with self.assertRaises(AuthError):
            self.service.verify_recovery_code("alumna@example.edu", code)

    def test_local_account_is_created_after_verified_email_reset(self):
        code = self.request_code()
        token = self.service.verify_recovery_code("alumna@example.edu", code)
        self.service.reset_pin(
            "alumna@example.edu",
            token,
            "9876",
            {
                "correo": "alumna@example.edu",
                "role": "estudiante",
                "nombre": "Estudiante migrada",
                "colegioId": "12345",
                "grado": "8°",
                "salon": "A",
            },
        )
        self.assertEqual(
            self.service.login("alumna@example.edu", "9876", "127.0.0.1")["nombre"],
            "Estudiante migrada",
        )

    def test_wrong_pin_is_rate_limited(self):
        self.register()
        for _ in range(self.service.LOGIN_MAX_ATTEMPTS):
            with self.assertRaises(AuthError):
                self.service.login("alumna@example.edu", "0000", "127.0.0.1")
        with self.assertRaises(AuthError) as error:
            self.service.login("alumna@example.edu", "1234", "127.0.0.1")
        self.assertEqual(error.exception.status_code, 429)

    def test_recovery_email_requests_are_rate_limited(self):
        self.register()
        self.request_code()
        with self.assertRaises(AuthError) as error:
            self.service.request_recovery("alumna@example.edu", True, "127.0.0.1")
        self.assertEqual(error.exception.status_code, 429)


if __name__ == "__main__":
    unittest.main()
