import { apiClient } from './client';

export interface UserProfile {
  id: string;
  username: string;
  email: string;
  role: 'viewer' | 'operator' | 'admin';
  is_active: boolean;
  created_at: string;
}

export interface AuditLogEntry {
  id: number;
  user_id: string;
  username: string;
  role: string;
  action: string;
  target_device_id?: string;
  details?: string;
  ip_address: string;
  timestamp: string;
}

export const authApi = {
  login: async (username: string, password: string): Promise<UserProfile> => {
    const res = await apiClient.post<UserProfile>('/auth/login', { username, password });
    return res.data;
  },

  refresh: async (): Promise<UserProfile> => {
    const res = await apiClient.post<UserProfile>('/auth/refresh');
    return res.data;
  },

  logout: async (): Promise<void> => {
    await apiClient.post('/auth/logout');
  },

  getMe: async (): Promise<UserProfile> => {
    const res = await apiClient.get<UserProfile>('/auth/me');
    return res.data;
  },

  getAudit: async (limit: number = 20): Promise<AuditLogEntry[]> => {
    const res = await apiClient.get<AuditLogEntry[]>('/auth/audit', { params: { limit } });
    return res.data;
  },
};
