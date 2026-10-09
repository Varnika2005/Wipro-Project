from pydantic import BaseModel, ConfigDict
from typing import List, Optional
from datetime import datetime


class AlarmOut(BaseModel):
    id: str
    device_id: str
    incident_id: Optional[str]
    timestamp: datetime
    severity: str
    metric_triggered: str
    observed_value: float
    threshold_value: float
    message: str
    status: str
    is_root_cause: bool
    model_config = ConfigDict(from_attributes=True)


class CausalNode(BaseModel):
    device_id: str
    device_name: str
    role: str  # "primary_root_cause" or "secondary_symptom"
    fault_type: str
    alarms: List[AlarmOut]
    impact_level: str


class IncidentOut(BaseModel):
    id: str
    primary_device_id: str
    predicted_fault_category: str
    confidence_score: float
    status: str
    primary_cause_summary: str
    recommended_action: str
    started_at: datetime
    resolved_at: Optional[datetime]
    root_cause_device: str
    cascading_impact_count: int
    blast_radius: List[str]  # impacted downstream node IDs
    model_config = ConfigDict(from_attributes=True)


class RCAResponse(BaseModel):
    total_active_alarms: int
    root_cause_alarms_count: int
    symptom_alarms_count: int
    incidents: List[IncidentOut]
    root_cause_devices: List[str]
    cascading_symptoms: List[AlarmOut]
    causal_explanation: str
