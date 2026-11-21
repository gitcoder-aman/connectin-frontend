import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { SpringApiError } from '@/types/api';

// In development or when using Vite proxy, relative path "" eliminates CORS preflight OPTIONS failures.
// In production or when explicitly configured, VITE_API_BASE_URL is used directly.
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? (import.meta.env.DEV ? '' : 'https://34.95.113.61.sslip.io');

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
});

// Keys for local storage
export const AUTH_KEYS = {
  TOKEN: 'connectin_token',
  USER_ID: 'connectin_user_id',
  USER_EMAIL: 'connectin_user_email',
  USER_NAME: 'connectin_user_name',
  USER_PROFILE: 'connectin_user_profile',
  LIKED_POSTS: 'connectin_liked_posts',
};

// Event emitter callback for 401 handling
type UnauthorizedCallback = () => void;
let onUnauthorizedCallback: UnauthorizedCallback | null = null;

export function setUnauthorizedCallback(callback: UnauthorizedCallback) {
  onUnauthorizedCallback = callback;
}

// Request Interceptor: Attach JWT and X-User-Id
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem(AUTH_KEYS.TOKEN);
    const userId = localStorage.getItem(AUTH_KEYS.USER_ID);

    if (token) {
      config.headers.set('Authorization', `Bearer ${token}`);
    }

    // Downstream services (postService, connectionService) read userId from X-User-Id header.
    // The Gateway checks Authorization, so we provide both.
    if (userId) {
      config.headers.set('X-User-Id', userId);
    }

    // Ensure POST/PUT/PATCH requests have a defined body to guarantee Content-Length is sent,
    // preventing Google Cloud Load Balancer (GCE Ingress) from rejecting requests with "411 Length Required".
    if (
      ['post', 'put', 'patch'].includes(config.method?.toLowerCase() || '') &&
      config.data === undefined
    ) {
      config.data = {};
      config.headers.set('Content-Type', 'application/json');
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Format errors and handle auth expiry
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<SpringApiError | string>) => {
    if (error.response?.status === 401) {
      // Trigger logout if session has expired
      if (onUnauthorizedCallback) {
        onUnauthorizedCallback();
      }
    }
    return Promise.reject(formatAxiosError(error));
  }
);

/**
 * Extracts a user-friendly error message from Spring Boot ApiError or Gateway responses.
 */
export function formatAxiosError(error: AxiosError<SpringApiError | string>): Error {
  if (error.response) {
    const data = error.response.data;

    if (data && typeof data === 'object') {
      if ('error' in data && data.error) {
        return new Error(data.error);
      }
      if ('message' in data && data.message) {
        return new Error(data.message);
      }
    }

    if (typeof data === 'string' && data.trim()) {
      if (data.length < 200 && !data.trim().startsWith('<')) {
        return new Error(data.trim());
      }
    }

    // Standard HTTP error status code messages
    switch (error.response.status) {
      case 400:
        return new Error('Bad request. Please check the submitted information.');
      case 401:
        return new Error('Invalid or expired authentication session. Please sign in again.');
      case 403:
        return new Error('Access denied. You do not have permission for this action.');
      case 404:
        return new Error('The requested resource was not found on the server.');
      case 409:
        return new Error('A conflict occurred with an existing resource.');
      case 500:
        return new Error('Server error occurred. Please try again later.');
      case 502:
      case 503:
      case 504:
        return new Error('Backend microservice is currently unreachable. Please retry shortly.');
      default:
        return new Error(`Server returned status ${error.response.status}`);
    }
  }

  if (error.request) {
    return new Error(
      'Unable to connect to the ConnectIn backend server. Check network connection or verify that the GKE API Gateway is online.'
    );
  }

  return new Error(error.message || 'An unexpected error occurred.');
}
