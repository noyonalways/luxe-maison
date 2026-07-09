import type { Hono } from 'hono';
import type { CmsSection, Permission, StaffRepository } from '@luxe-maison/core';
import { createStaffService, rolesToEditablePermissions } from '@luxe-maison/core';
import { requireAuth, type AuthVariables } from '../middleware/auth.middleware.js';
import {
  invalidateRolesCache,
  setRolesCache,
} from '../middleware/permissions.middleware.js';
import { cmsRolesService, requireSection } from '../lib/cms-roles.js';

export function rolesRoutes(
  app: Hono<{ Variables: AuthVariables }>,
  { staffRepository }: { staffRepository: StaffRepository },
) {
  const staff = createStaffService(staffRepository);

  app.get('/api/roles', requireAuth, async (c) => {
    const roles = await cmsRolesService.list();
    setRolesCache(roles);
    return c.json({ status: 'ok', roles });
  });

  app.post('/api/roles', requireAuth, requireSection('access-control', 'edit'), async (c) => {
    const body = await c.req.json<{
      name?: string;
      slug?: string;
      permissions?: Partial<Record<CmsSection, Permission>>;
    }>();

    try {
      const role = await cmsRolesService.createCustomRole({
        name: body.name ?? '',
        slug: body.slug,
        permissions: body.permissions,
      });
      invalidateRolesCache();
      const roles = await cmsRolesService.list();
      setRolesCache(roles);
      return c.json({ status: 'ok', role, roles }, 201);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to create role';
      return c.json({ status: 'error', message }, 400);
    }
  });

  app.put('/api/roles/:id', requireAuth, requireSection('access-control', 'edit'), async (c) => {
    const id = c.req.param('id');
    const body = await c.req.json<{
      name?: string;
      slug?: string;
      permissions?: Partial<Record<CmsSection, Permission>>;
    }>();

    try {
      const role = await cmsRolesService.updateRole(id, body);
      if (!role) return c.json({ status: 'error', message: 'Role not found' }, 404);
      invalidateRolesCache();
      const roles = await cmsRolesService.list();
      setRolesCache(roles);
      return c.json({ status: 'ok', role, roles });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to update role';
      return c.json({ status: 'error', message }, 400);
    }
  });

  app.patch('/api/roles/:id/permissions', requireAuth, requireSection('access-control', 'edit'), async (c) => {
    const id = c.req.param('id');
    const body = await c.req.json<{ section?: CmsSection; permission?: Permission }>();

    if (!body.section || !body.permission) {
      return c.json({ status: 'error', message: 'section and permission are required' }, 400);
    }

    const role = await cmsRolesService.updatePermission(id, body.section, body.permission);
    if (!role) return c.json({ status: 'error', message: 'Role not found' }, 404);

    invalidateRolesCache();
    const roles = await cmsRolesService.list();
    setRolesCache(roles);
    return c.json({
      status: 'ok',
      role,
      roles,
      permissions: rolesToEditablePermissions(roles),
    });
  });

  app.delete('/api/roles/:id', requireAuth, requireSection('access-control', 'full'), async (c) => {
    const id = c.req.param('id');
    const members = await staff.list();
    if (members.some((member) => member.role === id)) {
      return c.json({ status: 'error', message: 'Remove all team members with this role first' }, 400);
    }
    const deleted = await cmsRolesService.deleteRole(id);
    if (!deleted) {
      return c.json({ status: 'error', message: 'Role not found or cannot be deleted' }, 400);
    }
    invalidateRolesCache();
    const roles = await cmsRolesService.list();
    setRolesCache(roles);
    return c.json({ status: 'ok', roles });
  });

  app.post('/api/roles/reset', requireAuth, requireSection('access-control', 'edit'), async (c) => {
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
