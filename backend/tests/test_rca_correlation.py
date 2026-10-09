import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.database import Base
from app.utils.seed_data import seed_topology
from app.services.simulation_service import SimulationEngine
from app.services.rca_service import RCAService
from app.models.alarm import AlarmEvent


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


def test_rca_upstream_root_cause_isolation(test_db):
    # Inject hardware failure on upstream core router
    SimulationEngine.apply_scenario(test_db, "hardware_failure", target_device_id="rtr-core-01", seed=42)

    # Run RCA correlation
    rca_res = RCAService.correlate_alarms(test_db)

    assert rca_res["total_active_alarms"] > 0
    assert "rtr-core-01" in rca_res["root_cause_devices"]
    assert len(rca_res["incidents"]) >= 1

    primary_inc = rca_res["incidents"][0]
    assert primary_inc["root_cause_device"] == "rtr-core-01"
    # Downstream nodes like sw-dist-01 or sw-dist-03 are in blast radius
    assert len(primary_inc["blast_radius"]) > 0

    # Ensure root cause alarms vs symptom alarms separation
    db_alarms = test_db.query(AlarmEvent).filter(AlarmEvent.status == "active").all()
    core_alarms = [a for a in db_alarms if a.device_id == "rtr-core-01"]
    downstream_alarms = [a for a in db_alarms if a.device_id != "rtr-core-01"]

    for ca in core_alarms:
        assert ca.is_root_cause is True

    for da in downstream_alarms:
        assert da.is_root_cause is False
