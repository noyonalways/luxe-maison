import { createContext, useContext } from 'react';
import {
  DEFAULT_PERMISSIONS,
  pathToSection,
  ALL_SECTIONS,
  type Section,
  type Permission,
  type EditableRolePermissions,
  type CmsRole,
  type StaffRole,
} from '@/lib/role-permissions';

export type { Section, Permission, EditableRolePermissions, CmsRole, StaffRole };
export { DEFAULT_PERMISSIONS, pathToSection, ALL_SECTIONS };

export interface RoleContextValue {
  role: StaffRole;
  roleSlug: string;
  roles: CmsRole[];
  setRole: (role: StaffRole) => void;
  hasAccess: (section: Section) => boolean;
  canEdit: (section: Section) => boolean;
  canDelete: (section: Section) => boolean;
  getPermission: (section: Section) => Permission;
  updatePermission: (roleId: string, section: Section, permission: Permission) => void;
  createRole: (input: { name: string; slug?: string }) => Promise<CmsRole>;
  deleteRole: (roleId: string) => Promise<void>;
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

export const BUILTIN_ROLE_SLUGS = ['admin', 'manager', 'employee'] as const;
