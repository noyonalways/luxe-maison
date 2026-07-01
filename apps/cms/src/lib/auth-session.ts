import type { StaffRole } from "@/lib/role-permissions";

const STORAGE_KEY = "maison-auth-user";

export interface StoredUser {
  id: string;
  name: string;
  email: string;
  role: StaffRole | "customer";
  avatar?: string;
}

export function getStoredUser(): StoredUser | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return null;
    return JSON.parse(stored) as StoredUser;
  } catch {
    return null;
  }
}

export function isStaffRole(
  role: StoredUser["role"],
): role is StaffRole {
  return role === "admin" || role === "manager" || role === "employee";
}

export function getStoredStaffUser(): StoredUser & { role: StaffRole } | null {
  const user = getStoredUser();
  if (!user || !isStaffRole(user.role)) return null;
  return user as StoredUser & { role: StaffRole };
}
