import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react';

export type UserRole = 'admin' | 'manager' | 'employee' | 'customer';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
}

interface AuthContextType {
  user: UserProfile | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => { success: boolean; error?: string };
  signup: (name: string, email: string, password: string) => { success: boolean; error?: string };
  logout: () => void;
  updateProfile: (data: Partial<Pick<UserProfile, 'name' | 'avatar'>>) => void;
}

const STORAGE_KEY = 'maison-auth-user';
const CUSTOMERS_KEY = 'maison-customers';

// Predefined staff accounts
const STAFF_ACCOUNTS: Record<string, { password: string; profile: UserProfile }> = {
  'admin@maison.com': {
    password: 'admin123',
    profile: { id: 'staff-1', name: 'Admin User', email: 'admin@maison.com', role: 'admin', avatar: '' },
  },
  'manager@maison.com': {
    password: 'manager123',
    profile: { id: 'staff-2', name: 'Manager User', email: 'manager@maison.com', role: 'manager', avatar: '' },
  },
  'employee@maison.com': {
    password: 'employee123',
    profile: { id: 'staff-3', name: 'Employee User', email: 'employee@maison.com', role: 'employee', avatar: '' },
  },
};

// Default customer account
const DEFAULT_CUSTOMERS: Record<string, { password: string; profile: UserProfile }> = {
  'customer@maison.com': {
    password: 'customer123',
    profile: { id: 'cust-1', name: 'Jane Doe', email: 'customer@maison.com', role: 'customer', avatar: '' },
  },
};

function loadCustomers(): Record<string, { password: string; profile: UserProfile }> {
  try {
    const stored = localStorage.getItem(CUSTOMERS_KEY);
    if (stored) return { ...DEFAULT_CUSTOMERS, ...JSON.parse(stored) };
  } catch {}
  return { ...DEFAULT_CUSTOMERS };
}

function saveCustomers(customers: Record<string, { password: string; profile: UserProfile }>) {
  localStorage.setItem(CUSTOMERS_KEY, JSON.stringify(customers));
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const [customers, setCustomers] = useState(loadCustomers);

  useEffect(() => {
    if (user) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, [user]);

  const login = useCallback((email: string, password: string) => {
    const trimmedEmail = email.trim().toLowerCase();

    // Check staff accounts
    const staff = STAFF_ACCOUNTS[trimmedEmail];
    if (staff && staff.password === password) {
      setUser(staff.profile);
      return { success: true };
    }

    // Check customer accounts
    const customer = customers[trimmedEmail];
    if (customer && customer.password === password) {
      setUser(customer.profile);
      return { success: true };
    }

    return { success: false, error: 'Invalid email or password' };
  }, [customers]);

  const signup = useCallback((name: string, email: string, password: string) => {
    const trimmedEmail = email.trim().toLowerCase();
    const trimmedName = name.trim();

    if (!trimmedName || !trimmedEmail || !password) {
      return { success: false, error: 'All fields are required' };
    }
    if (password.length < 6) {
      return { success: false, error: 'Password must be at least 6 characters' };
    }
    if (STAFF_ACCOUNTS[trimmedEmail] || customers[trimmedEmail]) {
      return { success: false, error: 'An account with this email already exists' };
    }

    const newProfile: UserProfile = {
      id: `cust-${Date.now()}`,
      name: trimmedName,
      email: trimmedEmail,
      role: 'customer',
      avatar: '',
    };

    const updated = { ...customers, [trimmedEmail]: { password, profile: newProfile } };
    setCustomers(updated);
    saveCustomers(updated);
    setUser(newProfile);
    return { success: true };
  }, [customers]);

  const logout = useCallback(() => {
    setUser(null);
  }, []);

  const updateProfile = useCallback((data: Partial<Pick<UserProfile, 'name' | 'avatar'>>) => {
    setUser(prev => prev ? { ...prev, ...data } : null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, signup, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

export function isStaffRole(role: UserRole): role is 'admin' | 'manager' | 'employee' {
  return role === 'admin' || role === 'manager' || role === 'employee';
}
