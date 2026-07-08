import type { StaffRole } from './staff.entity.js';

export type UserRole = StaffRole | 'customer';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
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

export interface RegisterCustomerInput {
  name: string;
  email: string;
  password: string;
  phone: string;
  address?: string;
}

export interface JwtPayload {
  sub: string;
  email: string;
  role: UserRole;
  name: string;
}

export function isStaffRole(role: UserRole): role is StaffRole {
  return role === 'admin' || role === 'manager' || role === 'employee';
}

export function isCustomerRole(role: UserRole): role is 'customer' {
  return role === 'customer';
}
