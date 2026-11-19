import { apiClient } from './client';
import { SignupRequestDto, LoginRequestDto, LoginResponse, UserDto } from '@/types/auth';

/**
 * Authentication API Service
 * Routed through API Gateway at /api/v1/users/auth/**
 */
export const authApi = {
  /**
   * Register a new user
   * POST /api/v1/users/auth/signup
   */
  async signup(data: SignupRequestDto): Promise<UserDto> {
    const response = await apiClient.post<UserDto>('/api/v1/users/auth/signup', data);
    return response.data;
  },

  /**
   * Log in an existing user
   * POST /api/v1/users/auth/login
   */
  async login(data: LoginRequestDto): Promise<LoginResponse> {
    const response = await apiClient.post<LoginResponse>('/api/v1/users/auth/login', data);
    return response.data;
  },
};
