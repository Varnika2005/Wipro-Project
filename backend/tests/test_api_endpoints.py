import pytest
import os
os.environ["INITIAL_ADMIN_PASSWORD"] = "Admin@NetSentinel2026!"
os.environ["INITIAL_OPERATOR_PASSWORD"] = "Operator@NetSentinel2026!"
os.environ["INITIAL_VIEWER_PASSWORD"] = "Viewer@NetSentinel2026!"
from fastapi.testclient import TestClient
from app.main import app
from app.database import Base, engine, SessionLocal
from app.utils.seed_data import seed_topology

client = TestClient(app)


def _auth_client(role="admin"):
    """Helper to login and return cookies for the test client."""
    passwords = {
        "admin": "Admin@NetSentinel2026!",
        "operator": "Operator@NetSentinel2026!",
        "viewer": "Viewer@NetSentinel2026!"
    }
    client.post("/api/auth/logout")
    res = client.post("/api/auth/login", json={
        "username": role,
        "password": passwords.get(role, "Admin@NetSentinel2026!")
    })
    return res.cookies


@pytest.fixture(autouse=True)
def setup_db():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    seed_topology(db, overwrite=True)
    db.close()
    yield


def test_root_and_health():
    res1 = client.get("/")
    assert res1.status_code == 200
    assert res1.json()["status"] == "operational"

    res2 = client.get("/api/health")
    assert res2.status_code == 200
    assert res2.json()["status"] == "healthy"


def test_topology_endpoints():
    cookies = _auth_client("viewer")
    res = client.get("/api/topology", cookies=cookies)
    assert res.status_code == 200
    data = res.json()
    assert len(data["devices"]) >= 10
    assert len(data["links"]) >= 10
    assert data["summary"]["total_devices"] == len(data["devices"])

    # Single device
    dev_res = client.get("/api/topology/devices/rtr-core-01", cookies=cookies)
    assert dev_res.status_code == 200
    dev_data = dev_res.json()
    assert dev_data["device"]["id"] == "rtr-core-01"


def test_simulation_and_telemetry_history():
    cookies = _auth_client("operator")
    # Inject scenario
    sim_res = client.post("/api/simulation/scenario", json={
        "scenario": "packet_loss",
        "target_device_id": "sw-dist-01"
    }, cookies=cookies)
    assert sim_res.status_code == 200
    assert sim_res.json()["status"] == "success"

    # History
    hist_res = client.get("/api/telemetry/history?device_id=sw-dist-01&limit=10", cookies=cookies)
    assert hist_res.status_code == 200
    hist_data = hist_res.json()
    assert hist_data["device_id"] == "sw-dist-01"
    assert len(hist_data["metrics"]) > 0

    # Reset
    reset_res = client.post("/api/simulation/reset", cookies=cookies)
    assert reset_res.status_code == 200
    assert reset_res.json()["scenario"] == "normal"


def test_ml_evaluation_and_predict():
    cookies = _auth_client("viewer")
    # Evaluation
    eval_res = client.get("/api/ml/evaluation", cookies=cookies)
    assert eval_res.status_code == 200
    eval_data = eval_res.json()
    assert eval_data["accuracy"] > 0.8
    assert "confusion_matrix" in eval_data

    # Predict via device_id
    pred_res = client.post("/api/ml/predict", json={"device_id": "rtr-core-01"}, cookies=cookies)
    assert pred_res.status_code == 200
    pred_data = pred_res.json()
    assert "risk_score" in pred_data
    assert "predicted_category" in pred_data
    assert len(pred_data["top_contributions"]) > 0

    # Predict via raw metrics
    raw_pred_res = client.post("/api/ml/predict", json={
        "metrics": {
            "cpu_utilization_pct": 98.0,
            "memory_utilization_pct": 95.0,
            "packet_loss_rate_pct": 12.0,
            "latency_ms": 110.0,
            "jitter_ms": 25.0,
            "bandwidth_utilization_pct": 20.0,
            "interface_error_rate": 30.0,
            "active_connections": 30,
            "device_temperature_c": 88.0
        }
    }, cookies=cookies)
    assert raw_pred_res.status_code == 200
    raw_pred_data = raw_pred_res.json()
    assert raw_pred_data["predicted_category"] == "hardware_failure"
    assert raw_pred_data["risk_score"] > 80.0


def test_ml_training_rejects_invalid_configuration():
    cookies = _auth_client("admin")
    unsupported_model = client.post("/api/ml/train", json={"model_type": "neural_network"}, cookies=cookies)
    assert unsupported_model.status_code == 422

    unsafe_split = client.post("/api/ml/train", json={"test_split": 0.75}, cookies=cookies)
    assert unsafe_split.status_code == 422


def test_rca_and_remediation_endpoints():
    cookies = _auth_client("admin")
    # First inject hardware failure on core router
    client.post("/api/simulation/scenario", json={
        "scenario": "hardware_failure",
        "target_device_id": "rtr-core-01"
    }, cookies=cookies)

    # Call RCA
    rca_res = client.get("/api/rca/correlate", cookies=cookies)
    assert rca_res.status_code == 200
    rca_data = rca_res.json()
    assert rca_data["total_active_alarms"] > 0
    assert "rtr-core-01" in rca_data["root_cause_devices"]

    # Simulate remediation
    sim_rem_res = client.post("/api/remediation/simulate", json={
        "target_device_id": "rtr-core-01",
        "action_type": "restart_service"
    }, cookies=cookies)
    assert sim_rem_res.status_code == 200
    sim_rem_data = sim_rem_res.json()
    assert sim_rem_data["risk_reduction_pct"] > 40.0

    # Apply remediation
    apply_rem_res = client.post("/api/remediation/apply", json={
        "target_device_id": "rtr-core-01",
        "action_type": "restart_service"
    }, cookies=cookies)
    assert apply_rem_res.status_code == 200
    assert apply_rem_res.json()["updated_status"] == "healthy"
