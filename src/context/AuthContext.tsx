import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authApi } from '@/api/authApi';
import { AUTH_KEYS, setUnauthorizedCallback } from '@/api/client';
import { SignupRequestDto, LoginRequestDto, UserProfile } from '@/types/auth';
import { parseJwt, isTokenExpired } from '@/utils/jwt';
import { useToast } from './ToastContext';

interface AuthContextType {
  user: UserProfile | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (data: LoginRequestDto) => Promise<void>;
  signup: (data: SignupRequestDto) => Promise<void>;
  logout: () => void;
  updateLocalProfile: (updates: Partial<UserProfile>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem(AUTH_KEYS.TOKEN));
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { info, error: toastError } = useToast();

  const logout = useCallback(() => {
    localStorage.removeItem(AUTH_KEYS.TOKEN);
    localStorage.removeItem(AUTH_KEYS.USER_ID);
    localStorage.removeItem(AUTH_KEYS.USER_EMAIL);
    localStorage.removeItem(AUTH_KEYS.USER_NAME);
    localStorage.removeItem(AUTH_KEYS.USER_PROFILE);
    setToken(null);
    setUser(null);
  }, []);

  // Initialize and validate session on mount
  useEffect(() => {
    const storedToken = localStorage.getItem(AUTH_KEYS.TOKEN);
    if (!storedToken) {
      setIsLoading(false);
      return;
    }

    if (isTokenExpired(storedToken)) {
      logout();
      info('Your session has expired. Please sign in again.');
      setIsLoading(false);
      return;
    }

    const payload = parseJwt(storedToken);
    const storedId = localStorage.getItem(AUTH_KEYS.USER_ID);
    const storedEmail = localStorage.getItem(AUTH_KEYS.USER_EMAIL) || payload?.email || '';
    const storedName = localStorage.getItem(AUTH_KEYS.USER_NAME) || '';
    const userId = storedId ? parseInt(storedId, 10) : payload?.sub ? parseInt(payload.sub, 10) : 0;

    let profileExtras: Partial<UserProfile> = {};
    try {
      const savedExtras = localStorage.getItem(AUTH_KEYS.USER_PROFILE);
      if (savedExtras) {
        profileExtras = JSON.parse(savedExtras);
      }
    } catch {
      // ignore parse error
    }

    if (userId > 0) {
      setUser({
        id: userId,
        email: storedEmail,
        name: storedName || `User ${userId}`,
        headline: profileExtras.headline || 'ConnectIn Member',
        bio: profileExtras.bio || 'Welcome to my ConnectIn professional profile.',
        avatarUrl: profileExtras.avatarUrl,
        location: profileExtras.location || 'Bengaluru, India',
      });
      setToken(storedToken);
    } else {
      logout();
    }

    setIsLoading(false);
  }, [logout, info]);

  // Register Axios 401 callback
  useEffect(() => {
    setUnauthorizedCallback(() => {
      logout();
      toastError('Session expired. Please log in again.');
    });
  }, [logout, toastError]);

  const login = async (credentials: LoginRequestDto) => {
    const res = await authApi.login(credentials);
    const accessToken = res.accessToken;
    const userEmail = res.userEmail;

    localStorage.setItem(AUTH_KEYS.TOKEN, accessToken);
    localStorage.setItem(AUTH_KEYS.USER_EMAIL, userEmail);

    const payload = parseJwt(accessToken);
    const userId = payload?.sub ? parseInt(payload.sub, 10) : 0;
    if (userId) {
      localStorage.setItem(AUTH_KEYS.USER_ID, String(userId));
    }

    // Default name fallback if not stored
    const existingName = localStorage.getItem(AUTH_KEYS.USER_NAME) || (userEmail ? userEmail.split('@')[0] : 'User');
    localStorage.setItem(AUTH_KEYS.USER_NAME, existingName);

    setToken(accessToken);
    setUser({
      id: userId,
      email: userEmail,
      name: existingName,
      headline: 'ConnectIn Member',
      bio: 'Welcome to my ConnectIn professional profile.',
      location: 'Bengaluru, India',
    });
  };

  const signup = async (data: SignupRequestDto) => {
    const userDto = await authApi.signup(data);

    // Cache user's chosen display name
    if (userDto.name) {
      localStorage.setItem(AUTH_KEYS.USER_NAME, userDto.name);
    }

    // Auto-login after successful registration
    await login({
      email: data.email,
      password: data.password,
    });
  };

  const updateLocalProfile = (updates: Partial<UserProfile>) => {
    setUser((prev) => {
      if (!prev) return null;
      const updated = { ...prev, ...updates };
      if (updates.name) {
        localStorage.setItem(AUTH_KEYS.USER_NAME, updates.name);
      }
      localStorage.setItem(
        AUTH_KEYS.USER_PROFILE,
        JSON.stringify({
          headline: updated.headline,
          bio: updated.bio,
          avatarUrl: updated.avatarUrl,
          location: updated.location,
        })
      );
      return updated;
    });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token && !!user,
        isLoading,
        login,
        signup,
        logout,
        updateLocalProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
