import type { Hono } from 'hono';
import type {
  CheckoutLineItemInput,
  CustomerRepository,
  DiscountRepository,
  OrderRepository,
  OrderStatus,
  PaymentMethod,
  PaymentStatus,
  ProductRepository,
} from '@luxe-maison/core';
import {
  buildCheckoutQuote,
  createCustomerService,
  createDiscountService,
  createOrderService,
  createProductService,
} from '@luxe-maison/core';
import {
  requireCustomerAuth,
  requireStaffAuth,
  type AuthVariables,
} from '../middleware/auth.middleware.js';
import { requireSection } from '../lib/role-permissions.js';
import { verifyStripePayment } from '../lib/stripe.js';

function isOrderStatus(value: unknown): value is OrderStatus {
  return (
    value === 'pending' ||
    value === 'processing' ||
    value === 'shipped' ||
    value === 'delivered' ||
    value === 'returned'
  );
}

function isPaymentMethod(value: unknown): value is PaymentMethod {
  return value === 'cod' || value === 'stripe' || value === 'paypal';
}

type CreateOrderBody = {
  items?: CheckoutLineItemInput[];
  customerName?: string;
  customerEmail?: string;
  phone?: string;
  shippingAddress?: string;
  paymentMethod?: PaymentMethod;
  stripePaymentIntentId?: string;
  promoCode?: string;
  giftWrap?: boolean;
  giftMessage?: string;
};

function paymentStatusForMethod(method: PaymentMethod): PaymentStatus {
  if (method === 'cod') return 'pending_collection';
  if (method === 'stripe') return 'paid';
  return 'pending';
}

export function orderRoutes(
  app: Hono<{ Variables: AuthVariables }>,
  {
    orderRepository,
    customerRepository,
    discountRepository,
    productRepository,
  }: {
    orderRepository: OrderRepository;
    customerRepository: CustomerRepository;
    discountRepository: DiscountRepository;
    productRepository: ProductRepository;
  },
) {
  const orders = createOrderService(orderRepository);
  const customers = createCustomerService(customerRepository);
  const discounts = createDiscountService(discountRepository);
  const products = createProductService(productRepository);

  const lookupProduct = (productId: string) => products.getStorefrontProductById(productId);

  const resolvePromo = async (code: string, subtotal: number) => {
    const validation = await discounts.validateCode(code, subtotal);
    if (!validation.valid || !validation.promo) {
      return null;
    }
    return validation.promo;
  };

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
    const body = await c.req.json<CreateOrderBody>();

    if (!Array.isArray(body.items) || body.items.length === 0) {
      return c.json({ status: 'error', message: 'Order must include at least one item' }, 400);
    }

    if (!body.customerName?.trim() || !body.customerEmail?.trim() || !body.phone?.trim()) {
      return c.json({ status: 'error', message: 'Customer details are required' }, 400);
    }

    if (!body.shippingAddress?.trim()) {
      return c.json({ status: 'error', message: 'Shipping address is required' }, 400);
    }

    if (!isPaymentMethod(body.paymentMethod)) {
      return c.json({ status: 'error', message: 'Select a valid payment method' }, 400);
    }

    const customerEmail = body.customerEmail.trim().toLowerCase();
    if (customerEmail !== user.email.toLowerCase()) {
      return c.json({ status: 'error', message: 'Order email must match your account email' }, 400);
    }

    const customer = await customers.getByEmail(user.email);
    if (customer?.status === 'blocked') {
      return c.json({ status: 'error', message: 'Your account is blocked' }, 403);
    }

    let totals;
    try {
      totals = await buildCheckoutQuote(
        {
          items: body.items.map((item) => ({
            productId: String(item.productId),
            size: String(item.size),
            color: String(item.color),
            quantity: Number(item.quantity),
          })),
          promoCode: body.promoCode?.trim(),
          giftWrap: Boolean(body.giftWrap),
          paymentMethod: body.paymentMethod,
        },
        lookupProduct,
        resolvePromo,
      );
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unable to validate order totals';
      return c.json({ status: 'error', message }, 400);
    }

    if (body.paymentMethod === 'stripe') {
      const paymentIntentId = body.stripePaymentIntentId?.trim();
      if (!paymentIntentId) {
        return c.json({ status: 'error', message: 'Card payment must be completed before placing the order' }, 400);
      }

      const verification = await verifyStripePayment(paymentIntentId, totals.total);
      if (!verification.ok) {
        return c.json({ status: 'error', message: verification.message }, 400);
      }
    }

    const created = await orders.create({
      items: totals.items,
      customerName: body.customerName.trim(),
      customerEmail,
      phone: body.phone.trim(),
      shippingAddress: body.shippingAddress.trim(),
      totals,
      paymentMethod: body.paymentMethod,
      paymentStatus: paymentStatusForMethod(body.paymentMethod),
      stripePaymentIntentId: body.stripePaymentIntentId?.trim(),
      giftWrap: Boolean(body.giftWrap),
      giftMessage: body.giftMessage,
    });

    if (totals.promoCode) {
      const discount = await discounts.getByCode(totals.promoCode);
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
      paymentStatus?: unknown;
    }>();

    const updates: {
      trackingNumber?: string;
      carrier?: string;
      status?: OrderStatus;
      paymentStatus?: PaymentStatus;
    } = {};

    if (body.trackingNumber !== undefined) updates.trackingNumber = body.trackingNumber.trim();
    if (body.carrier !== undefined) updates.carrier = body.carrier.trim();
    if (body.status !== undefined) {
      if (!isOrderStatus(body.status)) {
        return c.json({ status: 'error', message: 'Invalid order status' }, 400);
      }
      updates.status = body.status;
    }
    if (body.paymentStatus !== undefined) {
      const allowed: PaymentStatus[] = ['pending', 'pending_collection', 'paid', 'failed', 'refunded'];
      if (!allowed.includes(body.paymentStatus as PaymentStatus)) {
        return c.json({ status: 'error', message: 'Invalid payment status' }, 400);
      }
      updates.paymentStatus = body.paymentStatus as PaymentStatus;
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
