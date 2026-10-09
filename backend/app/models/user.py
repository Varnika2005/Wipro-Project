import datetime
from sqlalchemy import Column, String, Boolean, DateTime, Integer, Text
from app.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True)                 # e.g., "usr-admin-01"
    username = Column(String, unique=True, index=True, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    role = Column(String, default="viewer", nullable=False)  # "viewer", "operator", "admin"
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)


class TokenRevocation(Base):
    __tablename__ = "token_revocations"

    jti = Column(String, primary_key=True)               # JWT Unique Identifier
    revoked_at = Column(DateTime, default=datetime.datetime.utcnow)
    expires_at = Column(DateTime, nullable=False)


class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(String, nullable=False)
    username = Column(String, nullable=False)
    role = Column(String, nullable=False)
    action = Column(String, nullable=False)               # e.g., "REMEDIATION_APPLIED"
    target_device_id = Column(String, nullable=True)
    details = Column(Text, nullable=True)
    ip_address = Column(String, default="127.0.0.1")
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)
