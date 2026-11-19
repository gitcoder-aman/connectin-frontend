export interface UserDto {
  id: number;
  name: string;
  email: string;
}

export interface SignupRequestDto {
  name: string;
  email: string;
  password: string;
}

export interface LoginRequestDto {
  email: string;
  password: string;
}

export interface LoginResponse {
  userEmail: string;
  accessToken: string;
}

export interface JWTPayload {
  sub: string; // User ID as string
  email: string;
  iat?: number;
  exp?: number;
}

export interface UserProfile {
  id: number;
  name: string;
  email: string;
  headline?: string;
  bio?: string;
  location?: string;
  avatarUrl?: string;
}
