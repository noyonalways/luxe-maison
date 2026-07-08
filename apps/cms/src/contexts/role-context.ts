import { createContext, useContext } from 'react';
import {
  DEFAULT_PERMISSIONS,
  pathToSection,
  ALL_SECTIONS,
  type Section,
  type Permission,
  type EditableRolePermissions,
} from '@/lib/role-permissions';

export type StaffRole = 'admin' | 'manager' | 'employee';
export type { Section, Permission, EditableRolePermissions };
export { DEFAULT_PERMISSIONS, pathToSection, ALL_SECTIONS };

export interface RoleContextValue {
  role: StaffRole;
  setRole: (role: StaffRole) => void;
  hasAccess: (section: Section) => boolean;
  canEdit: (section: Section) => boolean;
  canDelete: (section: Section) => boolean;
  getPermission: (section: Section) => Permission;
  updatePermission: (role: 'manager' | 'employee', section: Section, permission: Permission) => void;
  getPermissions: () => EditableRolePermissions;
  resetPermissions: () => void;
  isLoadingPermissions: boolean;
  isSavingPermissions: boolean;
}

export const RoleContext = createContext<RoleContextValue | null>(null);

export function useRole() {
  const ctx = useContext(RoleContext);
  if (!ctx) throw new Error('useRole must be used within RoleProvider');
  return ctx;
}

export const VALID_ROLES: StaffRole[] = ['admin', 'manager', 'employee'];
