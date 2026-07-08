import type { Hono } from 'hono';
import type { StaffRepository } from '@luxe-maison/core';
import { createStaffService } from '@luxe-maison/core';
import { requireAuth, requireRole, type AuthVariables } from '../middleware/auth.middleware.js';

export function staffRoutes(
  app: Hono<{ Variables: AuthVariables }>,
  { staffRepository }: { staffRepository: StaffRepository },
) {
  const staff = createStaffService(staffRepository);

  app.get('/api/staff', requireAuth, requireRole('admin'), async (c) => {
    const list = await staff.list();
    return c.json(list);
  });

  app.get('/api/staff/:id', requireAuth, requireRole('admin'), async (c) => {
    const member = await staff.getById(c.req.param('id'));
    if (!member) return c.json({ error: 'Staff member not found' }, 404);
    return c.json(member);
  });
}
