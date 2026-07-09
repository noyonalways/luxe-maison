import type { CmsSection, Permission } from '../auth/staff-permissions.auth.js';

export interface CmsRole {
  id: string;
  name: string;
  slug: string;
  isSystem: boolean;
  permissions: Record<CmsSection, Permission>;
  createdAt: string;
}

export const RESERVED_ROLE_SLUGS = ['admin', 'login', 'api'] as const;

export function isValidRoleSlug(slug: string): boolean {
  if (!/^[a-z][a-z0-9-]{1,30}[a-z0-9]$/.test(slug)) return false;
  return !(RESERVED_ROLE_SLUGS as readonly string[]).includes(slug);
}

export function createRoleId(): string {
  return `role-${Date.now()}`;
}

export function slugifyRoleName(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 32);
}
