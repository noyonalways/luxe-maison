"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
} from 'react';
import { customerAuthApi } from '@/lib/api/customer-auth.api';
import {
  clearAuthSession,
  getStoredToken,
  getStoredUser,
  setAuthSession,
  type StoredCustomerUser,
} from '@/lib/auth-session';
import { ApiError } from '@/lib/api/client';

export type UserRole = 'customer';

export type UserProfile = StoredCustomerUser;

interface AuthContextType {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signup: (
    name: string,
    email: string,
    password: string,
    phone: string,
  ) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  updateProfile: (data: Partial<Pick<UserProfile, 'name' | 'avatar'>>) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(() => getStoredUser());
  const [isLoading, setIsLoading] = useState(() => Boolean(getStoredToken()));

  useEffect(() => {
    const token = getStoredToken();
    if (!token) {
      setIsLoading(false);
      return;
    }

    let cancelled = false;

    void customerAuthApi
      .me()
      .then((response) => {
        if (cancelled) return;
        setUser(response.user);
        setAuthSession(response.user, token);
      })
      .catch(() => {
        if (cancelled) return;
        clearAuthSession();
        setUser(null);
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    try {
      const response = await customerAuthApi.login(email, password);
      setAuthSession(response.user, response.tokens.accessToken);
      setUser(response.user);
      return { success: true };
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Invalid email or password';
      return { success: false, error: message };
    }
  }, []);

  const signup = useCallback(async (name: string, email: string, password: string, phone: string) => {
    const trimmedName = name.trim();
    const trimmedEmail = email.trim();
    const trimmedPhone = phone.trim();

    if (!trimmedName || !trimmedEmail || !trimmedPhone || !password) {
      return { success: false, error: 'All fields are required' };
    }
    if (password.length < 6) {
      return { success: false, error: 'Password must be at least 6 characters' };
    }

    try {
      const response = await customerAuthApi.register({
        name: trimmedName,
        email: trimmedEmail,
        password,
        phone: trimmedPhone,
      });
      setAuthSession(response.user, response.tokens.accessToken);
      setUser(response.user);
      return { success: true };
    } catch (err) {
      const message =
        err instanceof ApiError ? err.message : 'Unable to create account';
      return { success: false, error: message };
    }
  }, []);

  const logout = useCallback(() => {
    clearAuthSession();
    setUser(null);
  }, []);

  const updateProfile = useCallback((data: Partial<Pick<UserProfile, 'name' | 'avatar'>>) => {
    setUser((prev) => {
      if (!prev) return null;
      const next = { ...prev, ...data };
      const token = getStoredToken();
      if (token) setAuthSession(next, token);
      return next;
    });
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: Boolean(user),
        isLoading,
        login,
        signup,
        logout,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

export function isStaffRole(_role: string): _role is 'admin' | 'manager' | 'employee' {
  return false;
}
