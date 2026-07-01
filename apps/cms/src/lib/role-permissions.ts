import type { StaffRole, CmsSection, Permission } from '@luxe-maison/shared';
import {
  DEFAULT_PERMISSIONS,
  ALL_SECTIONS,
  getPermission as getCorePermission,
  canAccessSection as canCoreAccessSection,
  canModifySection as canCoreModifySection,
  getAccessibleSections as getCoreAccessibleSections,
  pathToSection,
} from '@luxe-maison/shared';

export type { StaffRole, Permission };
export type Section = CmsSection;
export { DEFAULT_PERMISSIONS, ALL_SECTIONS, pathToSection };

const STORAGE_KEY = 'maison-role-permissions';

export function loadStoredPermissions(): Record<
  'manager' | 'employee',
  Record<Section, Permission>
> {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return {
        manager: { ...DEFAULT_PERMISSIONS.manager, ...parsed.manager },
        employee: { ...DEFAULT_PERMISSIONS.employee, ...parsed.employee },
      };
    }
  } catch {
    /* ignore */
  }
  return {
    manager: { ...DEFAULT_PERMISSIONS.manager },
    employee: { ...DEFAULT_PERMISSIONS.employee },
  };
}

export function getPermission(role: StaffRole, section: Section): Permission {
  return getCorePermission(role, section, loadStoredPermissions());
}

export function canAccessSection(role: StaffRole, section: Section): boolean {
  return canCoreAccessSection(role, section, loadStoredPermissions());
}

export function canModifySection(role: StaffRole, section: Section): boolean {
  return canCoreModifySection(role, section, loadStoredPermissions());
}

export function getAccessibleSections(role: StaffRole): Section[] {
  return getCoreAccessibleSections(role, loadStoredPermissions());
}
