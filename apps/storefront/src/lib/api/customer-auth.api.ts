import { apiFetch } from '@/lib/api/client';
import type { StoredCustomerUser } from '@/lib/auth-session';

interface AuthResponse {
  status: 'ok';
  user: StoredCustomerUser;
  tokens: { accessToken: string; expiresAt: string };
}

interface SessionResponse {
  status: 'ok';
  user: StoredCustomerUser;
}

export const customerAuthApi = {
  login(email: string, password: string) {
    return apiFetch<AuthResponse>('/api/customer-auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  },

  register(input: { name: string; email: string; password: string; phone?: string; address?: string }) {
    return apiFetch<AuthResponse>('/api/customer-auth/register', {
      method: 'POST',
      body: JSON.stringify(input),
    });
  },

  me() {
    return apiFetch<SessionResponse>('/api/customer-auth/me');
  },
};
