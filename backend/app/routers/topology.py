from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.database import get_db
from app.models.device import Device, Link
from app.models.alarm import AlarmEvent
from app.dependencies.auth import get_current_user
from app.models.user import User
from app.schemas.topology_schema import (
    TopologyResponse, DeviceOut, LinkOut, TopologySummary
)

router = APIRouter(prefix="/topology", tags=["Topology"])


@router.get("", response_model=TopologyResponse)
def get_topology(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Fetches the complete network graph, active device statuses, and link edges."""
    devices = db.query(Device).all()
    links = db.query(Link).all()

    total = len(devices)
    healthy = sum(1 for d in devices if d.status == "healthy")
    degraded = sum(1 for d in devices if d.status == "degraded")
    critical = sum(1 for d in devices if d.status == "critical")
    offline = sum(1 for d in devices if d.status == "offline")
    active_alarms = db.query(AlarmEvent).filter(AlarmEvent.status == "active").count()

    summary = TopologySummary(
        total_devices=total,
        healthy_devices=healthy,
        degraded_devices=degraded,
        critical_devices=critical,
        offline_devices=offline,
        total_links=len(links),
        active_alarms=active_alarms,
    )

    return TopologyResponse(
        devices=[DeviceOut.model_validate(d) for d in devices],
        links=[LinkOut.model_validate(l) for l in links],
        summary=summary,
    )


@router.get("/devices/{device_id}")
def get_device_details(
    device_id: str, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Returns detailed device information, active alarms, and latest telemetry."""
    device = db.query(Device).filter(Device.id == device_id).first()
    if not device:
        raise HTTPException(status_code=404, detail=f"Device '{device_id}' not found")

    alarms = (
        db.query(AlarmEvent)
        .filter(AlarmEvent.device_id == device_id)
        .order_by(AlarmEvent.timestamp.desc())
        .limit(10)
        .all()
    )

    latest_telemetry = device.telemetry[-1] if device.telemetry else None

    return {
        "device": DeviceOut.model_validate(device),
        "active_alarms_count": len([a for a in alarms if a.status == "active"]),
        "recent_alarms": alarms,
        "latest_telemetry": latest_telemetry,
    }
