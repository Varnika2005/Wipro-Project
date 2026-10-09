import { apiClient } from './client';
import { RemediationSimulateResponse, RemediationApplyResponse } from '../types/remediation';

export const remediationApi = {
  simulate: async (targetDeviceId: string, actionType: string): Promise<RemediationSimulateResponse> => {
    const res = await apiClient.post<RemediationSimulateResponse>('/remediation/simulate', {
      target_device_id: targetDeviceId,
      action_type: actionType,
    });
    return res.data;
  },

  apply: async (targetDeviceId: string, actionType: string): Promise<RemediationApplyResponse> => {
    const res = await apiClient.post<RemediationApplyResponse>('/remediation/apply', {
      target_device_id: targetDeviceId,
      action_type: actionType,
    });
    return res.data;
  },
};
