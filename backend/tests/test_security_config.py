import pytest
import os
import datetime
import jwt
from app.config import Settings
from app.services.auth_service import AuthService, JWT_ALGORITHM, JWT_SECRET_KEY
from fastapi import HTTPException

def test_missing_production_secret():
    # If environment is production and secret is default, it should fail
    with pytest.raises(ValueError, match="A secure JWT_SECRET_KEY of at least 32 characters must be provided in production."):
        Settings(ENVIRONMENT="production", JWT_SECRET_KEY="netsentinel-super-secret-antigravity-spatial-key-2026")

def test_weak_production_secret():
    # If environment is production and secret is weak (< 32 chars), it should fail
    with pytest.raises(ValueError, match="A secure JWT_SECRET_KEY of at least 32 characters must be provided in production."):
        Settings(ENVIRONMENT="production", JWT_SECRET_KEY="short-secret")

def test_valid_production_config():
    # Should succeed with a strong secret in production
    settings = Settings(ENVIRONMENT="production", JWT_SECRET_KEY="a-very-strong-and-secure-production-secret-1234567890!")
    assert settings.JWT_SECRET_KEY == "a-very-strong-and-secure-production-secret-1234567890!"

def test_local_development_config():
    # Should allow default in development
    settings = Settings(ENVIRONMENT="development", JWT_SECRET_KEY="netsentinel-super-secret-antigravity-spatial-key-2026")
    assert settings.ENVIRONMENT == "development"
    assert settings.JWT_SECRET_KEY == "netsentinel-super-secret-antigravity-spatial-key-2026"

def test_jwt_expiry_and_invalid_tokens():
    # Create an expired token manually
    expired_payload = {
        "sub": "test-user",
        "type": "access",
        "exp": int((datetime.datetime.now(datetime.timezone.utc) - datetime.timedelta(minutes=5)).timestamp())
    }
    # For testing decode token via AuthService which uses settings.JWT_SECRET_KEY
    expired_token = jwt.encode(expired_payload, JWT_SECRET_KEY, algorithm=JWT_ALGORITHM)
    
    with pytest.raises(HTTPException) as exc:
        AuthService.decode_token(expired_token, db=None, expected_type="access")
    assert exc.value.status_code == 401
    assert "expired" in str(exc.value.detail).lower()
    
    # Test invalid signature
    invalid_token = jwt.encode({"sub": "test-user", "type": "access"}, "wrong-secret", algorithm=JWT_ALGORITHM)
    with pytest.raises(HTTPException) as exc:
        AuthService.decode_token(invalid_token, db=None, expected_type="access")
    assert exc.value.status_code == 401
    assert "signature" in str(exc.value.detail).lower()
