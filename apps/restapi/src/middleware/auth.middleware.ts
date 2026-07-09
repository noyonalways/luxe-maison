import { createMiddleware } from 'hono/factory';
import type { AuthUser, StaffRole, UserRole } from '@luxe-maison/core';
import { isStaffRole } from '@luxe-maison/core';
import { verifyAccessToken } from '../lib/jwt.js';

export type AuthVariables = {
  user: AuthUser;
};

function parseBearerToken(authorization: string | undefined): string | null {
  if (!authorization?.startsWith('Bearer ')) return null;
  const token = authorization.slice('Bearer '.length).trim();
  return token || null;
}

export const requireAuth = createMiddleware<{ Variables: AuthVariables }>(async (c, next) => {
  const token = parseBearerToken(c.req.header('Authorization'));
  if (!token) {
    return c.json({ status: 'error', message: 'Authentication required' }, 401);
  }

  try {
    const payload = await verifyAccessToken(token);
    c.set('user', {
      id: payload.sub,
      email: payload.email,
      role: payload.role,
      name: payload.name,
      ...(payload.roleSlug ? { roleSlug: payload.roleSlug } : {}),
    });
    await next();
  } catch {
    return c.json({ status: 'error', message: 'Invalid or expired token' }, 401);
  }
});

export const requireStaffAuth = createMiddleware<{ Variables: AuthVariables }>(async (c, next) => {
  const token = parseBearerToken(c.req.header('Authorization'));
  if (!token) {
    return c.json({ status: 'error', message: 'Authentication required' }, 401);
  }

  try {
    const payload = await verifyAccessToken(token);
    if (!isStaffRole(payload.role)) {
      return c.json({ status: 'error', message: 'Insufficient permissions' }, 403);
    }

    c.set('user', {
      id: payload.sub,
      email: payload.email,
      role: payload.role,
      name: payload.name,
      ...(payload.roleSlug ? { roleSlug: payload.roleSlug } : {}),
    });
    await next();
  } catch {
    return c.json({ status: 'error', message: 'Invalid or expired token' }, 401);
  }
});

export const requireCustomerAuth = createMiddleware<{ Variables: AuthVariables }>(async (c, next) => {
  const token = parseBearerToken(c.req.header('Authorization'));
  if (!token) {
    return c.json({ status: 'error', message: 'Authentication required' }, 401);
  }

  try {
    const payload = await verifyAccessToken(token);
    if (payload.role !== 'customer') {
      return c.json({ status: 'error', message: 'Customer authentication required' }, 403);
    }

    c.set('user', {
      id: payload.sub,
      email: payload.email,
      role: payload.role,
      name: payload.name,
      ...(payload.roleSlug ? { roleSlug: payload.roleSlug } : {}),
    });
    await next();
  } catch {
    return c.json({ status: 'error', message: 'Invalid or expired token' }, 401);
  }
});

export function requireRole(...roles: StaffRole[]) {
  return createMiddleware<{ Variables: AuthVariables }>(async (c, next) => {
    const user = c.get('user');
    if (!user) {
      return c.json({ status: 'error', message: 'Authentication required' }, 401);
    }
    if (!isStaffRole(user.role) || !roles.includes(user.role)) {
      return c.json({ status: 'error', message: 'Insufficient permissions' }, 403);
    }
    await next();
  });
}
