from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional

from app.database import get_db
from app.models.device import Device
from app.models.telemetry import TelemetryMetric
from app.services.simulation_service import SimulationEngine
from app.dependencies.auth import require_role, get_current_user
from app.models.user import User
from app.schemas.telemetry_schema import (
    SimulationScenarioRequest,
    SimulationScenarioResponse,
    TelemetryHistoryResponse,
    TelemetryOut,
)

router = APIRouter(prefix="", tags=["Telemetry & Simulation"])


@router.post("/simulation/scenario", response_model=SimulationScenarioResponse)
def inject_simulation_scenario(
    req: SimulationScenarioRequest,
    db: Session = Depends(get_db),
    operator: User = Depends(require_role("operator"))
):
    """Triggers a deterministic network fault scenario or normal baseline."""
    try:
        res = SimulationEngine.apply_scenario(
            db=db,
            scenario=req.scenario,
            target_device_id=req.target_device_id
        )
        return SimulationScenarioResponse(
            status=res["status"],
            scenario=res["scenario"],
            impacted_devices=res.get("impacted_devices", []),
            message=res["message"],
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/simulation/reset", response_model=SimulationScenarioResponse)
def reset_simulation(
    db: Session = Depends(get_db),
    operator: User = Depends(require_role("operator"))
):
    """Resets all network devices to nominal baseline operating conditions."""
    res = SimulationEngine.apply_scenario(db, "normal")
    return SimulationScenarioResponse(
        status=res["status"],
        scenario="normal",
        impacted_devices=res.get("impacted_devices", []),
        message=res["message"],
    )


@router.get("/telemetry/history", response_model=TelemetryHistoryResponse)
def get_telemetry_history(
    device_id: str = Query(..., description="Device identifier, e.g. rtr-core-01"),
    limit: int = Query(30, ge=1, le=200),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Retrieves time series telemetry metrics for charting."""
    device = db.query(Device).filter(Device.id == device_id).first()
    if not device:
        raise HTTPException(status_code=404, detail=f"Device '{device_id}' not found")

    metrics = (
        db.query(TelemetryMetric)
        .filter(TelemetryMetric.device_id == device_id)
        .order_by(TelemetryMetric.timestamp.desc())
        .limit(limit)
        .all()
    )
    # Return chronologically ascending for charts
    metrics_chronological = sorted(metrics, key=lambda m: m.timestamp)

    return TelemetryHistoryResponse(
        device_id=device_id,
        metrics=[TelemetryOut.model_validate(m) for m in metrics_chronological]
    )
