import type { TelemetryFeatures } from './telemetry';

export interface RemediationSimulateResponse {
  action_type: string;
  target_device_id: string;
  current_risk_score: number;
  projected_risk_score: number;
  risk_reduction_pct: number;
  current_metrics: TelemetryFeatures;
  projected_metrics: TelemetryFeatures;
  projected_status: string;
  resolution_confidence: number;
  remediation_rationale: string;
  safety_assessment: string;
}

export interface RemediationApplyResponse {
  success: boolean;
  device_id: string;
  updated_status: string;
  alarms_resolved_count: number;
  message: string;
}
