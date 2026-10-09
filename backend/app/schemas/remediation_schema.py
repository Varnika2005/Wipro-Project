from pydantic import BaseModel
from typing import List, Dict, Optional
from app.schemas.telemetry_schema import TelemetryFeatures


class RemediationSimulateRequest(BaseModel):
    action_type: str  # "reroute_traffic", "restart_service", "throttle_rate", "switch_backup_link", "cool_system"
    target_device_id: str


class RemediationSimulateResponse(BaseModel):
    action_type: str
    target_device_id: str
    current_risk_score: float
    projected_risk_score: float
    risk_reduction_pct: float
    current_metrics: TelemetryFeatures
    projected_metrics: TelemetryFeatures
    projected_status: str
    resolution_confidence: float
    remediation_rationale: str
    safety_assessment: str


class RemediationApplyRequest(BaseModel):
    action_type: str
    target_device_id: str


class RemediationApplyResponse(BaseModel):
    success: bool
    device_id: str
    updated_status: str
    alarms_resolved_count: int
    message: str
