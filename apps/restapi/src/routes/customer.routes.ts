import type { Hono } from 'hono';
import type { Customer, CustomerRepository } from '@luxe-maison/core';
import { createCustomerService, toCustomerPublic } from '@luxe-maison/core';
import { requireAuth, type AuthVariables } from '../middleware/auth.middleware.js';
import { requireSection } from '../lib/role-permissions.js';

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isCustomerStatus(value: unknown): value is Customer['status'] {
  return value === 'active' || value === 'blocked';
}

export function customerRoutes(
  app: Hono<{ Variables: AuthVariables }>,
  { customerRepository }: { customerRepository: CustomerRepository },
) {
  const customers = createCustomerService(customerRepository);

  app.get('/api/customers', requireAuth, requireSection('customers', 'view'), async (c) => {
    const list = await customers.list();
    return c.json(list.map(toCustomerPublic));
  });

  app.get('/api/customers/:id', requireAuth, requireSection('customers', 'view'), async (c) => {
    const customer = await customers.getById(c.req.param('id'));
    if (!customer) return c.json({ error: 'Customer not found' }, 404);
    return c.json(toCustomerPublic(customer));
  });

  app.post('/api/customers', requireAuth, requireSection('customers', 'edit'), async (c) => {
    const body = await c.req.json<{
      name?: string;
      email?: string;
      phone?: string;
      address?: string;
      avatar?: string;
    }>();

    const name = body.name?.trim();
    const email = body.email?.trim().toLowerCase();
    const phone = body.phone?.trim();
    const address = body.address?.trim();

    if (!name || !email || !phone || !address) {
      return c.json(
        { status: 'error', message: 'name, email, phone, and address are required' },
        400,
      );
    }

    if (!isValidEmail(email)) {
      return c.json({ status: 'error', message: 'Invalid email address' }, 400);
    }

    const existing = await customers.getByEmail(email);
    if (existing) {
      return c.json({ status: 'error', message: 'A customer with this email already exists' }, 409);
    }

    const now = new Date().toISOString();
    const customer: Customer = {
      id: `cust-${Date.now()}`,
      name,
      email,
      phone,
      address,
      totalOrders: 0,
      totalSpent: 0,
      status: 'active',
      joinedAt: now,
      lastOrderAt: now,
      avatar: body.avatar?.trim() || undefined,
    };

    const created = await customers.create(customer);
    return c.json(toCustomerPublic(created), 201);
  });

  app.put('/api/customers/:id', requireAuth, requireSection('customers', 'edit'), async (c) => {
    const id = c.req.param('id');
    const body = await c.req.json<{
      name?: string;
      email?: string;
      phone?: string;
      address?: string;
      avatar?: string;
    }>();

    const updates: Partial<Customer> = {};

    if (body.name !== undefined) {
      const name = body.name.trim();
      if (!name) return c.json({ status: 'error', message: 'name cannot be empty' }, 400);
      updates.name = name;
    }

    if (body.email !== undefined) {
      const email = body.email.trim().toLowerCase();
      if (!email) return c.json({ status: 'error', message: 'email cannot be empty' }, 400);
      if (!isValidEmail(email)) {
        return c.json({ status: 'error', message: 'Invalid email address' }, 400);
      }
      const existing = await customers.getByEmail(email);
      if (existing && existing.id !== id) {
        return c.json({ status: 'error', message: 'A customer with this email already exists' }, 409);
      }
      updates.email = email;
    }

    if (body.phone !== undefined) {
      const phone = body.phone.trim();
      if (!phone) return c.json({ status: 'error', message: 'phone cannot be empty' }, 400);
      updates.phone = phone;
    }

    if (body.address !== undefined) {
      const address = body.address.trim();
      if (!address) return c.json({ status: 'error', message: 'address cannot be empty' }, 400);
      updates.address = address;
    }

    if (body.avatar !== undefined) {
      updates.avatar = body.avatar.trim() || undefined;
    }

    const updated = await customers.update(id, updates);
    if (!updated) return c.json({ error: 'Customer not found' }, 404);
    return c.json(toCustomerPublic(updated));
  });

  app.patch('/api/customers/:id/status', requireAuth, requireSection('customers', 'full'), async (c) => {
    const id = c.req.param('id');
    const body = await c.req.json<{ status?: Customer['status'] }>();

    if (!isCustomerStatus(body.status)) {
      return c.json({ status: 'error', message: 'status must be active or blocked' }, 400);
    }

    const updated = await customers.update(id, { status: body.status });
    if (!updated) return c.json({ error: 'Customer not found' }, 404);
    return c.json(toCustomerPublic(updated));
  });

  app.delete('/api/customers/:id', requireAuth, requireSection('customers', 'full'), async (c) => {
    const deleted = await customers.delete(c.req.param('id'));
    if (!deleted) return c.json({ error: 'Customer not found' }, 404);
    return c.json({ status: 'ok' });
  });
}
