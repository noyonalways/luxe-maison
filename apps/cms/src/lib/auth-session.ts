import type { StaffRole } from "@/lib/role-permissions";

const USER_STORAGE_KEY = "maison-auth-user";
const TOKEN_STORAGE_KEY = "maison-auth-token";

export interface StoredUser {
  id: string;
  name: string;
  email: string;
  role: StaffRole | "customer";
  roleSlug?: string;
  avatar?: string;
}

export function getStoredUser(): StoredUser | null {
  try {
    const stored = localStorage.getItem(USER_STORAGE_KEY);
    if (!stored) return null;
    return JSON.parse(stored) as StoredUser;
  } catch {
    return null;
  }
}

export function getStoredToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_STORAGE_KEY);
  } catch {
    return null;
  }
}

export function setAuthSession(user: StoredUser, token: string): void {
  localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
  localStorage.setItem(TOKEN_STORAGE_KEY, token);
}

export function clearAuthSession(): void {
  localStorage.removeItem(USER_STORAGE_KEY);
  localStorage.removeItem(TOKEN_STORAGE_KEY);
}

export function isStaffRole(role: StoredUser["role"]): role is StaffRole {
  if (role === "customer") return false;
  if (role === "admin" || role === "manager" || role === "employee") return true;
  return role.startsWith("role-");
}

export function getStoredStaffUser(): (StoredUser & { role: StaffRole }) | null {
  const user = getStoredUser();
  if (!user || !isStaffRole(user.role)) return null;
  return user as StoredUser & { role: StaffRole };
}
