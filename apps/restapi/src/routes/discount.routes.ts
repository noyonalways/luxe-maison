import type { Hono } from 'hono';
import type { Discount, DiscountRepository } from '@luxe-maison/core';
import { calculateDiscount, createDiscountService } from '@luxe-maison/core';
import { requireAuth, type AuthVariables } from '../middleware/auth.middleware.js';
import { requireSection } from '../lib/role-permissions.js';

function isDiscountType(value: unknown): value is Discount['type'] {
  return value === 'percentage' || value === 'fixed';
}

function isDiscountStatus(value: unknown): value is Discount['status'] {
  return value === 'active' || value === 'expired' || value === 'disabled';
}

function deriveDiscountStatus(expiresAt: string, status: Discount['status']): Discount['status'] {
  if (status === 'disabled') return 'disabled';
  if (new Date(expiresAt) < new Date()) return 'expired';
  return status === 'expired' ? 'active' : status;
}

function parseDiscountInput(body: Partial<Discount>): Partial<Discount> {
  const updates: Partial<Discount> = {};

  if (body.code !== undefined) updates.code = body.code.trim().toUpperCase();
  if (isDiscountType(body.type)) updates.type = body.type;
  if (typeof body.value === 'number') updates.value = body.value;
  if (typeof body.minOrder === 'number') updates.minOrder = body.minOrder;
  if (typeof body.maxUses === 'number') updates.maxUses = body.maxUses;
  if (body.description !== undefined) updates.description = body.description.trim();
  if (Array.isArray(body.categories)) updates.categories = body.categories;

  if (body.expiresAt) {
    updates.expiresAt = new Date(body.expiresAt).toISOString();
  }

  if (isDiscountStatus(body.status)) {
    updates.status = body.status;
  }

  if (updates.expiresAt && updates.status) {
    updates.status = deriveDiscountStatus(updates.expiresAt, updates.status);
  } else if (updates.expiresAt && body.status && isDiscountStatus(body.status)) {
    updates.status = deriveDiscountStatus(updates.expiresAt, body.status);
  }

  return updates;
}

export function discountRoutes(
  app: Hono<{ Variables: AuthVariables }>,
  { discountRepository }: { discountRepository: DiscountRepository },
) {
  const discounts = createDiscountService(discountRepository);

  app.get('/api/discounts', requireAuth, requireSection('discounts', 'view'), async (c) => {
    const list = await discounts.list();
    return c.json(list);
  });

  app.post('/api/discounts/validate', async (c) => {
    const body = await c.req.json<{ code?: string; orderTotal?: number }>();
    const code = body.code;
    const orderTotal = body.orderTotal;

    if (!code || orderTotal === undefined) {
      return c.json({ error: 'code and orderTotal are required' }, 400);
    }

    const result = await discounts.validateCode(code, orderTotal);
    if (!result.valid) {
      return c.json({ valid: false, error: result.error }, 400);
    }

    const amount = calculateDiscount(result.promo!, orderTotal);
    return c.json({ valid: true, promo: result.promo, discountAmount: amount });
  });

  app.get('/api/discounts/:id', requireAuth, requireSection('discounts', 'view'), async (c) => {
    const discount = await discounts.getById(c.req.param('id'));
    if (!discount) return c.json({ error: 'Discount not found' }, 404);
    return c.json(discount);
  });

  app.post('/api/discounts', requireAuth, requireSection('discounts', 'edit'), async (c) => {
    const body = await c.req.json<Partial<Discount>>();

    const code = body.code?.trim().toUpperCase();
    if (!code) {
      return c.json({ status: 'error', message: 'code is required' }, 400);
    }

    if (!isDiscountType(body.type)) {
      return c.json({ status: 'error', message: 'Invalid discount type' }, 400);
    }

    if (typeof body.value !== 'number' || body.value <= 0) {
      return c.json({ status: 'error', message: 'value must be greater than 0' }, 400);
    }

    if (body.type === 'percentage' && body.value > 100) {
      return c.json({ status: 'error', message: 'percentage value cannot exceed 100' }, 400);
    }

    if (!body.expiresAt) {
      return c.json({ status: 'error', message: 'expiresAt is required' }, 400);
    }

    const existing = await discounts.getByCode(code);
    if (existing) {
      return c.json({ status: 'error', message: 'A discount with this code already exists' }, 409);
    }

    const expiresAt = new Date(body.expiresAt).toISOString();
    const requestedStatus = isDiscountStatus(body.status) ? body.status : 'active';

    const discount: Discount = {
      id: body.id || `disc-${Date.now()}`,
      code,
      type: body.type,
      value: body.value,
      minOrder: Number(body.minOrder) || 0,
      maxUses: Number(body.maxUses) || 100,
      usedCount: 0,
      status: deriveDiscountStatus(expiresAt, requestedStatus),
      expiresAt,
      categories: Array.isArray(body.categories) ? body.categories : [],
      description: body.description?.trim() || '',
      createdAt: new Date().toISOString(),
    };

    const created = await discounts.create(discount);
    return c.json(created, 201);
  });

  app.put('/api/discounts/:id', requireAuth, requireSection('discounts', 'edit'), async (c) => {
    const id = c.req.param('id');
    const body = await c.req.json<Partial<Discount>>();
    const updates = parseDiscountInput(body);

    if (updates.code !== undefined && !updates.code) {
      return c.json({ status: 'error', message: 'code cannot be empty' }, 400);
    }

    if (updates.type && !isDiscountType(updates.type)) {
      return c.json({ status: 'error', message: 'Invalid discount type' }, 400);
    }

    const value = updates.value ?? body.value;
    const type = updates.type ?? body.type;
    if (typeof value === 'number') {
      if (value <= 0) {
        return c.json({ status: 'error', message: 'value must be greater than 0' }, 400);
      }
      if (type === 'percentage' && value > 100) {
        return c.json({ status: 'error', message: 'percentage value cannot exceed 100' }, 400);
      }
    }

    const existing = await discounts.getById(id);
    if (!existing) return c.json({ error: 'Discount not found' }, 404);

    if (updates.code) {
      const duplicate = await discounts.getByCode(updates.code);
      if (duplicate && duplicate.id !== id) {
        return c.json({ status: 'error', message: 'A discount with this code already exists' }, 409);
      }
    }

    if (updates.expiresAt && !updates.status) {
      updates.status = deriveDiscountStatus(updates.expiresAt, existing.status);
    }

    const updated = await discounts.update(id, updates);
    if (!updated) return c.json({ error: 'Discount not found' }, 404);
    return c.json(updated);
  });

  app.patch('/api/discounts/:id/status', requireAuth, requireSection('discounts', 'edit'), async (c) => {
    const id = c.req.param('id');
    const existing = await discounts.getById(id);
    if (!existing) return c.json({ error: 'Discount not found' }, 404);

    const nextStatus: Discount['status'] =
      existing.status === 'active' ? 'disabled' : 'active';

    const updated = await discounts.update(id, {
      status: deriveDiscountStatus(existing.expiresAt, nextStatus),
    });

    if (!updated) return c.json({ error: 'Discount not found' }, 404);
    return c.json(updated);
  });

  app.delete('/api/discounts/:id', requireAuth, requireSection('discounts', 'full'), async (c) => {
    const deleted = await discounts.delete(c.req.param('id'));
    if (!deleted) return c.json({ error: 'Discount not found' }, 404);
    return c.json({ status: 'ok' });
  });
}
