import type { StoredUser } from '@/lib/auth-session';
import { apiClient } from '@/lib/api/client';

export interface AuthTokens {
  accessToken: string;
  expiresAt: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface LoginResponse {
  status: 'ok';
  user: StoredUser;
  tokens: AuthTokens;
}

export interface MeResponse {
  status: 'ok';
  user: StoredUser;
}

export const authApi = {
  login(payload: LoginPayload) {
    return apiClient.post<LoginResponse>('/api/auth/login', payload).then((res) => res.data);
  },

  me() {
    return apiClient.get<MeResponse>('/api/auth/me').then((res) => res.data);
  },

  logout() {
    return apiClient.post<{ status: 'ok' }>('/api/auth/logout').then((res) => res.data);
  },
};
