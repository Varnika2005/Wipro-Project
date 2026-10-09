import { apiClient } from './client';
import { RCAResponse } from '../types/rca';

export const rcaApi = {
  correlateAlarms: async (): Promise<RCAResponse> => {
    const res = await apiClient.get<RCAResponse>('/rca/correlate');
    return res.data;
  },
};
