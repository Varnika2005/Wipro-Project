import time
import uuid
import datetime
import bcrypt
import jwt
from typing import Dict, Tuple, Optional, Any
from sqlalchemy.orm import Session
from fastapi import HTTPException, status

from app.models.user import User, TokenRevocation, AuditLog

# Security configuration
JWT_SECRET_KEY = "netsentinel-super-secret-antigravity-spatial-key-2026"
JWT_ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 15
REFRESH_TOKEN_EXPIRE_DAYS = 7

# In-memory leaky-bucket rate limiter for brute-force mitigation
# Maps IP/username -> list of failed attempt timestamps
FAILED_ATTEMPTS: Dict[str, list] = {}
RATE_LIMIT_WINDOW_SECONDS = 60
MAX_FAILED_ATTEMPTS = 5


class AuthService:
    """
    Zero-Trust Cryptographic Security & Authentication Service.
    Enforces bcrypt password hashing, short-lived JWTs, sliding-window refresh tokens,
    server-side revocation, and brute-force mitigation.
    """

    @staticmethod
    def hash_password(password: str) -> str:
        """Hashes password with bcrypt using work factor 12."""
        salt = bcrypt.gensalt(rounds=12)
        return bcrypt.hashpw(password.encode("utf-8"), salt).decode("utf-8")

    @staticmethod
    def verify_password(plain_password: str, hashed_password: str) -> bool:
        """Verifies password against bcrypt hash."""
        return bcrypt.checkpw(plain_password.encode("utf-8"), hashed_password.encode("utf-8"))

    @staticmethod
    def check_rate_limit(client_identifier: str):
        """Enforces sliding-window rate limit on authentication attempts."""
        now = time.time()
        attempts = FAILED_ATTEMPTS.get(client_identifier, [])
        # Prune attempts older than rate limit window
        valid_attempts = [t for t in attempts if now - t < RATE_LIMIT_WINDOW_SECONDS]
        FAILED_ATTEMPTS[client_identifier] = valid_attempts

        if len(valid_attempts) >= MAX_FAILED_ATTEMPTS:
            remaining = int(RATE_LIMIT_WINDOW_SECONDS - (now - valid_attempts[0]))
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail=f"Too many failed login attempts. Account temporarily locked. Retry in {remaining}s.",
            )

    @staticmethod
    def record_failed_attempt(client_identifier: str):
        now = time.time()
        attempts = FAILED_ATTEMPTS.get(client_identifier, [])
        attempts.append(now)
        FAILED_ATTEMPTS[client_identifier] = attempts

    @staticmethod
    def reset_failed_attempts(client_identifier: str):
        FAILED_ATTEMPTS.pop(client_identifier, None)

    @staticmethod
    def create_tokens(user: User) -> Tuple[str, str, str, str]:
        """
        Creates a short-lived access token and a long-lived sliding refresh token.
        Returns: (access_token, refresh_token, access_jti, refresh_jti)
        """
        now = datetime.datetime.now(datetime.timezone.utc)
        access_jti = str(uuid.uuid4())
        refresh_jti = str(uuid.uuid4())

        # Access token payload (15 mins)
        access_exp = now + datetime.timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        access_payload = {
            "sub": user.id,
            "username": user.username,
            "role": user.role,
            "type": "access",
            "jti": access_jti,
            "exp": int(access_exp.timestamp()),
            "iat": int(now.timestamp()),
        }

        # Refresh token payload (7 days)
        refresh_exp = now + datetime.timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS)
        refresh_payload = {
            "sub": user.id,
            "username": user.username,
            "role": user.role,
            "type": "refresh",
            "jti": refresh_jti,
            "exp": int(refresh_exp.timestamp()),
            "iat": int(now.timestamp()),
        }

        access_token = jwt.encode(access_payload, JWT_SECRET_KEY, algorithm=JWT_ALGORITHM)
        refresh_token = jwt.encode(refresh_payload, JWT_SECRET_KEY, algorithm=JWT_ALGORITHM)

        return access_token, refresh_token, access_jti, refresh_jti

    @staticmethod
    def decode_token(token: str, db: Session, expected_type: str = "access") -> Dict[str, Any]:
        """Validates signature, expiration, type, and checks revocation denylist."""
        try:
            payload = jwt.decode(token, JWT_SECRET_KEY, algorithms=[JWT_ALGORITHM])
        except jwt.ExpiredSignatureError:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token has expired")
        except jwt.InvalidTokenError:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token signature")

        if payload.get("type") != expected_type:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=f"Expected {expected_type} token")

        jti = payload.get("jti")
        if jti:
            revoked = db.query(TokenRevocation).filter(TokenRevocation.jti == jti).first()
            if revoked:
                raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token has been revoked")

        return payload

    @staticmethod
    def revoke_token(jti: str, exp_timestamp: int, db: Session):
        """Adds token jti to server-side revocation denylist."""
        exp_dt = datetime.datetime.fromtimestamp(exp_timestamp, tz=datetime.timezone.utc).replace(tzinfo=None)
        rev = TokenRevocation(jti=jti, expires_at=exp_dt)
        db.merge(rev)
        db.commit()

    @staticmethod
    def log_audit(
        db: Session,
        user_id: str,
        username: str,
        role: str,
        action: str,
        target_device_id: Optional[str] = None,
        details: Optional[str] = None,
        ip_address: str = "127.0.0.1",
    ):
        """Records an immutable security audit entry."""
        audit = AuditLog(
            user_id=user_id,
            username=username,
            role=role,
            action=action,
            target_device_id=target_device_id,
            details=details,
            ip_address=ip_address,
        )
        db.add(audit)
        db.commit()
