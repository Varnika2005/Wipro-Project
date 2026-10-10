export interface FeatureContribution {
  feature_name: string;
  friendly_name: string;
  feature_value: number;
  importance_pct: number;
  direction: 'increases_risk' | 'decreases_risk';
  explanation: string;
}

export interface PredictionResult {
  device_id?: string;
  predicted_category: string;
  fault_detected: boolean;
  risk_score: number;
  confidence: number;
  class_probabilities: Record<string, number>;
  top_contributions: FeatureContribution[];
  recommended_action: string;
  explanation_summary: string;
}

export interface ClassMetric {
  precision: number;
  recall: number;
  f1_score: number;
  support: number;
}

export interface EvaluationReport {
  model_id: string;
  algorithm: string;
  accuracy: number;
  macro_precision: number;
  macro_recall: number;
  macro_f1: number;
  total_training_samples?: number;
  total_test_samples: number;
  features?: string[];
  labels: string[];
  confusion_matrix: number[][];
  per_class_metrics: Record<string, ClassMetric>;
  trained_at: string;
  provenance?: string;
  evaluation_methodology?: string;
  is_synthetic?: boolean;
}
