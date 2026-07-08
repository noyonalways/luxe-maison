import type { Hono } from 'hono';
import type { AdminProduct, ProductRepository } from '@luxe-maison/core';
import { createProductService } from '@luxe-maison/core';
import { requireAuth, type AuthVariables } from '../middleware/auth.middleware.js';
import { requireSection } from '../lib/role-permissions.js';

function isValidStatus(status: unknown): status is AdminProduct['status'] {
  return status === 'active' || status === 'draft' || status === 'archived';
}

export function productRoutes(
  app: Hono<{ Variables: AuthVariables }>,
  { productRepository }: { productRepository: ProductRepository },
) {
  const products = createProductService(productRepository);

  app.get('/api/products', async (c) => {
    const list = await products.listStorefrontProducts();
    return c.json(list);
  });

  app.get('/api/products/admin', requireAuth, requireSection('products', 'view'), async (c) => {
    const list = await products.listAdminProducts();
    return c.json(list);
  });

  app.get('/api/products/admin/:id', requireAuth, requireSection('products', 'view'), async (c) => {
    const product = await products.getById(c.req.param('id'));
    if (!product) return c.json({ error: 'Product not found' }, 404);
    return c.json(product);
  });

  app.post('/api/products', requireAuth, requireSection('products', 'edit'), async (c) => {
    const body = await c.req.json<AdminProduct>();
    if (!body.name?.trim() || !body.sku?.trim()) {
      return c.json({ status: 'error', message: 'name and sku are required' }, 400);
    }

    const product: AdminProduct = {
      ...body,
      id: body.id || `prod-${Date.now()}`,
      name: body.name.trim(),
      sku: body.sku.trim(),
      createdAt: body.createdAt || new Date().toISOString(),
      status: isValidStatus(body.status) ? body.status : 'draft',
    };

    const created = await products.create(product);
    return c.json(created, 201);
  });

  app.put('/api/products/:id', requireAuth, requireSection('products', 'edit'), async (c) => {
    const id = c.req.param('id');
    const body = await c.req.json<Partial<AdminProduct>>();

    const updated = await products.update(id, {
      ...body,
      ...(body.name ? { name: body.name.trim() } : {}),
      ...(body.sku ? { sku: body.sku.trim() } : {}),
      ...(body.status && isValidStatus(body.status) ? { status: body.status } : {}),
    });

    if (!updated) return c.json({ error: 'Product not found' }, 404);
    return c.json(updated);
  });

  app.patch('/api/products/:id/status', requireAuth, requireSection('products', 'edit'), async (c) => {
    const id = c.req.param('id');
    const existing = await products.getById(id);
    if (!existing || !('status' in existing)) {
      return c.json({ error: 'Product not found' }, 404);
    }

    const nextStatus: AdminProduct['status'] =
      existing.status === 'active' ? 'archived' : 'active';

    const updated = await products.update(id, { status: nextStatus });
    if (!updated) return c.json({ error: 'Product not found' }, 404);
    return c.json(updated);
  });

  app.delete('/api/products/:id', requireAuth, requireSection('products', 'full'), async (c) => {
    const deleted = await products.delete(c.req.param('id'));
    if (!deleted) return c.json({ error: 'Product not found' }, 404);
    return c.json({ status: 'ok' });
  });

  app.get('/api/products/:id', async (c) => {
    const product = await products.getStorefrontProductById(c.req.param('id'));
    if (!product) return c.json({ error: 'Product not found' }, 404);
    return c.json(product);
  });
}
