import type { Hono } from 'hono';
import type {
  CreateOrderInput,
  CustomerRepository,
  DiscountRepository,
  OrderRepository,
  OrderStatus,
} from '@luxe-maison/core';
import { createDiscountService, createOrderService, createCustomerService } from '@luxe-maison/core';
import {
  requireAuth,
  requireCustomerAuth,
  requireStaffAuth,
  type AuthVariables,
} from '../middleware/auth.middleware.js';
import { requireSection } from '../lib/role-permissions.js';

function isOrderStatus(value: unknown): value is OrderStatus {
  return (
    value === 'pending' ||
    value === 'processing' ||
    value === 'shipped' ||
    value === 'delivered' ||
    value === 'returned'
  );
}

function parseCreateOrderInput(body: Partial<CreateOrderInput>): CreateOrderInput | null {
  if (!Array.isArray(body.items) || body.items.length === 0) return null;
  if (!body.customerName?.trim() || !body.customerEmail?.trim() || !body.phone?.trim()) return null;
  if (!body.shippingAddress?.trim()) return null;
  if (
    typeof body.subtotal !== 'number' ||
    typeof body.shipping !== 'number' ||
    typeof body.tax !== 'number' ||
    typeof body.total !== 'number'
  ) {
    return null;
  }

  return {
    items: body.items.map((item) => ({
      productId: String(item.productId),
      productName: String(item.productName),
      size: String(item.size),
      color: String(item.color),
      quantity: Number(item.quantity),
      price: Number(item.price),
      image: String(item.image),
    })),
    customerName: body.customerName.trim(),
    customerEmail: body.customerEmail.trim().toLowerCase(),
    phone: body.phone.trim(),
    shippingAddress: body.shippingAddress.trim(),
    subtotal: body.subtotal,
    shipping: body.shipping,
    tax: body.tax,
    total: body.total,
    promoCode: body.promoCode?.trim(),
  };
}

export function orderRoutes(
  app: Hono<{ Variables: AuthVariables }>,
  {
    orderRepository,
    customerRepository,
    discountRepository,
  }: {
    orderRepository: OrderRepository;
    customerRepository: CustomerRepository;
    discountRepository: DiscountRepository;
  },
) {
  const orders = createOrderService(orderRepository);
  const customers = createCustomerService(customerRepository);
  const discounts = createDiscountService(discountRepository);

  app.get('/api/orders', requireStaffAuth, requireSection('orders', 'view'), async (c) => {
    const list = await orders.list();
    return c.json(list);
  });

  app.get('/api/orders/mine', requireCustomerAuth, async (c) => {
    const user = c.get('user');
    const list = await orders.getByCustomerEmail(user.email);
    return c.json(list);
  });

  app.get('/api/orders/track', async (c) => {
    const email = c.req.query('email')?.trim();
    const orderId = c.req.query('orderId')?.trim();
    if (!email || !orderId) {
      return c.json({ error: 'email and orderId query parameters are required' }, 400);
    }

    const order = await orders.track(email, orderId);
    if (!order) return c.json({ error: 'Order not found' }, 404);
    return c.json(order);
  });

  app.get('/api/orders/:id', requireStaffAuth, requireSection('orders', 'view'), async (c) => {
    const order = await orders.getById(c.req.param('id'));
    if (!order) return c.json({ error: 'Order not found' }, 404);
    return c.json(order);
  });

  app.post('/api/orders', requireCustomerAuth, async (c) => {
    const user = c.get('user');
    const body = await c.req.json<Partial<CreateOrderInput>>();
    const input = parseCreateOrderInput(body);
    if (!input) {
      return c.json({ status: 'error', message: 'Invalid order payload' }, 400);
    }

    if (input.customerEmail !== user.email.toLowerCase()) {
      return c.json({ status: 'error', message: 'Order email must match your account email' }, 400);
    }

    const customer = await customers.getByEmail(user.email);
    if (customer?.status === 'blocked') {
      return c.json({ status: 'error', message: 'Your account is blocked' }, 403);
    }

    if (input.promoCode) {
      const validation = await discounts.validateCode(input.promoCode, input.subtotal);
      if (!validation.valid) {
        return c.json({ status: 'error', message: validation.error ?? 'Invalid promo code' }, 400);
      }
    }

    const created = await orders.create(input);

    if (input.promoCode) {
      const discount = await discounts.getByCode(input.promoCode);
      if (discount) {
        await discounts.incrementUsedCount(discount.id);
      }
    }

    if (customer) {
      await customers.update(customer.id, {
        totalOrders: customer.totalOrders + 1,
        totalSpent: customer.totalSpent + created.total,
        lastOrderAt: created.createdAt,
      });
    }

    return c.json(created, 201);
  });

  app.patch('/api/orders/:id/status', requireStaffAuth, requireSection('orders', 'edit'), async (c) => {
    const body = await c.req.json<{ status?: unknown }>();
    if (!isOrderStatus(body.status)) {
      return c.json({ status: 'error', message: 'Invalid order status' }, 400);
    }

    const updated = await orders.updateStatus(c.req.param('id'), body.status);
    if (!updated) return c.json({ error: 'Order not found' }, 404);
    return c.json(updated);
  });

  app.patch('/api/orders/:id', requireStaffAuth, requireSection('orders', 'edit'), async (c) => {
    const body = await c.req.json<{
      trackingNumber?: string;
      carrier?: string;
      status?: unknown;
    }>();

    const updates: {
      trackingNumber?: string;
      carrier?: string;
      status?: OrderStatus;
    } = {};

    if (body.trackingNumber !== undefined) updates.trackingNumber = body.trackingNumber.trim();
    if (body.carrier !== undefined) updates.carrier = body.carrier.trim();
    if (body.status !== undefined) {
      if (!isOrderStatus(body.status)) {
        return c.json({ status: 'error', message: 'Invalid order status' }, 400);
      }
      updates.status = body.status;
    }

    if (Object.keys(updates).length === 0) {
      return c.json({ status: 'error', message: 'No valid fields to update' }, 400);
    }

    const updated = await orders.update(c.req.param('id'), updates);
    if (!updated) return c.json({ error: 'Order not found' }, 404);
    return c.json(updated);
  });

  app.post('/api/orders/:id/notes', requireStaffAuth, requireSection('orders', 'full'), async (c) => {
    const body = await c.req.json<{ note?: string }>();
    const note = body.note?.trim();
    if (!note) {
      return c.json({ status: 'error', message: 'note is required' }, 400);
    }

    const updated = await orders.appendNote(c.req.param('id'), note);
    if (!updated) return c.json({ error: 'Order not found' }, 404);
    return c.json(updated);
  });
}
