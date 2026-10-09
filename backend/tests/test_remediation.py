import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.database import Base
from app.utils.seed_data import seed_topology
from app.models.device import Device
from app.models.alarm import AlarmEvent
from app.services.simulation_service import SimulationEngine
from app.services.remediation_service import RemediationService


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


def test_remediation_simulation_safety(test_db):
    target = "rtr-core-01"
    # Inject hardware failure
    SimulationEngine.apply_scenario(test_db, "hardware_failure", target_device_id=target, seed=55)

    # Device is critical in DB
    dev = test_db.query(Device).filter(Device.id == target).first()
    assert dev.status == "critical"

    # Simulate remediation (What-If sandbox)
    sim_res = RemediationService.simulate(test_db, target, "restart_service")

    assert sim_res["target_device_id"] == target
    assert sim_res["current_risk_score"] > 60.0
    assert sim_res["projected_risk_score"] < 40.0
    assert sim_res["risk_reduction_pct"] > 50.0

    # Ensure DB was NOT mutated by simulation alone! (Safe mode)
    test_db.refresh(dev)
    assert dev.status == "critical"


def test_remediation_apply_execution(test_db):
    target = "rtr-core-01"
    SimulationEngine.apply_scenario(test_db, "hardware_failure", target_device_id=target, seed=55)

    # Apply remediation
    apply_res = RemediationService.apply(test_db, target, "restart_service")
    assert apply_res["success"] is True
    assert apply_res["updated_status"] == "healthy"

    # Check device is healthy in DB
    dev = test_db.query(Device).filter(Device.id == target).first()
    assert dev.status == "healthy"

    # Check active alarms on target are resolved
    active_alarms = test_db.query(AlarmEvent).filter(
        AlarmEvent.device_id == target, AlarmEvent.status == "active"
    ).all()
    assert len(active_alarms) == 0
