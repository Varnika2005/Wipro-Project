from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User
from app.services.remediation_service import RemediationService
from app.services.auth_service import AuthService
from app.dependencies.auth import require_role, get_current_user
from app.schemas.remediation_schema import (
    RemediationSimulateRequest,
    RemediationSimulateResponse,
    RemediationApplyRequest,
    RemediationApplyResponse,
)

router = APIRouter(prefix="/remediation", tags=["Remediation Sandbox"])


@router.post("/simulate", response_model=RemediationSimulateResponse)
def simulate_remediation_action(
    req: RemediationSimulateRequest,
    db: Session = Depends(get_db),
    user: User = Depends(require_role("operator"))
):
    """
    Evaluates what-if impact of a corrective action safely in digital twin sandbox
    without modifying real network state.
    Requires minimum 'operator' role.
    """
    try:
        res = RemediationService.simulate(
            db=db,
            target_device_id=req.target_device_id,
            action_type=req.action_type
        )
        return RemediationSimulateResponse(**res)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Simulation failed: {str(e)}")


@router.post("/apply", response_model=RemediationApplyResponse)
def apply_remediation_action(
    req: RemediationApplyRequest,
    request: Request,
    db: Session = Depends(get_db),
    admin_user: User = Depends(require_role("admin"))
):
    """
    Applies approved corrective action to restore device telemetry and resolve active alarms.
    Restricted strictly to 'admin' role. Logs immutable audit record.
    """
    try:
        res = RemediationService.apply(
            db=db,
            target_device_id=req.target_device_id,
            action_type=req.action_type
        )

        # Audit log entry
        client_ip = request.client.host if request.client else "127.0.0.1"
        AuthService.log_audit(
            db=db,
            user_id=admin_user.id,
            username=admin_user.username,
            role=admin_user.role,
            action="REMEDIATION_APPLIED",
            target_device_id=req.target_device_id,
            details=f"Policy: '{req.action_type}'. Status: healthy. Alarms resolved: {res['alarms_resolved_count']}",
            ip_address=client_ip,
        )

        return RemediationApplyResponse(**res)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Remediation apply failed: {str(e)}")
