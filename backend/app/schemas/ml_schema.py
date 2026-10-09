from pydantic import BaseModel, Field
from typing import List, Dict, Optional, Any
from datetime import datetime
from app.schemas.telemetry_schema import TelemetryFeatures


class FeatureContribution(BaseModel):
    feature_name: str
    feature_value: float
    importance_pct: float
    direction: str  # "increases_risk" or "decreases_risk"
    explanation: str


class PredictionRequest(BaseModel):
    device_id: Optional[str] = None
    metrics: Optional[TelemetryFeatures] = None


class PredictionResponse(BaseModel):
    device_id: Optional[str] = None
    predicted_category: str
    fault_detected: bool
    risk_score: float = Field(..., ge=0.0, le=100.0)  # 0 to 100 risk index
    confidence: float = Field(..., ge=0.0, le=1.0)
    class_probabilities: Dict[str, float]
    top_contributions: List[FeatureContribution]
    recommended_action: str
    explanation_summary: str


class TrainRequest(BaseModel):
    model_type: str = "random_forest"  # "random_forest" or "gradient_boosting"
    samples_per_class: int = 400
    test_split: float = 0.2
    random_seed: int = 42


class ClassMetric(BaseModel):
    precision: float
    recall: float
    f1_score: float
    support: int


class EvaluationReportResponse(BaseModel):
    model_id: str
    algorithm: str
    accuracy: float
    macro_precision: float
    macro_recall: float
    macro_f1: float
    total_test_samples: int
    labels: List[str]
    confusion_matrix: List[List[int]]
    per_class_metrics: Dict[str, ClassMetric]
    trained_at: datetime
