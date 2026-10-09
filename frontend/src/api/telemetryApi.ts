import { apiClient } from './client';
import { TelemetryHistoryResponse, ScenarioType } from '../types/telemetry';

export const telemetryApi = {
  injectScenario: async (scenario: ScenarioType, targetDeviceId?: string, durationSeconds: number = 60) => {
    const res = await apiClient.post('/simulation/scenario', {
      scenario,
      target_device_id: targetDeviceId,
      duration_seconds: durationSeconds,
    });
    return res.data;
  },

  resetSimulation: async () => {
    const res = await apiClient.post('/simulation/reset');
    return res.data;
  },

  getHistory: async (deviceId: string, limit: number = 30): Promise<TelemetryHistoryResponse> => {
    const res = await apiClient.get<TelemetryHistoryResponse>('/telemetry/history', {
      params: { device_id: deviceId, limit },
    });
    return res.data;
  },
};
