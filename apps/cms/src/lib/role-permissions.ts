import type { StaffRole, CmsSection, Permission, EditableRolePermissions, CmsRole } from '@luxe-maison/shared';
import {
  DEFAULT_PERMISSIONS,
  ALL_SECTIONS,
  getPermission as getCorePermission,
  canAccessSection as canCoreAccessSection,
  canModifySection as canCoreModifySection,
  getAccessibleSections as getCoreAccessibleSections,
  pathToSection,
  rolesToEditablePermissions,
} from '@luxe-maison/shared';
import { getPermissionsCache, getRolesCache } from '@/lib/permissions-cache';

export type { StaffRole, Permission, EditableRolePermissions, CmsRole };
export type Section = CmsSection;
export { DEFAULT_PERMISSIONS, ALL_SECTIONS, pathToSection, rolesToEditablePermissions };

export function getActiveRoles(): CmsRole[] {
  const roles = getRolesCache();
  return roles.length > 0 ? roles : [];
}

export function getActivePermissions(): EditableRolePermissions {
  const roles = getActiveRoles();
  if (roles.length > 0) return rolesToEditablePermissions(roles);
  return getPermissionsCache();
}

export function getPermission(
  role: StaffRole,
  section: Section,
  stored: EditableRolePermissions | CmsRole[] = getActiveRoles().length
    ? getActiveRoles()
    : getActivePermissions(),
): Permission {
  return getCorePermission(role, section, stored);
}

export function canAccessSection(
  role: StaffRole,
  section: Section,
  stored: EditableRolePermissions | CmsRole[] = getActiveRoles().length
    ? getActiveRoles()
    : getActivePermissions(),
): boolean {
  return canCoreAccessSection(role, section, stored);
}

export function canModifySection(
  role: StaffRole,
  section: Section,
  stored: EditableRolePermissions | CmsRole[] = getActiveRoles().length
    ? getActiveRoles()
    : getActivePermissions(),
): boolean {
  return canCoreModifySection(role, section, stored);
}

export function getAccessibleSections(
  role: StaffRole,
  stored: EditableRolePermissions | CmsRole[] = getActiveRoles().length
    ? getActiveRoles()
    : getActivePermissions(),
): Section[] {
  return getCoreAccessibleSections(role, stored);
}
