import datetime
from sqlalchemy import Column, String, Float, DateTime, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from app.database import Base


class Incident(Base):
    __tablename__ = "incidents"

    id = Column(String, primary_key=True, index=True)         # e.g., "inc-2026-001"
    primary_device_id = Column(String, ForeignKey("devices.id"), nullable=False)
    predicted_fault_category = Column(String, nullable=False) # e.g., "Hardware Exhaustion"
    confidence_score = Column(Float, default=0.0)             # 0.0 to 1.0
    status = Column(String, default="active")                 # "active", "mitigated", "resolved"
    primary_cause_summary = Column(String, nullable=False)
    recommended_action = Column(String, nullable=False)
    started_at = Column(DateTime, default=datetime.datetime.utcnow)
    resolved_at = Column(DateTime, nullable=True)

    alarms = relationship("AlarmEvent", back_populates="incident")


class AlarmEvent(Base):
    __tablename__ = "alarms"

    id = Column(String, primary_key=True, index=True)         # e.g., "alm-101"
    device_id = Column(String, ForeignKey("devices.id"), nullable=False, index=True)
    incident_id = Column(String, ForeignKey("incidents.id"), nullable=True)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow, index=True)
    severity = Column(String, nullable=False)                 # "critical", "major", "minor", "warning"
    metric_triggered = Column(String, nullable=False)         # "cpu", "latency", "packet_loss", "errors", "temperature"
    observed_value = Column(Float, nullable=False)
    threshold_value = Column(Float, nullable=False)
    message = Column(String, nullable=False)
    status = Column(String, default="active")                 # "active", "acknowledged", "resolved"
    is_root_cause = Column(Boolean, default=False)            # Flagged by RCA engine

    device = relationship("Device", back_populates="alarms")
    incident = relationship("Incident", back_populates="alarms")
