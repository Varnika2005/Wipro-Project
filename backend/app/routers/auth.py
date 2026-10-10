from fastapi import APIRouter, Depends, HTTPException, Request, Response, status
from sqlalchemy.orm import Session
from typing import List

from app.database import get_db
from app.models.user import User, AuditLog
from app.schemas.auth_schema import UserLoginRequest, UserResponse, AuditLogResponse
from app.services.auth_service import AuthService, ACCESS_TOKEN_EXPIRE_MINUTES, REFRESH_TOKEN_EXPIRE_DAYS
from app.dependencies.auth import get_current_user, require_role
from app.config import settings

router = APIRouter(prefix="/auth", tags=["Zero-Trust Authentication & RBAC"])


@router.post("/login", response_model=UserResponse)
def login(
    req: UserLoginRequest,
    request: Request,
    response: Response,
    db: Session = Depends(get_db)
):
    """
    Authenticates user, mitigates brute-force via sliding-window rate limit,
    and delivers JWTs strictly via HttpOnly Secure SameSite cookies.
    """
    client_ip = request.client.host if request.client else "127.0.0.1"
    rate_limit_key = f"{client_ip}:{req.username}"

    # Check brute-force rate limit
    AuthService.check_rate_limit(rate_limit_key)

    user = db.query(User).filter(User.username == req.username).first()
    if not user or not AuthService.verify_password(req.password, user.hashed_password):
        AuthService.record_failed_attempt(rate_limit_key)
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid username or password credentials.",
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User account has been deactivated.",
        )

    # Success: reset failed rate limit attempts
    AuthService.reset_failed_attempts(rate_limit_key)

    # Issue cryptographic tokens
    access_token, refresh_token, access_jti, refresh_jti = AuthService.create_tokens(user)

    # Deliver tokens strictly via HttpOnly, SameSite cookies (Zero exposure to JavaScript localStorage)
    response.set_cookie(
        key="access_token",
        value=access_token,
        httponly=True,
        samesite="lax",
        secure=settings.ENVIRONMENT == "production",
        max_age=ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        path="/",
    )

    response.set_cookie(
        key="refresh_token",
        value=refresh_token,
        httponly=True,
        samesite="lax",
        secure=settings.ENVIRONMENT == "production",
        max_age=REFRESH_TOKEN_EXPIRE_DAYS * 24 * 3600,
        path="/api/auth",
    )

    # Record login audit entry
    AuthService.log_audit(
        db=db,
        user_id=user.id,
        username=user.username,
        role=user.role,
        action="AUTH_LOGIN_SUCCESS",
        ip_address=client_ip,
    )

    return UserResponse.model_validate(user)


@router.post("/refresh", response_model=UserResponse)
def refresh_session(
    request: Request,
    response: Response,
    db: Session = Depends(get_db)
):
    """
    Silently refreshes access token using sliding-window refresh token cookie.
    Enforces server-side token rotation and invalidation.
    """
    refresh_token = request.cookies.get("refresh_token")
    if not refresh_token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="No refresh token cookie present in request.",
        )

    payload = AuthService.decode_token(refresh_token, db, expected_type="refresh")
    user_id = payload.get("sub")
    user = db.query(User).filter(User.id == user_id).first()

    if not user or not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User account invalid or inactive.",
        )

    # Revoke old refresh token for sliding window rotation
    old_jti = payload.get("jti")
    old_exp = payload.get("exp")
    if old_jti and old_exp:
        AuthService.revoke_token(old_jti, old_exp, db)

    # Generate fresh pair
    access_token, new_refresh_token, _, _ = AuthService.create_tokens(user)

    response.set_cookie(
        key="access_token",
        value=access_token,
        httponly=True,
        samesite="lax",
        secure=settings.ENVIRONMENT == "production",
        max_age=ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        path="/",
    )

    response.set_cookie(
        key="refresh_token",
        value=new_refresh_token,
        httponly=True,
        samesite="lax",
        secure=settings.ENVIRONMENT == "production",
        max_age=REFRESH_TOKEN_EXPIRE_DAYS * 24 * 3600,
        path="/api/auth",
    )

    return UserResponse.model_validate(user)


@router.post("/logout")
def logout(
    request: Request,
    response: Response,
    db: Session = Depends(get_db)
):
    """
    Revokes tokens server-side in denylist and clears HttpOnly session cookies.
    """
    access_token = request.cookies.get("access_token")
    if access_token:
        try:
            payload = AuthService.decode_token(access_token, db, expected_type="access")
            jti = payload.get("jti")
            exp = payload.get("exp")
            if jti and exp:
                AuthService.revoke_token(jti, exp, db)
        except Exception:
            pass

    response.delete_cookie(key="access_token", path="/")
    response.delete_cookie(key="refresh_token", path="/api/auth")

    return {"status": "logged_out", "message": "Session terminated and tokens revoked."}


@router.get("/me", response_model=UserResponse)
def get_current_user_profile(current_user: User = Depends(get_current_user)):
    """Returns profile and role permissions of current authenticated session."""
    return UserResponse.model_validate(current_user)


@router.get("/audit", response_model=List[AuditLogResponse])
def get_audit_trail(
    limit: int = 50,
    db: Session = Depends(get_db),
    admin_user: User = Depends(require_role("admin"))
):
    """Admin-only endpoint to inspect immutable security and remediation audit log."""
    logs = db.query(AuditLog).order_by(AuditLog.timestamp.desc()).limit(limit).all()
    return [AuditLogResponse.model_validate(log) for log in logs]
