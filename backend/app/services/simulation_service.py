import math
import random
import datetime
from typing import Dict, List, Optional, Tuple
from sqlalchemy.orm import Session
from app.models.device import Device, Link
from app.models.telemetry import TelemetryMetric
from app.models.alarm import AlarmEvent, Incident


class SimulationEngine:
    """
    Deterministic & physically grounded Network Telemetry & Fault Injection Engine.
    Simulates queueing theory, interface degradation, and cascading network failure.
    """

    # Operating thresholds for alarm generation
    THRESHOLDS = {
        "cpu_warning": 75.0,
        "cpu_critical": 90.0,
        "memory_warning": 80.0,
        "memory_critical": 92.0,
        "latency_warning": 50.0,
        "latency_critical": 120.0,
        "packet_loss_warning": 2.0,
        "packet_loss_critical": 8.0,
        "temp_warning": 70.0,
        "temp_critical": 85.0,
        "errors_warning": 10.0,
        "errors_critical": 35.0,
    }

    @staticmethod
    def generate_metric_sample(
        scenario: str,
        base_capacity_multiplier: float = 1.0,
        seed: Optional[int] = None
    ) -> Dict[str, float]:
        """
        Generates a physically realistic telemetry sample for a given scenario.
        Bounds metrics strictly to valid physical limits.
        """
        rng = random.Random(seed) if seed is not None else random

        if scenario == "normal":
            cpu = rng.uniform(12.0, 32.0)
            ram = rng.uniform(22.0, 48.0)
            loss = max(0.0, rng.gauss(0.02, 0.01))
            latency = rng.uniform(1.2, 5.8)
            jitter = rng.uniform(0.1, 0.9)
            bw = rng.uniform(15.0, 42.0)
            err_rate = 0.0
            active_conns = int(rng.uniform(80, 220))
            temp = rng.uniform(38.0, 48.0)

        elif scenario == "congestion":
            bw = rng.uniform(88.0, 99.5)
            # M/M/1 queueing delay exponential surge as utilization approaches 100%
            load_factor = bw / 100.0
            queue_multiplier = min(15.0, 1.0 / max(0.01, 1.0 - load_factor))
            latency = min(350.0, rng.uniform(35.0, 60.0) * (queue_multiplier / 3.0))
            jitter = rng.uniform(8.0, 26.0)
            loss = rng.uniform(1.5, 6.5)  # buffer tail drops
            cpu = rng.uniform(55.0, 78.0)
            ram = rng.uniform(60.0, 82.0)
            err_rate = rng.uniform(2.0, 9.0)
            active_conns = int(rng.uniform(400, 950))
            temp = rng.uniform(52.0, 66.0)

        elif scenario == "packet_loss":
            loss = rng.uniform(12.0, 38.0)
            err_rate = rng.uniform(25.0, 95.0)  # CRC / framing errors
            latency = rng.uniform(14.0, 38.0)
            jitter = rng.uniform(3.0, 12.0)
            bw = rng.uniform(18.0, 45.0)
            cpu = rng.uniform(20.0, 45.0)
            ram = rng.uniform(25.0, 50.0)
            active_conns = int(rng.uniform(70, 160))
            temp = rng.uniform(40.0, 50.0)

        elif scenario == "latency_spike":
            latency = rng.uniform(160.0, 480.0)
            jitter = rng.uniform(35.0, 110.0)
            loss = rng.uniform(2.5, 9.0)
            bw = rng.uniform(30.0, 60.0)
            cpu = rng.uniform(30.0, 58.0)
            ram = rng.uniform(30.0, 55.0)
            err_rate = rng.uniform(1.0, 6.0)
            active_conns = int(rng.uniform(60, 140))
            temp = rng.uniform(42.0, 52.0)

        elif scenario == "hardware_failure":
            cpu = rng.uniform(93.0, 99.9)
            ram = rng.uniform(91.0, 98.8)
            temp = rng.uniform(82.0, 96.0)
            loss = rng.uniform(8.0, 28.0)
            latency = rng.uniform(80.0, 250.0)
            jitter = rng.uniform(20.0, 65.0)
            bw = rng.uniform(10.0, 40.0)
            err_rate = rng.uniform(15.0, 60.0)
            active_conns = int(rng.uniform(20, 80))  # dropping connections

        else:
            raise ValueError(f"Unknown scenario: {scenario}")

        # Strict physical boundaries enforcement
        return {
            "cpu_utilization_pct": round(min(100.0, max(0.0, cpu)), 2),
            "memory_utilization_pct": round(min(100.0, max(0.0, ram)), 2),
            "packet_loss_rate_pct": round(min(100.0, max(0.0, loss)), 2),
            "latency_ms": round(max(0.5, latency), 2),
            "jitter_ms": round(max(0.05, jitter), 2),
            "bandwidth_utilization_pct": round(min(100.0, max(0.0, bw)), 2),
            "interface_error_rate": round(max(0.0, err_rate), 2),
            "active_connections": max(0, active_conns),
            "device_temperature_c": round(max(20.0, temp), 2),
            "scenario_label": scenario,
        }

    @classmethod
    def check_and_create_alarms(
        cls, db: Session, device_id: str, metric_data: Dict[str, float], is_root_cause: bool = False
    ) -> List[AlarmEvent]:
        """Evaluates telemetry metrics against operational thresholds and logs alarm events."""
        alarms_created = []
        now = datetime.datetime.utcnow()

        # Helper to push alarm
        def log_alarm(metric_name: str, obs_val: float, warn_th: float, crit_th: float, label: str):
            if obs_val >= crit_th:
                severity = "critical"
                threshold = crit_th
            elif obs_val >= warn_th:
                severity = "major" if is_root_cause else "warning"
                threshold = warn_th
            else:
                return

            alarm_id = f"alm-{device_id}-{metric_name}-{int(now.timestamp())}"
            msg = f"{label} alert on {device_id}: observed {obs_val} (threshold: {threshold})"
            alarm = AlarmEvent(
                id=alarm_id,
                device_id=device_id,
                timestamp=now,
                severity=severity,
                metric_triggered=metric_name,
                observed_value=obs_val,
                threshold_value=threshold,
                message=msg,
                status="active",
                is_root_cause=is_root_cause,
            )
            db.merge(alarm)
            alarms_created.append(alarm)

        log_alarm("cpu", metric_data["cpu_utilization_pct"], cls.THRESHOLDS["cpu_warning"], cls.THRESHOLDS["cpu_critical"], "High CPU")
        log_alarm("memory", metric_data["memory_utilization_pct"], cls.THRESHOLDS["memory_warning"], cls.THRESHOLDS["memory_critical"], "High Memory")
        log_alarm("latency", metric_data["latency_ms"], cls.THRESHOLDS["latency_warning"], cls.THRESHOLDS["latency_critical"], "High Latency")
        log_alarm("packet_loss", metric_data["packet_loss_rate_pct"], cls.THRESHOLDS["packet_loss_warning"], cls.THRESHOLDS["packet_loss_critical"], "Packet Loss")
        log_alarm("temperature", metric_data["device_temperature_c"], cls.THRESHOLDS["temp_warning"], cls.THRESHOLDS["temp_critical"], "Thermal Alert")
        log_alarm("errors", metric_data["interface_error_rate"], cls.THRESHOLDS["errors_warning"], cls.THRESHOLDS["errors_critical"], "Interface CRC Errors")

        return alarms_created

    @classmethod
    def apply_scenario(
        cls,
        db: Session,
        scenario: str,
        target_device_id: Optional[str] = None,
        seed: Optional[int] = None
    ) -> Dict[str, any]:
        """
        Executes a deterministic network scenario.
        If target_device_id is provided, injects fault on target and cascades downstream symptoms.
        If scenario == 'normal', restores baseline across the whole network.
        """
        if scenario == "normal" or not target_device_id:
            # Global reset / normal state
            devices = db.query(Device).all()
            for d in devices:
                d.status = "healthy"
                sample = cls.generate_metric_sample("normal", seed=seed)
                metric = TelemetryMetric(device_id=d.id, **sample)
                db.add(metric)
            # Acknowledge / resolve active alarms
            db.query(AlarmEvent).filter(AlarmEvent.status == "active").update({"status": "resolved"})
            db.commit()
            return {
                "status": "success",
                "scenario": scenario,
                "impacted_devices": [d.id for d in devices],
                "message": "All devices reset to normal healthy baseline",
            }

        target_device = db.query(Device).filter(Device.id == target_device_id).first()
        if not target_device:
            raise ValueError(f"Device {target_device_id} not found")

        # 1. Update target device state
        target_device.status = "critical" if scenario == "hardware_failure" else "degraded"
        target_sample = cls.generate_metric_sample(scenario, seed=seed)
        t_metric = TelemetryMetric(device_id=target_device.id, **target_sample)
        db.add(t_metric)
        db.commit()

        # Primary root-cause alarms on the target device
        cls.check_and_create_alarms(db, target_device.id, target_sample, is_root_cause=True)

        # 2. Find downstream nodes in topology to simulate cascading symptoms
        impacted_downstream = []
        links = db.query(Link).all()
        downstream_ids = [l.target_device_id for l in links if l.source_device_id == target_device.id]

        for down_id in downstream_ids:
            down_device = db.query(Device).filter(Device.id == down_id).first()
            if down_device:
                down_device.status = "degraded"
                # Downstream nodes experience cascading latency & packet drop
                down_sample = cls.generate_metric_sample("latency_spike" if scenario == "hardware_failure" else "congestion", seed=seed)
                # Keep their local CPU/RAM normal unless they were the target
                down_sample["cpu_utilization_pct"] = round(random.uniform(25.0, 45.0), 2)
                down_sample["memory_utilization_pct"] = round(random.uniform(30.0, 50.0), 2)
                d_metric = TelemetryMetric(device_id=down_device.id, **down_sample)
                db.add(d_metric)
                # Secondary symptom alarms
                cls.check_and_create_alarms(db, down_device.id, down_sample, is_root_cause=False)
                impacted_downstream.append(down_device.id)

        db.commit()

        return {
            "status": "success",
            "scenario": scenario,
            "target_device": target_device.id,
            "impacted_devices": [target_device.id] + impacted_downstream,
            "message": f"Injected {scenario} on {target_device.id} with cascading impact on {len(impacted_downstream)} downstream nodes.",
        }
