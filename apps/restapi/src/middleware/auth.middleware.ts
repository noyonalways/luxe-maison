import { createMiddleware } from 'hono/factory';
import type { AuthUser, StaffRole } from '@luxe-maison/core';
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
    if (!roles.includes(user.role)) {
      return c.json({ status: 'error', message: 'Insufficient permissions' }, 403);
    }
    await next();
  });
}
