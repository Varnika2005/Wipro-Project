from pydantic import BaseModel, EmailStr, ConfigDict
from typing import Optional, List
from datetime import datetime


class UserLoginRequest(BaseModel):
    username: str
    password: str


class UserResponse(BaseModel):
    id: str
    username: str
    email: str
    role: str
    is_active: bool
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)


class TokenPayload(BaseModel):
    sub: str          # User ID
    username: str
    role: str
    type: str         # "access" or "refresh"
    jti: str          # Unique Token Identifier
    exp: int


class AuditLogResponse(BaseModel):
    id: int
    user_id: str
    username: str
    role: str
    action: str
    target_device_id: Optional[str]
    details: Optional[str]
    ip_address: str
    timestamp: datetime
    model_config = ConfigDict(from_attributes=True)
