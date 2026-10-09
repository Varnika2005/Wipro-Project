import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';

export const apiClient = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Mandate HttpOnly cookies across all calls (Zero-Trust transport)
  timeout: 15000,
});

// Event bus listeners for authentication state transitions
type AuthListener = () => void;
type ForbiddenListener = (detail: string) => void;

let onUnauthorizedCallback: AuthListener | null = null;
let onForbiddenCallback: ForbiddenListener | null = null;

export const setAuthListeners = (
  onUnauthorized: AuthListener,
  onForbidden: ForbiddenListener
) => {
  onUnauthorizedCallback = onUnauthorized;
  onForbiddenCallback = onForbidden;
};

// Queue for requests waiting on token refresh
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: unknown) => void;
  reject: (reason?: unknown) => void;
}> = [];

const processQueue = (error: Error | null) => {
  failedQueue.forEach((promise) => {
    if (error) {
      promise.reject(error);
    } else {
      promise.resolve();
    }
  });
  failedQueue = [];
};

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // Handle 403 Forbidden (RBAC violation)
    if (error.response?.status === 403) {
      const detail = (error.response?.data as any)?.detail || 'Permission denied: Insufficient RBAC role privilege.';
      if (onForbiddenCallback) {
        onForbiddenCallback(detail);
      }
      return Promise.reject(error);
    }

    // Handle 401 Unauthorized (Expired access token -> Silent Refresh)
    if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
      // Do not intercept login or refresh failures to avoid infinite loop
      if (originalRequest.url?.includes('/auth/login') || originalRequest.url?.includes('/auth/refresh')) {
        return Promise.reject(error);
      }

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(() => apiClient(originalRequest))
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Attempt silent token refresh via HttpOnly refresh_token cookie
        await axios.post('/api/auth/refresh', {}, { withCredentials: true });
        isRefreshing = false;
        processQueue(null);
        return apiClient(originalRequest);
      } catch (refreshError: any) {
        isRefreshing = false;
        processQueue(refreshError);
        if (onUnauthorizedCallback) {
          onUnauthorizedCallback();
        }
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);
