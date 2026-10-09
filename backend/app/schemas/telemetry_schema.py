from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional
from datetime import datetime


class TelemetryFeatures(BaseModel):
    cpu_utilization_pct: float = Field(..., ge=0.0, le=100.0)
    memory_utilization_pct: float = Field(..., ge=0.0, le=100.0)
    packet_loss_rate_pct: float = Field(..., ge=0.0, le=100.0)
    latency_ms: float = Field(..., ge=0.0)
    jitter_ms: float = Field(..., ge=0.0)
    bandwidth_utilization_pct: float = Field(..., ge=0.0, le=100.0)
    interface_error_rate: float = Field(default=0.0, ge=0.0)
    active_connections: int = Field(default=100, ge=0)
    device_temperature_c: float = Field(default=45.0, ge=0.0)


class TelemetryOut(TelemetryFeatures):
    id: int
    device_id: str
    timestamp: datetime
    scenario_label: str
    model_config = ConfigDict(from_attributes=True)


class SimulationScenarioRequest(BaseModel):
    scenario: str  # "normal", "congestion", "packet_loss", "latency_spike", "hardware_failure"
    target_device_id: Optional[str] = None
    duration_seconds: int = 60


class SimulationScenarioResponse(BaseModel):
    status: str
    scenario: str
    impacted_devices: List[str]
    message: str


class TelemetryHistoryResponse(BaseModel):
    device_id: str
    metrics: List[TelemetryOut]
