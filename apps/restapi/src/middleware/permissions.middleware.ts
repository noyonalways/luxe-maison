import { createMiddleware } from 'hono/factory';
import type { CmsSection } from '@luxe-maison/core';
import {
  getPermission,
  meetsPermissionLevel,
  isStaffRole,
  type EditableRolePermissions,
} from '@luxe-maison/core';
import type { RolePermissionsService } from '@luxe-maison/core';
import type { AuthVariables } from './auth.middleware.js';

let cachedPermissions: EditableRolePermissions | null = null;

export function setPermissionsCache(permissions: EditableRolePermissions | null) {
  cachedPermissions = permissions;
}

export async function getPermissionsForRequest(
  service: RolePermissionsService,
): Promise<EditableRolePermissions> {
  if (cachedPermissions) return cachedPermissions;
  const permissions = await service.get();
  cachedPermissions = permissions;
  return permissions;
}

export function invalidatePermissionsCache() {
  cachedPermissions = null;
}

export function createRequireSection(service: RolePermissionsService) {
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

      const permissions = await getPermissionsForRequest(service);
      const level = getPermission(user.role, section, permissions);

      if (!meetsPermissionLevel(level, required)) {
        return c.json({ status: 'error', message: 'Insufficient permissions' }, 403);
      }

      await next();
    });
  };
}
