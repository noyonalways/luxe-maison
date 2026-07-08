import type { StaffRole, CmsSection, Permission, EditableRolePermissions } from '@luxe-maison/shared';
import {
  DEFAULT_PERMISSIONS,
  ALL_SECTIONS,
  getPermission as getCorePermission,
  canAccessSection as canCoreAccessSection,
  canModifySection as canCoreModifySection,
  getAccessibleSections as getCoreAccessibleSections,
  pathToSection,
} from '@luxe-maison/shared';
import { getPermissionsCache } from '@/lib/permissions-cache';

export type { StaffRole, Permission, EditableRolePermissions };
export type Section = CmsSection;
export { DEFAULT_PERMISSIONS, ALL_SECTIONS, pathToSection };

export function getActivePermissions(): EditableRolePermissions {
  return getPermissionsCache();
}

export function getPermission(
  role: StaffRole,
  section: Section,
  stored: EditableRolePermissions = getActivePermissions(),
): Permission {
  return getCorePermission(role, section, stored);
}

export function canAccessSection(
  role: StaffRole,
  section: Section,
  stored: EditableRolePermissions = getActivePermissions(),
): boolean {
  return canCoreAccessSection(role, section, stored);
}

export function canModifySection(
  role: StaffRole,
  section: Section,
  stored: EditableRolePermissions = getActivePermissions(),
): boolean {
  return canCoreModifySection(role, section, stored);
}

export function getAccessibleSections(
  role: StaffRole,
  stored: EditableRolePermissions = getActivePermissions(),
): Section[] {
  return getCoreAccessibleSections(role, stored);
}
