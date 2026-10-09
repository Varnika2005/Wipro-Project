from pydantic import BaseModel, ConfigDict
from typing import List, Optional
from datetime import datetime


class DeviceBase(BaseModel):
    id: str
    name: str
    type: str
    ip_address: str
    tier: str
    status: str
    pos_x: float
    pos_y: float
    cpu_capacity_ghz: float
    ram_capacity_gb: float
    max_bandwidth_mbps: float


class DeviceOut(DeviceBase):
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)


class LinkBase(BaseModel):
    id: str
    source_device_id: str
    target_device_id: str
    bandwidth_capacity_mbps: float
    baseline_latency_ms: float
    status: str


class LinkOut(LinkBase):
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)


class TopologySummary(BaseModel):
    total_devices: int
    healthy_devices: int
    degraded_devices: int
    critical_devices: int
    offline_devices: int
    total_links: int
    active_alarms: int


class TopologyResponse(BaseModel):
    devices: List[DeviceOut]
    links: List[LinkOut]
    summary: TopologySummary
