import { hash } from 'bcryptjs';
import type { Hono } from 'hono';
import type { StaffMember, StaffRepository, StaffRole } from '@luxe-maison/core';
import { createStaffService, toStaffPublic } from '@luxe-maison/core';
import { requireAuth, type AuthVariables } from '../middleware/auth.middleware.js';
import { requireSection } from '../lib/role-permissions.js';

function isStaffRoleValue(role: unknown): role is StaffRole {
  return role === 'admin' || role === 'manager' || role === 'employee';
}

function canAssignRole(actorRole: StaffRole, targetRole: StaffRole): boolean {
  if (targetRole === 'admin') return actorRole === 'admin';
  return true;
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function staffRoutes(
  app: Hono<{ Variables: AuthVariables }>,
  { staffRepository }: { staffRepository: StaffRepository },
) {
  const staff = createStaffService(staffRepository);

  app.get('/api/staff', requireAuth, requireSection('team', 'view'), async (c) => {
    const list = await staff.list();
    return c.json(list);
  });

  app.get('/api/staff/:id', requireAuth, requireSection('team', 'view'), async (c) => {
    const member = await staff.getById(c.req.param('id'));
    if (!member) return c.json({ error: 'Staff member not found' }, 404);
    return c.json(member);
  });

  app.post('/api/staff', requireAuth, requireSection('team', 'edit'), async (c) => {
    const body = await c.req.json<{
      name?: string;
      email?: string;
      role?: StaffRole;
      password?: string;
      avatar?: string;
    }>();

    const name = body.name?.trim();
    const email = body.email?.trim().toLowerCase();
    const password = body.password;

    if (!name || !email || !password) {
      return c.json({ status: 'error', message: 'name, email, and password are required' }, 400);
    }

    if (!isValidEmail(email)) {
      return c.json({ status: 'error', message: 'Invalid email address' }, 400);
    }

    if (!isStaffRoleValue(body.role)) {
      return c.json({ status: 'error', message: 'role must be admin, manager, or employee' }, 400);
    }

    const currentUser = c.get('user');
    if (!canAssignRole(currentUser.role as StaffRole, body.role)) {
      return c.json({ status: 'error', message: 'Only admins can create admin accounts' }, 403);
    }

    if (password.length < 6) {
      return c.json({ status: 'error', message: 'password must be at least 6 characters' }, 400);
    }

    const existing = await staff.getByEmail(email);
    if (existing) {
      return c.json({ status: 'error', message: 'A staff member with this email already exists' }, 409);
    }

    const passwordHash = await hash(password, 10);
    const member: StaffMember = {
      id: `staff-${Date.now()}`,
      name,
      email,
      role: body.role,
      passwordHash,
      addedAt: new Date().toISOString().slice(0, 10),
      avatar: body.avatar?.trim() || '',
    };

    const created = await staff.create(member);
    return c.json(toStaffPublic(created), 201);
  });

  app.put('/api/staff/:id', requireAuth, requireSection('team', 'edit'), async (c) => {
    const id = c.req.param('id');
    const current = await staffRepository.findById(id);
    if (!current) return c.json({ error: 'Staff member not found' }, 404);

    if (current.role === 'admin') {
      return c.json({ status: 'error', message: 'Admin accounts cannot be modified here' }, 403);
    }

    const body = await c.req.json<{
      name?: string;
      email?: string;
      role?: StaffRole;
      password?: string;
      avatar?: string;
    }>();

    const updates: Partial<StaffMember> = {};
    const currentUser = c.get('user');

    if (body.name !== undefined) {
      const name = body.name.trim();
      if (!name) return c.json({ status: 'error', message: 'name cannot be empty' }, 400);
      updates.name = name;
    }

    if (body.email !== undefined) {
      const email = body.email.trim().toLowerCase();
      if (!isValidEmail(email)) {
        return c.json({ status: 'error', message: 'Invalid email address' }, 400);
      }
      const emailTaken = await staff.getByEmail(email);
      if (emailTaken && emailTaken.id !== id) {
        return c.json({ status: 'error', message: 'A staff member with this email already exists' }, 409);
      }
      updates.email = email;
    }

    if (body.role !== undefined) {
      if (!isStaffRoleValue(body.role)) {
        return c.json({ status: 'error', message: 'role must be admin, manager, or employee' }, 400);
      }
      if (!canAssignRole(currentUser.role as StaffRole, body.role)) {
        return c.json({ status: 'error', message: 'Only admins can assign the admin role' }, 403);
      }
      updates.role = body.role;
    }

    if (body.avatar !== undefined) {
      updates.avatar = body.avatar.trim();
    }

    if (body.password?.trim()) {
      if (body.password.length < 6) {
        return c.json({ status: 'error', message: 'password must be at least 6 characters' }, 400);
      }
      updates.passwordHash = await hash(body.password, 10);
    }

    const updated = await staff.update(id, updates);
    if (!updated) return c.json({ error: 'Staff member not found' }, 404);
    return c.json(toStaffPublic(updated));
  });

  app.delete('/api/staff/:id', requireAuth, requireSection('team', 'full'), async (c) => {
    const id = c.req.param('id');
    const currentUser = c.get('user');

    if (currentUser.id === id) {
      return c.json({ status: 'error', message: 'You cannot delete your own account' }, 400);
    }

    const member = await staffRepository.findById(id);
    if (!member) return c.json({ error: 'Staff member not found' }, 404);

    if (member.role === 'admin') {
      return c.json({ status: 'error', message: 'Admin accounts cannot be deleted' }, 403);
    }

    const deleted = await staff.delete(id);
    if (!deleted) return c.json({ error: 'Staff member not found' }, 404);
    return c.json({ status: 'ok' });
  });
}
