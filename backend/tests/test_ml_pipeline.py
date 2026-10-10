import pytest
import os
import json
from app.services.ml_service import MLService, TARGET_CLASSES, FEATURE_NAMES
from app.services.explainer_service import ExplainerService
from app.services.simulation_service import SimulationEngine


def test_dataset_generation():
    samples_per_class = 60
    df, y = MLService.generate_dataset(samples_per_class=samples_per_class, random_seed=42)
    
    assert len(df) == samples_per_class * len(TARGET_CLASSES)
    assert len(y) == samples_per_class * len(TARGET_CLASSES)
    assert list(df.columns) == FEATURE_NAMES
    assert not df.isnull().values.any()
    
    # Check class balance
    counts = y.value_counts().to_dict()
    for c in TARGET_CLASSES:
        assert counts[c] == samples_per_class


def test_model_training_and_held_out_evaluation():
    eval_result = MLService.train_and_persist(
        model_type="random_forest",
        samples_per_class=120,
        test_split=0.2,
        random_seed=42
    )
    
    assert eval_result["model_id"].startswith("netsentinel-random_forest")
    assert eval_result["accuracy"] >= 0.85
    assert eval_result["macro_f1"] >= 0.85
    assert len(eval_result["labels"]) == len(TARGET_CLASSES)
    
    # Verify confusion matrix
    cm = eval_result["confusion_matrix"]
    assert len(cm) == len(TARGET_CLASSES)
    for row in cm:
        assert len(row) == len(TARGET_CLASSES)
        assert sum(row) > 0  # non-empty rows


def test_fault_prediction_and_risk_scoring():
    # 1. Healthy sample test
    normal_sample = SimulationEngine.generate_metric_sample("normal", seed=10)
    normal_pred = MLService.predict(normal_sample)
    assert normal_pred["predicted_category"] == "normal"
    assert normal_pred["risk_score"] < 40.0
    assert not normal_pred["fault_detected"]
    
    # 2. Hardware failure sample test
    hw_sample = SimulationEngine.generate_metric_sample("hardware_failure", seed=10)
    hw_pred = MLService.predict(hw_sample)
    assert hw_pred["predicted_category"] == "hardware_failure"
    assert hw_pred["risk_score"] >= 70.0
    assert hw_pred["fault_detected"]
    
    # 3. Congestion sample test
    cong_sample = SimulationEngine.generate_metric_sample("congestion", seed=10)
    cong_pred = MLService.predict(cong_sample)
    assert cong_pred["predicted_category"] == "congestion"
    assert cong_pred["risk_score"] >= 60.0


def test_explainer_feature_attribution():
    loss_sample = SimulationEngine.generate_metric_sample("packet_loss", seed=42)
    pred = MLService.predict(loss_sample)
    attributions = ExplainerService.explain_prediction(loss_sample, pred)
    
    assert len(attributions) == len(FEATURE_NAMES)
    total_pct = sum(a["importance_pct"] for a in attributions)
    assert 99.0 <= total_pct <= 101.0  # sums to ~100%
    
    # In packet_loss scenario, packet_loss_rate_pct or interface_error_rate should be in top 2
    top_features = [attributions[0]["feature_name"], attributions[1]["feature_name"]]
    assert "packet_loss_rate_pct" in top_features or "interface_error_rate" in top_features
    
    # Check narrative
    narrative = ExplainerService.generate_narrative(pred["predicted_category"], pred["risk_score"], attributions)
    assert "Risk Score" in narrative
    assert "Packet" in narrative or "Error" in narrative
