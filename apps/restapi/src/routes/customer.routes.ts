import type { Hono } from 'hono';
import type { CustomerRepository } from '@luxe-maison/core';
import { createCustomerService } from '@luxe-maison/core';
import { requireAuth, type AuthVariables } from '../middleware/auth.middleware.js';
import { requireSection } from '../lib/role-permissions.js';

export function customerRoutes(
  app: Hono<{ Variables: AuthVariables }>,
  { customerRepository }: { customerRepository: CustomerRepository },
) {
  const customers = createCustomerService(customerRepository);

  app.get('/api/customers', requireAuth, requireSection('customers', 'view'), async (c) => {
    const list = await customers.list();
    return c.json(list);
  });

  app.get('/api/customers/:id', requireAuth, requireSection('customers', 'view'), async (c) => {
    const customer = await customers.getById(c.req.param('id'));
    if (!customer) return c.json({ error: 'Customer not found' }, 404);
    return c.json(customer);
  });
}
