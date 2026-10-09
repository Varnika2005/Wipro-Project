from typing import List, Optional
from fastapi import Depends, HTTPException, Request, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User
from app.services.auth_service import AuthService

ROLE_HIERARCHY = {
    "admin": 3,
    "operator": 2,
    "viewer": 1,
}


def get_current_user(request: Request, db: Session = Depends(get_db)) -> User:
    """
    Extracts access token securely from HttpOnly cookie (or Authorization Bearer header as fallback).
    Validates token and returns User record.
    """
    token = request.cookies.get("access_token")

    # Fallback to Authorization Header if not in cookie
    if not token:
        auth_header = request.headers.get("Authorization")
        if auth_header and auth_header.startswith("Bearer "):
            token = auth_header.split(" ")[1]

    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required. No session token provided in HttpOnly cookie.",
        )

    payload = AuthService.decode_token(token, db, expected_type="access")
    user_id = payload.get("sub")

    user = db.query(User).filter(User.id == user_id).first()
    if not user or not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User account is inactive or no longer exists.",
        )

    return user


def require_role(min_role: str):
    """
    RBAC dependency factory enforcing minimum role privilege.
    Example: Depends(require_role("operator")) allows both 'operator' and 'admin'.
    """
    min_level = ROLE_HIERARCHY.get(min_role, 1)

    def role_checker(current_user: User = Depends(get_current_user)) -> User:
        user_level = ROLE_HIERARCHY.get(current_user.role, 1)
        if user_level < min_level:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access forbidden: requires '{min_role}' privilege or higher. Your role: '{current_user.role}'.",
            )
        return current_user

    return role_checker
