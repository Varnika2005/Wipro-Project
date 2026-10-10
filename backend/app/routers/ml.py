from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import Dict, Any

from app.database import get_db
from app.models.device import Device
from app.services.ml_service import MLService
from app.services.explainer_service import ExplainerService
from app.dependencies.auth import require_role, get_current_user
from app.models.user import User
from app.schemas.ml_schema import (
    TrainRequest,
    EvaluationReportResponse,
    PredictionRequest,
    PredictionResponse,
    FeatureContribution,
)

router = APIRouter(prefix="/ml", tags=["Machine Learning"])


@router.post("/train", response_model=EvaluationReportResponse)
def train_model(
    req: TrainRequest, 
    db: Session = Depends(get_db),
    admin_user: User = Depends(require_role("admin"))
):
    """Trains a new scikit-learn classifier and persists evaluation metrics."""
    try:
        report = MLService.train_and_persist(
            db=db,
            model_type=req.model_type,
            samples_per_class=req.samples_per_class,
            test_split=req.test_split,
            random_seed=req.random_seed,
        )
        return report
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Model training failed: {str(e)}")


@router.get("/evaluation", response_model=EvaluationReportResponse)
def get_evaluation(current_user: User = Depends(get_current_user)):
    """Returns held-out test evaluation report, accuracy, precision, recall, F1, and confusion matrix."""
    try:
        return MLService.get_evaluation_report()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Could not load evaluation report: {str(e)}")


@router.post("/predict", response_model=PredictionResponse)
def predict_fault(
    req: PredictionRequest, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Predicts fault category, calibrated risk score, and feature attributions.
    Accepts either an existing device_id (uses latest telemetry) or explicit metrics dictionary.
    """
    raw_metrics: Dict[str, float] = {}

    if req.device_id:
        device = db.query(Device).filter(Device.id == req.device_id).first()
        if not device:
            raise HTTPException(status_code=404, detail=f"Device '{req.device_id}' not found")
        latest = device.telemetry[-1] if device.telemetry else None
        if not latest:
            raise HTTPException(status_code=400, detail=f"No telemetry available for '{req.device_id}'")
        raw_metrics = {
            "cpu_utilization_pct": latest.cpu_utilization_pct,
            "memory_utilization_pct": latest.memory_utilization_pct,
            "packet_loss_rate_pct": latest.packet_loss_rate_pct,
            "latency_ms": latest.latency_ms,
            "jitter_ms": latest.jitter_ms,
            "bandwidth_utilization_pct": latest.bandwidth_utilization_pct,
            "interface_error_rate": latest.interface_error_rate,
            "active_connections": float(latest.active_connections),
            "device_temperature_c": latest.device_temperature_c,
        }
    elif req.metrics:
        raw_metrics = req.metrics.model_dump()
    else:
        raise HTTPException(status_code=400, detail="Either 'device_id' or 'metrics' must be supplied")

    pred_res = MLService.predict(raw_metrics, device_id=req.device_id)
    attributions = ExplainerService.explain_prediction(raw_metrics, pred_res)
    narrative = ExplainerService.generate_narrative(
        pred_res["predicted_category"], pred_res["risk_score"], attributions
    )

    return PredictionResponse(
        device_id=req.device_id,
        predicted_category=pred_res["predicted_category"],
        fault_detected=pred_res["fault_detected"],
        risk_score=pred_res["risk_score"],
        confidence=pred_res["confidence"],
        class_probabilities=pred_res["class_probabilities"],
        top_contributions=[FeatureContribution(**a) for a in attributions[:5]],
        recommended_action=pred_res["recommended_action"],
        explanation_summary=narrative,
    )
