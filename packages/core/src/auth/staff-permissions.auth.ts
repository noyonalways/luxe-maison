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

export const DEFAULT_PERMISSIONS: Record<
  'manager' | 'employee',
  Record<CmsSection, Permission>
> = {
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
  stored: Record<'manager' | 'employee', Record<CmsSection, Permission>> = DEFAULT_PERMISSIONS,
): Permission {
  if (role === 'admin') return ADMIN_PERMISSIONS[section];
  return stored[role][section];
}

export function canAccessSection(
  role: StaffRole,
  section: CmsSection,
  stored: Record<'manager' | 'employee', Record<CmsSection, Permission>> = DEFAULT_PERMISSIONS,
): boolean {
  return getPermission(role, section, stored) !== 'none';
}

export function canModifySection(
  role: StaffRole,
  section: CmsSection,
  stored: Record<'manager' | 'employee', Record<CmsSection, Permission>> = DEFAULT_PERMISSIONS,
): boolean {
  const permission = getPermission(role, section, stored);
  return permission === 'edit' || permission === 'full';
}

export function getAccessibleSections(
  role: StaffRole,
  stored: Record<'manager' | 'employee', Record<CmsSection, Permission>> = DEFAULT_PERMISSIONS,
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
