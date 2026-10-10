from sqlalchemy.orm import Session
from app.models.device import Device, Link
from app.models.telemetry import TelemetryMetric
import datetime
import os

INITIAL_DEVICES = [
    # Edge / Gateway
    {
        "id": "gw-border-01",
        "name": "Border Gateway 01",
        "type": "gateway",
        "ip_address": "198.51.100.1",
        "tier": "core",
        "status": "healthy",
        "pos_x": 450.0,
        "pos_y": 60.0,
        "cpu_capacity_ghz": 3.6,
        "ram_capacity_gb": 32.0,
        "max_bandwidth_mbps": 20000.0,
    },
    # Core Tier
    {
        "id": "rtr-core-01",
        "name": "Core Router Alpha",
        "type": "router",
        "ip_address": "10.0.0.1",
        "tier": "core",
        "status": "healthy",
        "pos_x": 300.0,
        "pos_y": 180.0,
        "cpu_capacity_ghz": 3.8,
        "ram_capacity_gb": 64.0,
        "max_bandwidth_mbps": 40000.0,
    },
    {
        "id": "rtr-core-02",
        "name": "Core Router Beta",
        "type": "router",
        "ip_address": "10.0.0.2",
        "tier": "core",
        "status": "healthy",
        "pos_x": 600.0,
        "pos_y": 180.0,
        "cpu_capacity_ghz": 3.8,
        "ram_capacity_gb": 64.0,
        "max_bandwidth_mbps": 40000.0,
    },
    # Distribution Tier
    {
        "id": "sw-dist-01",
        "name": "Distribution Switch 01 (Campus North)",
        "type": "switch",
        "ip_address": "10.10.0.1",
        "tier": "distribution",
        "status": "healthy",
        "pos_x": 180.0,
        "pos_y": 320.0,
        "cpu_capacity_ghz": 2.4,
        "ram_capacity_gb": 16.0,
        "max_bandwidth_mbps": 10000.0,
    },
    {
        "id": "sw-dist-02",
        "name": "Distribution Switch 02 (Campus South)",
        "type": "switch",
        "ip_address": "10.20.0.1",
        "tier": "distribution",
        "status": "healthy",
        "pos_x": 450.0,
        "pos_y": 320.0,
        "cpu_capacity_ghz": 2.4,
        "ram_capacity_gb": 16.0,
        "max_bandwidth_mbps": 10000.0,
    },
    {
        "id": "sw-dist-03",
        "name": "Distribution Switch 03 (Datacenter)",
        "type": "switch",
        "ip_address": "10.30.0.1",
        "tier": "distribution",
        "status": "healthy",
        "pos_x": 720.0,
        "pos_y": 320.0,
        "cpu_capacity_ghz": 2.8,
        "ram_capacity_gb": 32.0,
        "max_bandwidth_mbps": 20000.0,
    },
    # Access & Server Tier
    {
        "id": "sw-acc-01",
        "name": "Access Switch Floor 1",
        "type": "switch",
        "ip_address": "10.10.1.1",
        "tier": "access",
        "status": "healthy",
        "pos_x": 120.0,
        "pos_y": 480.0,
        "cpu_capacity_ghz": 1.8,
        "ram_capacity_gb": 8.0,
        "max_bandwidth_mbps": 1000.0,
    },
    {
        "id": "sw-acc-02",
        "name": "Access Switch Floor 2",
        "type": "switch",
        "ip_address": "10.20.1.1",
        "tier": "access",
        "status": "healthy",
        "pos_x": 300.0,
        "pos_y": 480.0,
        "cpu_capacity_ghz": 1.8,
        "ram_capacity_gb": 8.0,
        "max_bandwidth_mbps": 1000.0,
    },
    {
        "id": "srv-app-01",
        "name": "Production App Server 01",
        "type": "server",
        "ip_address": "10.30.1.11",
        "tier": "datacenter",
        "status": "healthy",
        "pos_x": 580.0,
        "pos_y": 480.0,
        "cpu_capacity_ghz": 3.4,
        "ram_capacity_gb": 64.0,
        "max_bandwidth_mbps": 10000.0,
    },
    {
        "id": "srv-app-02",
        "name": "Production App Server 02",
        "type": "server",
        "ip_address": "10.30.1.12",
        "tier": "datacenter",
        "status": "healthy",
        "pos_x": 720.0,
        "pos_y": 480.0,
        "cpu_capacity_ghz": 3.4,
        "ram_capacity_gb": 64.0,
        "max_bandwidth_mbps": 10000.0,
    },
    {
        "id": "srv-db-01",
        "name": "Primary DB Cluster Node",
        "type": "server",
        "ip_address": "10.30.2.1",
        "tier": "datacenter",
        "status": "healthy",
        "pos_x": 860.0,
        "pos_y": 480.0,
        "cpu_capacity_ghz": 3.6,
        "ram_capacity_gb": 128.0,
        "max_bandwidth_mbps": 10000.0,
    },
    {
        "id": "srv-auth-01",
        "name": "Identity & LDAP Server",
        "type": "server",
        "ip_address": "10.30.2.20",
        "tier": "datacenter",
        "status": "healthy",
        "pos_x": 440.0,
        "pos_y": 480.0,
        "cpu_capacity_ghz": 2.8,
        "ram_capacity_gb": 32.0,
        "max_bandwidth_mbps": 5000.0,
    },
]

INITIAL_LINKS = [
    # Gateway to Core
    {"id": "link-gw-c1", "source_device_id": "gw-border-01", "target_device_id": "rtr-core-01", "bandwidth_capacity_mbps": 20000.0, "baseline_latency_ms": 1.2},
    {"id": "link-gw-c2", "source_device_id": "gw-border-01", "target_device_id": "rtr-core-02", "bandwidth_capacity_mbps": 20000.0, "baseline_latency_ms": 1.3},
    
    # Inter-Core Trunk
    {"id": "link-c1-c2", "source_device_id": "rtr-core-01", "target_device_id": "rtr-core-02", "bandwidth_capacity_mbps": 40000.0, "baseline_latency_ms": 0.8},
    
    # Core to Distribution
    {"id": "link-c1-d1", "source_device_id": "rtr-core-01", "target_device_id": "sw-dist-01", "bandwidth_capacity_mbps": 10000.0, "baseline_latency_ms": 1.5},
    {"id": "link-c2-d2", "source_device_id": "rtr-core-02", "target_device_id": "sw-dist-02", "bandwidth_capacity_mbps": 10000.0, "baseline_latency_ms": 1.5},
    {"id": "link-c1-d3", "source_device_id": "rtr-core-01", "target_device_id": "sw-dist-03", "bandwidth_capacity_mbps": 20000.0, "baseline_latency_ms": 1.1},
    {"id": "link-c2-d3", "source_device_id": "rtr-core-02", "target_device_id": "sw-dist-03", "bandwidth_capacity_mbps": 20000.0, "baseline_latency_ms": 1.1},

    # Distribution to Access / Servers
    {"id": "link-d1-a1", "source_device_id": "sw-dist-01", "target_device_id": "sw-acc-01", "bandwidth_capacity_mbps": 1000.0, "baseline_latency_ms": 2.1},
    {"id": "link-d2-a2", "source_device_id": "sw-dist-02", "target_device_id": "sw-acc-02", "bandwidth_capacity_mbps": 1000.0, "baseline_latency_ms": 2.3},
    {"id": "link-d3-app1", "source_device_id": "sw-dist-03", "target_device_id": "srv-app-01", "bandwidth_capacity_mbps": 10000.0, "baseline_latency_ms": 0.9},
    {"id": "link-d3-app2", "source_device_id": "sw-dist-03", "target_device_id": "srv-app-02", "bandwidth_capacity_mbps": 10000.0, "baseline_latency_ms": 0.9},
    {"id": "link-d3-db1", "source_device_id": "sw-dist-03", "target_device_id": "srv-db-01", "bandwidth_capacity_mbps": 10000.0, "baseline_latency_ms": 0.6},
    {"id": "link-d2-auth", "source_device_id": "sw-dist-02", "target_device_id": "srv-auth-01", "bandwidth_capacity_mbps": 5000.0, "baseline_latency_ms": 1.8},
]


def seed_topology(db: Session, overwrite: bool = False):
    """Populates the database with initial enterprise topology nodes and links."""
    existing = db.query(Device).first()
    if existing and not overwrite:
        return

    if overwrite:
        db.query(Link).delete()
        db.query(TelemetryMetric).delete()
        db.query(Device).delete()
        db.commit()

    for d in INITIAL_DEVICES:
        device = Device(**d)
        db.add(device)

    for l in INITIAL_LINKS:
        link = Link(**l)
        db.add(link)

    db.commit()

    # Seed initial baseline telemetry for each device
    now = datetime.datetime.utcnow()
    for d in INITIAL_DEVICES:
        metric = TelemetryMetric(
            device_id=d["id"],
            timestamp=now,
            cpu_utilization_pct=18.5,
            memory_utilization_pct=26.0,
            packet_loss_rate_pct=0.01,
            latency_ms=2.4,
            jitter_ms=0.3,
            bandwidth_utilization_pct=22.0,
            interface_error_rate=0.0,
            active_connections=120,
            device_temperature_c=42.0,
            scenario_label="normal",
        )
        db.add(metric)
    db.commit()

    # Seed default RBAC users if not existing
    from app.models.user import User
    from app.services.auth_service import AuthService

    admin_pass = os.getenv("INITIAL_ADMIN_PASSWORD")
    operator_pass = os.getenv("INITIAL_OPERATOR_PASSWORD")
    viewer_pass = os.getenv("INITIAL_VIEWER_PASSWORD")

    default_users = []
    if admin_pass:
        default_users.append({"id": "usr-admin-01", "username": "admin", "email": "admin@netsentinel.ai", "password": admin_pass, "role": "admin"})
    if operator_pass:
        default_users.append({"id": "usr-operator-01", "username": "operator", "email": "operator@netsentinel.ai", "password": operator_pass, "role": "operator"})
    if viewer_pass:
        default_users.append({"id": "usr-viewer-01", "username": "viewer", "email": "viewer@netsentinel.ai", "password": viewer_pass, "role": "viewer"})

    for u in default_users:
        existing_user = db.query(User).filter(User.username == u["username"]).first()
        if not existing_user:
            new_user = User(
                id=u["id"],
                username=u["username"],
                email=u["email"],
                hashed_password=AuthService.hash_password(u["password"]),
                role=u["role"],
                is_active=True,
            )
            db.add(new_user)
    db.commit()
