import datetime
from sqlalchemy import Column, String, Float, DateTime, ForeignKey, Integer
from sqlalchemy.orm import relationship
from app.database import Base


class Device(Base):
    __tablename__ = "devices"

    id = Column(String, primary_key=True, index=True)  # e.g., "rtr-core-01"
    name = Column(String, nullable=False)              # e.g., "Core Router 1"
    type = Column(String, nullable=False)              # "router", "switch", "server", "gateway"
    ip_address = Column(String, nullable=False)        # e.g., "10.0.0.1"
    tier = Column(String, nullable=False)              # "core", "distribution", "access", "datacenter"
    status = Column(String, default="healthy")         # "healthy", "degraded", "critical", "offline"
    pos_x = Column(Float, default=0.0)                 # Topology canvas X coordinate
    pos_y = Column(Float, default=0.0)                 # Topology canvas Y coordinate
    cpu_capacity_ghz = Column(Float, default=3.2)
    ram_capacity_gb = Column(Float, default=16.0)
    max_bandwidth_mbps = Column(Float, default=10000.0)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    # Relationships
    telemetry = relationship("TelemetryMetric", back_populates="device", cascade="all, delete-orphan")
    alarms = relationship("AlarmEvent", back_populates="device", cascade="all, delete-orphan")


class Link(Base):
    __tablename__ = "links"

    id = Column(String, primary_key=True, index=True)
    source_device_id = Column(String, ForeignKey("devices.id"), nullable=False)
    target_device_id = Column(String, ForeignKey("devices.id"), nullable=False)
    bandwidth_capacity_mbps = Column(Float, default=1000.0)
    baseline_latency_ms = Column(Float, default=2.5)
    status = Column(String, default="active")          # "active", "congested", "degraded", "down"
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
