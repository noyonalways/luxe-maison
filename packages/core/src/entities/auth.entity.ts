import type { StaffRole } from './staff.entity.js';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: StaffRole;
  avatar?: string;
}

export interface AuthTokens {
  accessToken: string;
  expiresAt: string;
}

export interface AuthSession {
  user: AuthUser;
  tokens: AuthTokens;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface JwtPayload {
  sub: string;
  email: string;
  role: StaffRole;
  name: string;
}
