import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.database import Base
from app.models.device import Device, Link
from app.models.telemetry import TelemetryMetric
from app.models.alarm import AlarmEvent, Incident
from app.models.ml_model import MLModelArtifact, ModelEvaluation
from app.utils.seed_data import seed_topology, INITIAL_DEVICES, INITIAL_LINKS


@pytest.fixture
def in_memory_db():
    engine = create_engine("sqlite:///:memory:")
    Base.metadata.create_all(bind=engine)
    TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()


def test_schema_creation_and_seeding(in_memory_db):
    seed_topology(in_memory_db)
    
    devices = in_memory_db.query(Device).all()
    assert len(devices) == len(INITIAL_DEVICES)
    
    links = in_memory_db.query(Link).all()
    assert len(links) == len(INITIAL_LINKS)
    
    metrics = in_memory_db.query(TelemetryMetric).all()
    assert len(metrics) == len(INITIAL_DEVICES)
    
    # Check specific node
    core_router = in_memory_db.query(Device).filter(Device.id == "rtr-core-01").first()
    assert core_router is not None
    assert core_router.tier == "core"
    assert len(core_router.telemetry) == 1
    assert core_router.telemetry[0].cpu_utilization_pct > 0.0
