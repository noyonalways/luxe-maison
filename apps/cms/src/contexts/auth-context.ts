import { createContext, useContext } from 'react';
import type { StaffRole } from '@/lib/role-permissions';
import type { StoredUser } from '@/lib/auth-session';

export type UserRole = StaffRole | 'customer';
export type UserProfile = StoredUser;

export interface AuthContextValue {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isRestoringSession: boolean;
  updateProfile: (data: Partial<Pick<UserProfile, 'name' | 'avatar'>>) => void;
  applySession: (user: UserProfile) => void;
  signOut: () => void;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

export { isStaffRole } from '@/lib/auth-session';
