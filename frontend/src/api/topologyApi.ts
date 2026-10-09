import { apiClient } from './client';
import { TopologyResponse, Device } from '../types/topology';
import { Alarm } from '../types/rca';
import { TelemetryMetric } from '../types/telemetry';

export interface DeviceDetailResponse {
  device: Device;
  active_alarms_count: number;
  recent_alarms: Alarm[];
  latest_telemetry: TelemetryMetric | null;
}

export const topologyApi = {
  getTopology: async (): Promise<TopologyResponse> => {
    const res = await apiClient.get<TopologyResponse>('/topology');
    return res.data;
  },

  getDeviceDetails: async (deviceId: string): Promise<DeviceDetailResponse> => {
    const res = await apiClient.get<DeviceDetailResponse>(`/topology/devices/${deviceId}`);
    return res.data;
  },
};
