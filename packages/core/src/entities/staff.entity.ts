/** Built-in roles use fixed ids; custom roles use `role-{timestamp}` ids. */
export type StaffRole = 'admin' | string;

export const BUILTIN_STAFF_ROLES = ['admin', 'manager', 'employee'] as const;
export type BuiltinStaffRole = (typeof BUILTIN_STAFF_ROLES)[number];

export function isBuiltinStaffRole(role: string): role is BuiltinStaffRole {
  return (BUILTIN_STAFF_ROLES as readonly string[]).includes(role);
}

export function isCustomStaffRole(role: string): boolean {
  return role.startsWith('role-');
}

export interface StaffMember {
  id: string;
  name: string;
  email: string;
  role: StaffRole;
  passwordHash: string;
  addedAt: string;
  avatar?: string;
}

export type StaffPublic = Omit<StaffMember, 'passwordHash'>;

export function toStaffPublic(member: StaffMember): StaffPublic {
  const { passwordHash: _passwordHash, ...publicMember } = member;
  return publicMember;
}
