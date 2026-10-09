import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.database import Base, engine, SessionLocal
from app.utils.seed_data import seed_topology
from app.models.user import User, AuditLog
from app.services.auth_service import FAILED_ATTEMPTS

client = TestClient(app)


@pytest.fixture(autouse=True)
def setup_auth_db():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    seed_topology(db, overwrite=True)
    db.close()
    FAILED_ATTEMPTS.clear()
    client.cookies.clear()
    yield
    client.cookies.clear()


def test_auth_login_success_and_cookie_delivery():
    # Login as operator
    res = client.post("/api/auth/login", json={
        "username": "operator",
        "password": "Operator@NetSentinel2026!"
    })
    assert res.status_code == 200
    data = res.json()
    assert data["username"] == "operator"
    assert data["role"] == "operator"

    # Verify cookies
    assert "access_token" in res.cookies
    assert "refresh_token" in res.cookies


def test_auth_login_invalid_credentials_and_rate_limiting():
    # 1. Invalid attempt
    res = client.post("/api/auth/login", json={
        "username": "admin",
        "password": "WrongPassword123!"
    })
    assert res.status_code == 401

    # 2. Exceed rate limit (5 failed attempts)
    for _ in range(4):
        client.post("/api/auth/login", json={
            "username": "admin",
            "password": "WrongPassword123!"
        })

    # 6th attempt should be blocked by rate limiter
    blocked_res = client.post("/api/auth/login", json={
        "username": "admin",
        "password": "WrongPassword123!"
    })
    assert blocked_res.status_code == 429
    assert "Too many failed login attempts" in blocked_res.json()["detail"]


def test_rbac_endpoint_guard_enforcement():
    # 1. Unauthenticated request to remediation simulate -> 401
    unauth_res = client.post("/api/remediation/simulate", json={
        "target_device_id": "rtr-core-01",
        "action_type": "restart_service"
    })
    assert unauth_res.status_code == 401

    # 2. Login as Viewer
    viewer_login = client.post("/api/auth/login", json={
        "username": "viewer",
        "password": "Viewer@NetSentinel2026!"
    })
    assert viewer_login.status_code == 200

    # Viewer attempts remediation simulate -> 403 Forbidden
    viewer_sim = client.post("/api/remediation/simulate", json={
        "target_device_id": "rtr-core-01",
        "action_type": "restart_service"
    })
    assert viewer_sim.status_code == 403
    assert "requires 'operator' privilege" in viewer_sim.json()["detail"]

    # 3. Login as Operator
    client.post("/api/auth/logout")
    client.post("/api/auth/login", json={
        "username": "operator",
        "password": "Operator@NetSentinel2026!"
    })

    # Operator attempts remediation simulate -> 200 OK
    operator_sim = client.post("/api/remediation/simulate", json={
        "target_device_id": "rtr-core-01",
        "action_type": "restart_service"
    })
    assert operator_sim.status_code == 200

    # Operator attempts remediation apply (Admin only) -> 403 Forbidden
    operator_apply = client.post("/api/remediation/apply", json={
        "target_device_id": "rtr-core-01",
        "action_type": "restart_service"
    })
    assert operator_apply.status_code == 403
    assert "requires 'admin' privilege" in operator_apply.json()["detail"]

    # 4. Login as Admin
    client.post("/api/auth/logout")
    client.post("/api/auth/login", json={
        "username": "admin",
        "password": "Admin@NetSentinel2026!"
    })

    # Admin attempts remediation apply -> 200 OK
    admin_apply = client.post("/api/remediation/apply", json={
        "target_device_id": "rtr-core-01",
        "action_type": "restart_service"
    })
    assert admin_apply.status_code == 200
    assert admin_apply.json()["success"] is True

    # Verify structured audit log entry was created
    audit_res = client.get("/api/auth/audit")
    assert audit_res.status_code == 200
    audit_logs = audit_res.json()
    assert len(audit_logs) >= 1
    assert any(log["action"] == "REMEDIATION_APPLIED" for log in audit_logs)


def test_token_sliding_refresh_and_logout():
    # Login
    login_res = client.post("/api/auth/login", json={
        "username": "admin",
        "password": "Admin@NetSentinel2026!"
    })
    assert login_res.status_code == 200

    # Call refresh
    refresh_res = client.post("/api/auth/refresh")
    assert refresh_res.status_code == 200

    # Call me
    me_res = client.get("/api/auth/me")
    assert me_res.status_code == 200
    assert me_res.json()["username"] == "admin"

    # Logout
    logout_res = client.post("/api/auth/logout")
    assert logout_res.status_code == 200

    # Subsequent call to /me without cookies should fail with 401
    post_logout_me = client.get("/api/auth/me")
    assert post_logout_me.status_code == 401
