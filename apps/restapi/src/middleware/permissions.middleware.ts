import { createMiddleware } from 'hono/factory';
import type { CmsSection, CmsRole } from '@luxe-maison/core';
import {
  getPermission,
  meetsPermissionLevel,
  isStaffRole,
} from '@luxe-maison/core';
import type { CmsRolesService } from '@luxe-maison/core';
import type { AuthVariables } from './auth.middleware.js';

let cachedRoles: CmsRole[] | null = null;

export function setRolesCache(roles: CmsRole[] | null) {
  cachedRoles = roles;
}

export async function getRolesForRequest(service: CmsRolesService): Promise<CmsRole[]> {
  if (cachedRoles) return cachedRoles;
  const roles = await service.list();
  cachedRoles = roles;
  return roles;
}

export function invalidateRolesCache() {
  cachedRoles = null;
}

/** @deprecated Use invalidateRolesCache */
export function invalidatePermissionsCache() {
  invalidateRolesCache();
}

/** @deprecated Use setRolesCache after deriving editable permissions if needed */
export function setPermissionsCache(_permissions: unknown) {
  invalidateRolesCache();
}

export function createRequireSection(service: CmsRolesService) {
  return function requireSection(
    section: CmsSection,
    required: 'view' | 'edit' | 'full' = 'view',
  ) {
    return createMiddleware<{ Variables: AuthVariables }>(async (c, next) => {
      const user = c.get('user');
      if (!user) {
        return c.json({ status: 'error', message: 'Authentication required' }, 401);
      }

      if (!isStaffRole(user.role)) {
        return c.json({ status: 'error', message: 'Insufficient permissions' }, 403);
      }

      const roles = await getRolesForRequest(service);
      const level = getPermission(user.role, section, roles);

      if (!meetsPermissionLevel(level, required)) {
        return c.json({ status: 'error', message: 'Insufficient permissions' }, 403);
      }

      await next();
    });
  };
}
