import datetime
from sqlalchemy import Column, Integer, String, Float, DateTime, Boolean, Text
from app.database import Base


class MLModelArtifact(Base):
    __tablename__ = "ml_models"

    id = Column(String, primary_key=True)               # e.g., "rf-fault-detector-v1"
    algorithm_name = Column(String, nullable=False)     # "RandomForestClassifier"
    artifact_path = Column(String, nullable=False)      # Path to joblib file
    scaler_path = Column(String, nullable=True)
    trained_at = Column(DateTime, default=datetime.datetime.utcnow)
    samples_count = Column(Integer, default=0)
    features_json = Column(Text, nullable=False)        # JSON array of input feature names
    classes_json = Column(Text, nullable=False)         # JSON array of target fault classes
    is_active = Column(Boolean, default=True)


class ModelEvaluation(Base):
    __tablename__ = "model_evaluations"

    id = Column(Integer, primary_key=True, autoincrement=True)
    model_id = Column(String, nullable=False)
    accuracy = Column(Float, nullable=False)
    macro_precision = Column(Float, nullable=False)
    macro_recall = Column(Float, nullable=False)
    macro_f1 = Column(Float, nullable=False)
    confusion_matrix_json = Column(Text, nullable=False)       # 2D array serialized as JSON
    classification_report_json = Column(Text, nullable=False)  # Dict serialized as JSON
    evaluated_at = Column(DateTime, default=datetime.datetime.utcnow)
