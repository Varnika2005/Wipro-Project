import datetime
from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base


class TelemetryMetric(Base):
    __tablename__ = "telemetry_metrics"

    id = Column(Integer, primary_key=True, autoincrement=True, index=True)
    device_id = Column(String, ForeignKey("devices.id"), nullable=False, index=True)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow, index=True)
    
    # Core Network Telemetry Features
    cpu_utilization_pct = Column(Float, nullable=False)       # 0.0 to 100.0
    memory_utilization_pct = Column(Float, nullable=False)    # 0.0 to 100.0
    packet_loss_rate_pct = Column(Float, nullable=False)      # 0.0 to 100.0
    latency_ms = Column(Float, nullable=False)                # RTT in ms
    jitter_ms = Column(Float, nullable=False)                 # Jitter in ms
    bandwidth_utilization_pct = Column(Float, nullable=False) # 0.0 to 100.0
    interface_error_rate = Column(Float, default=0.0)         # Errors/sec
    active_connections = Column(Integer, default=100)
    device_temperature_c = Column(Float, default=45.0)        # Celsius
    
    # Ground-truth scenario tag for validation/training
    scenario_label = Column(String, default="normal")

    device = relationship("Device", back_populates="telemetry")
