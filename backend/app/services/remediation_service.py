from typing import Dict, Any, Optional
import datetime
from sqlalchemy.orm import Session

from app.models.device import Device
from app.models.telemetry import TelemetryMetric
from app.models.alarm import AlarmEvent, Incident
from app.services.ml_service import MLService
from app.services.simulation_service import SimulationEngine


REMEDIATION_POLICIES = {
    "reroute_traffic": {
        "description": "Dynamic traffic diversion to secondary multi-chassis core trunk.",
        "effect": "Relieves link congestion and reduces buffer queue delay by 85%.",
        "safety": "Zero-downtime policy. Automated convergence within 50ms via BGP fast-reroute.",
        "projected_overrides": {
            "bandwidth_utilization_pct": 28.5,
            "latency_ms": 3.8,
            "jitter_ms": 0.4,
            "packet_loss_rate_pct": 0.01,
        }
    },
    "restart_service": {
        "description": "Graceful daemon restart and memory heap garbage collection.",
        "effect": "Terminates leaked worker processes and restores nominal CPU & RAM bounds.",
        "safety": "Sub-second graceful restart on secondary control-plane plane.",
        "projected_overrides": {
            "cpu_utilization_pct": 21.0,
            "memory_utilization_pct": 32.0,
            "device_temperature_c": 44.0,
            "packet_loss_rate_pct": 0.02,
            "latency_ms": 3.4,
            "jitter_ms": 0.4,
            "interface_error_rate": 0.0,
        }
    },
    "throttle_rate": {
        "description": "Token-bucket QoS policing and aggressive burst rate-limiting.",
        "effect": "Eliminates tail drops by bounding egress packet transmission.",
        "safety": "Applies strictly to non-critical bulk transfer VLANs.",
        "projected_overrides": {
            "packet_loss_rate_pct": 0.02,
            "interface_error_rate": 0.0,
            "bandwidth_utilization_pct": 45.0,
            "latency_ms": 4.5,
            "jitter_ms": 0.6,
        }
    },
    "switch_backup_link": {
        "description": "Physical link failover to dark-fiber redundant standby path.",
        "effect": "Bypasses degraded cable runs and clears CRC framing errors.",
        "safety": "Redundant interface already pre-warmed in hot standby.",
        "projected_overrides": {
            "latency_ms": 2.2,
            "jitter_ms": 0.2,
            "packet_loss_rate_pct": 0.0,
            "interface_error_rate": 0.0,
            "bandwidth_utilization_pct": 35.0,
        }
    },
    "cool_system": {
        "description": "Fan speed boost & secondary airflow cooling cycle.",
        "effect": "Reduces thermal levels from critical threshold back to nominal range.",
        "safety": "Environmental controller adjustment with no network disruption.",
        "projected_overrides": {
            "device_temperature_c": 42.5,
            "cpu_utilization_pct": 25.0,
        }
    }
}


class RemediationService:
    """
    Counterfactual Digital Twin Remediation Sandbox.
    Simulates proposed actions safely and applies confirmed playbooks to resolve network faults.
    """

    @classmethod
    def simulate(
        cls,
        db: Session,
        target_device_id: str,
        action_type: str
    ) -> Dict[str, Any]:
        """
        Non-destructive What-If digital twin simulation.
        Evaluates projected impact on fault risk using the real ML model.
        """
        device = db.query(Device).filter(Device.id == target_device_id).first()
        if not device:
            raise ValueError(f"Device {target_device_id} not found")

        if action_type not in REMEDIATION_POLICIES:
            raise ValueError(f"Unknown or unsupported remediation action: '{action_type}'")
        policy = REMEDIATION_POLICIES[action_type]

        # Retrieve current metric
        latest = device.telemetry[-1] if device.telemetry else None
        if not latest:
            current_raw = SimulationEngine.generate_metric_sample("normal")
        else:
            current_raw = {
                "cpu_utilization_pct": latest.cpu_utilization_pct,
                "memory_utilization_pct": latest.memory_utilization_pct,
                "packet_loss_rate_pct": latest.packet_loss_rate_pct,
                "latency_ms": latest.latency_ms,
                "jitter_ms": latest.jitter_ms,
                "bandwidth_utilization_pct": latest.bandwidth_utilization_pct,
                "interface_error_rate": latest.interface_error_rate,
                "active_connections": latest.active_connections,
                "device_temperature_c": latest.device_temperature_c,
            }

        # Current risk prediction
        curr_pred = MLService.predict(current_raw, device_id=target_device_id)

        # Synthesize projected metric by applying remediation overrides
        projected_raw = dict(current_raw)
        for k, v in policy["projected_overrides"].items():
            projected_raw[k] = v

        # Re-evaluate with real ML model
        proj_pred = MLService.predict(projected_raw, device_id=target_device_id)

        curr_risk = curr_pred["risk_score"]
        proj_risk = proj_pred["risk_score"]
        risk_reduction = round(max(0.0, curr_risk - proj_risk), 2)
        reduction_pct = round((risk_reduction / max(0.1, curr_risk)) * 100.0, 1) if curr_risk > 0 else 0.0

        projected_status = "healthy" if proj_risk < 35.0 else ("degraded" if proj_risk < 70.0 else "critical")
        confidence = proj_pred["confidence"]

        return {
            "action_type": action_type,
            "target_device_id": target_device_id,
            "current_risk_score": curr_risk,
            "projected_risk_score": proj_risk,
            "risk_reduction_pct": reduction_pct,
            "current_metrics": current_raw,
            "projected_metrics": projected_raw,
            "projected_status": projected_status,
            "resolution_confidence": round(confidence, 4),
            "remediation_rationale": f"{policy['description']} -> {policy['effect']}",
            "safety_assessment": policy["safety"],
        }

    @classmethod
    def apply(
        cls,
        db: Session,
        target_device_id: str,
        action_type: str
    ) -> Dict[str, Any]:
        """
        Applies remediation action to active operational state.
        Restores device status, commits nominal metrics, and resolves active alarms.
        """
        device = db.query(Device).filter(Device.id == target_device_id).first()
        if not device:
            raise ValueError(f"Device {target_device_id} not found")

        if action_type not in REMEDIATION_POLICIES:
            raise ValueError(f"Unknown or unsupported remediation action: '{action_type}'")

        # 1. Update status
        device.status = "healthy"

        # 2. Append new healthy telemetry point
        healthy_sample = SimulationEngine.generate_metric_sample("normal")
        metric = TelemetryMetric(device_id=device.id, **healthy_sample)
        db.add(metric)

        # 3. Resolve active alarms on this device
        alarms = db.query(AlarmEvent).filter(
            AlarmEvent.device_id == target_device_id,
            AlarmEvent.status == "active"
        ).all()
        for a in alarms:
            a.status = "resolved"

        # 4. Resolve associated incident if primary
        incidents = db.query(Incident).filter(
            Incident.primary_device_id == target_device_id,
            Incident.status == "active"
        ).all()
        for inc in incidents:
            inc.status = "resolved"
            inc.resolved_at = datetime.datetime.utcnow()

        db.commit()

        return {
            "success": True,
            "device_id": target_device_id,
            "updated_status": "healthy",
            "alarms_resolved_count": len(alarms),
            "message": f"Successfully applied '{action_type}' to {target_device_id}. Resolved {len(alarms)} active alarm(s).",
        }
