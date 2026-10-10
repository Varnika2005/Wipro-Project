from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.services.rca_service import RCAService
from app.dependencies.auth import get_current_user
from app.models.user import User
from app.schemas.rca_schema import RCAResponse, IncidentOut, AlarmOut

router = APIRouter(prefix="/rca", tags=["Root Cause Analysis"])


@router.get("/correlate", response_model=RCAResponse)
def correlate_network_alarms(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Performs graph-based alarm storm correlation, traces topological blast radius,
    and isolates primary root-cause devices from cascading symptoms.
    """
    try:
        res = RCAService.correlate_alarms(db)
        return RCAResponse(
            total_active_alarms=res["total_active_alarms"],
            root_cause_alarms_count=res["root_cause_alarms_count"],
            symptom_alarms_count=res["symptom_alarms_count"],
            incidents=[IncidentOut(**inc) for inc in res["incidents"]],
            root_cause_devices=res["root_cause_devices"],
            cascading_symptoms=[AlarmOut.model_validate(a) for a in res["cascading_symptoms"]],
            causal_explanation=res["causal_explanation"],
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Alarm correlation failed: {str(e)}")
