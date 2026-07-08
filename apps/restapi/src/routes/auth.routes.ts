import type { Hono } from 'hono';
import { compare } from 'bcryptjs';
import type { StaffRepository } from '@luxe-maison/core';
import { createAuthService } from '@luxe-maison/core';
import { signAccessToken } from '../lib/jwt.js';
import { requireStaffAuth, type AuthVariables } from '../middleware/auth.middleware.js';

export function authRoutes(
  app: Hono<{ Variables: AuthVariables }>,
  { staffRepository }: { staffRepository: StaffRepository },
) {
  const auth = createAuthService(staffRepository, (plain, hash) => compare(plain, hash));

  app.post('/api/auth/login', async (c) => {
    const body = await c.req.json<{ email?: string; password?: string }>();
    const email = body.email?.trim();
    const password = body.password;

    if (!email || !password) {
      return c.json({ status: 'error', message: 'Email and password are required' }, 400);
    }

    const user = await auth.login({ email, password });
    if (!user) {
      return c.json({ status: 'error', message: 'Invalid email or password' }, 401);
    }

    const tokens = await signAccessToken(user);
    return c.json({
      status: 'ok',
      user,
      tokens,
    });
  });

  app.get('/api/auth/me', requireStaffAuth, async (c) => {
    const tokenUser = c.get('user');
    const user = await auth.getUserById(tokenUser.id);
    if (!user) {
      return c.json({ status: 'error', message: 'User not found' }, 401);
    }
    return c.json({ status: 'ok', user });
  });

  app.post('/api/auth/logout', async (c) => {
    return c.json({ status: 'ok' });
  });
}
