export interface Alarm {
  id: string;
  device_id: string;
  incident_id?: string;
  timestamp: string;
  severity: 'critical' | 'major' | 'minor' | 'warning';
  metric_triggered: string;
  observed_value: number;
  threshold_value: number;
  message: string;
  status: 'active' | 'acknowledged' | 'resolved';
  is_root_cause: boolean;
}

export interface Incident {
  id: string;
  primary_device_id: string;
  predicted_fault_category: string;
  confidence_score: number;
  status: string;
  primary_cause_summary: string;
  recommended_action: string;
  started_at: string;
  resolved_at?: string;
  root_cause_device: string;
  cascading_impact_count: number;
  blast_radius: string[];
}

export interface RCAResponse {
  total_active_alarms: number;
  root_cause_alarms_count: number;
  symptom_alarms_count: number;
  incidents: Incident[];
  root_cause_devices: string[];
  cascading_symptoms: Alarm[];
  causal_explanation: string;
}
