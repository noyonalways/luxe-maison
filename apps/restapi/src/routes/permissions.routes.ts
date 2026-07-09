import type { Hono } from 'hono';
import type { CmsSection, Permission } from '@luxe-maison/core';
import { rolesToEditablePermissions } from '@luxe-maison/core';
import { requireAuth, type AuthVariables } from '../middleware/auth.middleware.js';
import {
  invalidateRolesCache,
  setRolesCache,
} from '../middleware/permissions.middleware.js';
import { cmsRolesService, requireSection } from '../lib/cms-roles.js';

export function permissionsRoutes(app: Hono<{ Variables: AuthVariables }>) {
  app.get('/api/permissions', requireAuth, async (c) => {
    const roles = await cmsRolesService.list();
    setRolesCache(roles);
    return c.json({
      status: 'ok',
      roles,
      permissions: rolesToEditablePermissions(roles),
    });
  });

  app.put('/api/permissions', requireAuth, requireSection('access-control', 'edit'), async (c) => {
    const body = await c.req.json<{
      permissions?: {
        manager?: Record<string, string>;
        employee?: Record<string, string>;
      };
    }>();

    if (!body.permissions?.manager || !body.permissions?.employee) {
      return c.json(
        { status: 'error', message: 'permissions.manager and permissions.employee are required' },
        400,
      );
    }

    for (const [section, permission] of Object.entries(body.permissions.manager)) {
      await cmsRolesService.updatePermission('manager', section as CmsSection, permission as Permission);
    }
    for (const [section, permission] of Object.entries(body.permissions.employee)) {
      await cmsRolesService.updatePermission('employee', section as CmsSection, permission as Permission);
    }

    invalidateRolesCache();
    const roles = await cmsRolesService.list();
    setRolesCache(roles);
    return c.json({
      status: 'ok',
      roles,
      permissions: rolesToEditablePermissions(roles),
    });
  });

  app.post('/api/permissions/reset', requireAuth, requireSection('access-control', 'edit'), async (c) => {
    const roles = await cmsRolesService.resetSystemRoles();
    invalidateRolesCache();
    setRolesCache(roles);
    return c.json({
      status: 'ok',
      roles,
      permissions: rolesToEditablePermissions(roles),
    });
  });
}
