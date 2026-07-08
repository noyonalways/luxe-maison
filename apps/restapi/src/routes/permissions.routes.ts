import type { Hono } from 'hono';
import type { EditableRolePermissions } from '@luxe-maison/core';
import { requireAuth, requireRole, type AuthVariables } from '../middleware/auth.middleware.js';
import {
  invalidatePermissionsCache,
  setPermissionsCache,
} from '../middleware/permissions.middleware.js';
import { rolePermissionsService } from '../lib/role-permissions.js';

export function permissionsRoutes(app: Hono<{ Variables: AuthVariables }>) {
  app.get('/api/permissions', requireAuth, async (c) => {
    const matrix = await rolePermissionsService.get();
    setPermissionsCache(matrix);
    return c.json({ status: 'ok', permissions: matrix });
  });

  app.put('/api/permissions', requireAuth, requireRole('admin'), async (c) => {
    const body = await c.req.json<{ permissions?: EditableRolePermissions }>();
    if (!body.permissions?.manager || !body.permissions?.employee) {
      return c.json({ status: 'error', message: 'permissions.manager and permissions.employee are required' }, 400);
    }

    const updated = await rolePermissionsService.update(body.permissions);
    invalidatePermissionsCache();
    setPermissionsCache(updated);
    return c.json({ status: 'ok', permissions: updated });
  });

  app.post('/api/permissions/reset', requireAuth, requireRole('admin'), async (c) => {
    const defaults = await rolePermissionsService.reset();
    invalidatePermissionsCache();
    setPermissionsCache(defaults);
    return c.json({ status: 'ok', permissions: defaults });
  });
}
