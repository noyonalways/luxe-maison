import type { Hono } from 'hono';
import { compare, hash } from 'bcryptjs';
import type { CustomerRepository } from '@luxe-maison/core';
import { createCustomerAuthService } from '@luxe-maison/core';
import { signAccessToken } from '../lib/jwt.js';
import { requireCustomerAuth, type AuthVariables } from '../middleware/auth.middleware.js';

export function customerAuthRoutes(
  app: Hono<{ Variables: AuthVariables }>,
  { customerRepository }: { customerRepository: CustomerRepository },
) {
  const customerAuth = createCustomerAuthService(
    customerRepository,
    (plain, passwordHash) => compare(plain, passwordHash),
    (plain) => hash(plain, 10),
  );

  app.post('/api/customer-auth/login', async (c) => {
    const body = await c.req.json<{ email?: string; password?: string }>();
    const email = body.email?.trim();
    const password = body.password;

    if (!email || !password) {
      return c.json({ status: 'error', message: 'Email and password are required' }, 400);
    }

    const user = await customerAuth.login({ email, password });
    if (!user) {
      return c.json({ status: 'error', message: 'Invalid email or password' }, 401);
    }

    const tokens = await signAccessToken(user);
    return c.json({ status: 'ok', user, tokens });
  });

  app.post('/api/customer-auth/register', async (c) => {
    const body = await c.req.json<{
      name?: string;
      email?: string;
      password?: string;
      phone?: string;
      address?: string;
    }>();

    const name = body.name?.trim();
    const email = body.email?.trim();
    const password = body.password;
    const phone = body.phone?.trim();

    if (!name || !email || !password || !phone) {
      return c.json(
        { status: 'error', message: 'Name, email, phone, and password are required' },
        400,
      );
    }

    if (password.length < 6) {
      return c.json({ status: 'error', message: 'Password must be at least 6 characters' }, 400);
    }

    const user = await customerAuth.register({
      name,
      email,
      password,
      phone,
      address: body.address,
    });

    if (!user) {
      return c.json(
        { status: 'error', message: 'Unable to create account. Email may already be in use.' },
        409,
      );
    }

    const tokens = await signAccessToken(user);
    return c.json({ status: 'ok', user, tokens }, 201);
  });

  app.get('/api/customer-auth/me', requireCustomerAuth, async (c) => {
    const tokenUser = c.get('user');
    const user = await customerAuth.getUserById(tokenUser.id);
    if (!user) {
      return c.json({ status: 'error', message: 'User not found' }, 401);
    }
    return c.json({ status: 'ok', user });
  });

  app.post('/api/customer-auth/logout', async (c) => {
    return c.json({ status: 'ok' });
  });
}
