export interface TelemetryFeatures {
  cpu_utilization_pct: number;
  memory_utilization_pct: number;
  packet_loss_rate_pct: number;
  latency_ms: number;
  jitter_ms: number;
  bandwidth_utilization_pct: number;
  interface_error_rate: number;
  active_connections: number;
  device_temperature_c: number;
}

export interface TelemetryMetric extends TelemetryFeatures {
  id: number;
  device_id: string;
  timestamp: string;
  scenario_label: string;
}

export interface TelemetryHistoryResponse {
  device_id: string;
  metrics: TelemetryMetric[];
}

export type ScenarioType = 'normal' | 'congestion' | 'packet_loss' | 'latency_spike' | 'hardware_failure';
