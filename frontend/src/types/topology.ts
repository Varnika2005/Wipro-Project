export interface Device {
  id: string;
  name: string;
  type: 'router' | 'switch' | 'server' | 'gateway';
  ip_address: string;
  tier: 'core' | 'distribution' | 'access' | 'datacenter';
  status: 'healthy' | 'degraded' | 'critical' | 'offline';
  pos_x: number;
  pos_y: number;
  cpu_capacity_ghz: number;
  ram_capacity_gb: number;
  max_bandwidth_mbps: number;
  created_at: string;
}

export interface Link {
  id: string;
  source_device_id: string;
  target_device_id: string;
  bandwidth_capacity_mbps: number;
  baseline_latency_ms: number;
  status: 'active' | 'congested' | 'degraded' | 'down';
  created_at: string;
}

export interface TopologySummary {
  total_devices: number;
  healthy_devices: number;
  degraded_devices: number;
  critical_devices: number;
  offline_devices: number;
  total_links: number;
  active_alarms: number;
}

export interface TopologyResponse {
  devices: Device[];
  links: Link[];
  summary: TopologySummary;
}
