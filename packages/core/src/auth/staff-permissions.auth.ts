import type { StaffRole } from '../entities/staff.entity.js';

export type { StaffRole };

export type CmsSection =
  | 'dashboard'
  | 'products'
  | 'orders'
  | 'customers'
  | 'analytics'
  | 'newsletter'
  | 'discounts'
  | 'campaigns'
  | 'popup'
  | 'access-control'
  | 'team'
  | 'settings';

export type Permission = 'view' | 'edit' | 'full' | 'none';

export type EditableRole = 'manager' | 'employee';

export type EditableRolePermissions = Record<
  EditableRole,
  Record<CmsSection, Permission>
>;

const PERMISSION_RANK: Record<Permission, number> = {
  none: 0,
  view: 1,
  edit: 2,
  full: 3,
};

export function meetsPermissionLevel(
  permission: Permission,
  required: 'view' | 'edit' | 'full',
): boolean {
  return PERMISSION_RANK[permission] >= PERMISSION_RANK[required];
}

export function normalizeRolePermissions(
  permissions: Partial<EditableRolePermissions> = {},
): EditableRolePermissions {
  return {
    manager: { ...DEFAULT_PERMISSIONS.manager, ...permissions.manager },
    employee: { ...DEFAULT_PERMISSIONS.employee, ...permissions.employee },
  };
}

export function cloneDefaultPermissions(): EditableRolePermissions {
  return normalizeRolePermissions();
}

const ADMIN_PERMISSIONS: Record<CmsSection, Permission> = {
  dashboard: 'full',
  products: 'full',
  orders: 'full',
  customers: 'full',
  analytics: 'full',
  newsletter: 'full',
  discounts: 'full',
  campaigns: 'full',
  popup: 'full',
  'access-control': 'full',
  team: 'full',
  settings: 'full',
};

export const DEFAULT_PERMISSIONS: EditableRolePermissions = {
  manager: {
    dashboard: 'full',
    products: 'none',
    orders: 'full',
    customers: 'edit',
    analytics: 'view',
    newsletter: 'full',
    discounts: 'full',
    campaigns: 'full',
    popup: 'none',
    'access-control': 'none',
    team: 'none',
    settings: 'none',
  },
  employee: {
    dashboard: 'view',
    products: 'view',
    orders: 'edit',
    customers: 'none',
    analytics: 'none',
    newsletter: 'none',
    discounts: 'none',
    campaigns: 'none',
    popup: 'none',
    'access-control': 'none',
    team: 'none',
    settings: 'none',
  },
};

export const ALL_SECTIONS: CmsSection[] = [
  'dashboard',
  'products',
  'orders',
  'customers',
  'analytics',
  'newsletter',
  'discounts',
  'campaigns',
  'popup',
  'team',
  'settings',
  'access-control',
];

export function getPermission(
  role: StaffRole,
  section: CmsSection,
  stored: EditableRolePermissions = DEFAULT_PERMISSIONS,
): Permission {
  if (role === 'admin') return ADMIN_PERMISSIONS[section];
  return stored[role][section];
}

export function canAccessSection(
  role: StaffRole,
  section: CmsSection,
  stored: EditableRolePermissions = DEFAULT_PERMISSIONS,
): boolean {
  return getPermission(role, section, stored) !== 'none';
}

export function canModifySection(
  role: StaffRole,
  section: CmsSection,
  stored: EditableRolePermissions = DEFAULT_PERMISSIONS,
): boolean {
  const permission = getPermission(role, section, stored);
  return permission === 'edit' || permission === 'full';
}

export function getAccessibleSections(
  role: StaffRole,
  stored: EditableRolePermissions = DEFAULT_PERMISSIONS,
): CmsSection[] {
  return ALL_SECTIONS.filter((section) => canAccessSection(role, section, stored));
}

export function pathToSection(path: string): CmsSection | null {
  const parts = path.split('/').filter(Boolean);
  if (parts.length < 2 || parts[1] === 'dashboard') return 'dashboard';
  const section = parts[1];
  if (ALL_SECTIONS.includes(section as CmsSection)) return section as CmsSection;
  return null;
}
