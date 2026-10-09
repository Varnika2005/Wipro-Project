import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.database import Base
from app.models.device import Device, Link
from app.models.alarm import AlarmEvent
from app.utils.seed_data import seed_topology
from app.services.simulation_service import SimulationEngine


@pytest.fixture
def test_db():
    engine = create_engine("sqlite:///:memory:")
    Base.metadata.create_all(bind=engine)
    TestingSession = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    db = TestingSession()
    seed_topology(db)
    try:
        yield db
    finally:
        db.close()


def test_metric_physical_boundaries():
    scenarios = ["normal", "congestion", "packet_loss", "latency_spike", "hardware_failure"]
    for sc in scenarios:
        for seed in range(10):
            sample = SimulationEngine.generate_metric_sample(sc, seed=seed)
            assert 0.0 <= sample["cpu_utilization_pct"] <= 100.0
            assert 0.0 <= sample["memory_utilization_pct"] <= 100.0
            assert 0.0 <= sample["packet_loss_rate_pct"] <= 100.0
            assert sample["latency_ms"] >= 0.5
            assert sample["jitter_ms"] >= 0.05
            assert 0.0 <= sample["bandwidth_utilization_pct"] <= 100.0
            assert sample["interface_error_rate"] >= 0.0
            assert sample["active_connections"] >= 0
            assert sample["device_temperature_c"] >= 20.0


def test_repeatability_with_seed():
    sample1 = SimulationEngine.generate_metric_sample("congestion", seed=42)
    sample2 = SimulationEngine.generate_metric_sample("congestion", seed=42)
    assert sample1 == sample2


def test_scenario_injection_and_cascading(test_db):
    target = "rtr-core-01"
    res = SimulationEngine.apply_scenario(test_db, "hardware_failure", target_device_id=target, seed=123)
    
    assert res["status"] == "success"
    assert target in res["impacted_devices"]
    assert len(res["impacted_devices"]) > 1  # Target + downstream nodes
    
    # Check target device status updated to critical
    dev = test_db.query(Device).filter(Device.id == target).first()
    assert dev.status == "critical"
    
    # Check alarms were generated
    alarms = test_db.query(AlarmEvent).filter(AlarmEvent.status == "active").all()
    assert len(alarms) > 0
    
    # Check that root cause alarm is set for target device
    root_cause_alarms = [a for a in alarms if a.device_id == target and a.is_root_cause]
    assert len(root_cause_alarms) > 0


def test_reset_scenario(test_db):
    # First inject failure
    SimulationEngine.apply_scenario(test_db, "congestion", target_device_id="sw-dist-01", seed=99)
    # Then reset
    reset_res = SimulationEngine.apply_scenario(test_db, "normal")
    assert reset_res["status"] == "success"
    
    # Verify all devices are healthy
    devices = test_db.query(Device).all()
    for d in devices:
        assert d.status == "healthy"
    
    # Verify active alarms are zero
    active_alarms = test_db.query(AlarmEvent).filter(AlarmEvent.status == "active").all()
    assert len(active_alarms) == 0
