import type { Hono } from 'hono';
import type {
  CheckoutLineItemInput,
  DiscountRepository,
  PaymentMethod,
  ProductRepository,
} from '@luxe-maison/core';
import {
  buildCheckoutQuote,
  createDiscountService,
  createProductService,
  totalsToCents,
} from '@luxe-maison/core';
import type { AuthVariables } from '../middleware/auth.middleware.js';
import { requireCustomerAuth } from '../middleware/auth.middleware.js';
import { getStripe, getStripePublishableKey, isStripeConfigured } from '../lib/stripe.js';

type QuoteBody = {
  items?: CheckoutLineItemInput[];
  promoCode?: string;
  giftWrap?: boolean;
  paymentMethod?: PaymentMethod;
};

function parseQuoteBody(body: QuoteBody) {
  if (!Array.isArray(body.items) || body.items.length === 0) return null;

  const paymentMethod = body.paymentMethod;
  if (paymentMethod !== 'cod' && paymentMethod !== 'stripe' && paymentMethod !== 'paypal') {
    return null;
  }

  return {
    items: body.items.map((item) => ({
      productId: String(item.productId),
      size: String(item.size),
      color: String(item.color),
      quantity: Number(item.quantity),
    })),
    promoCode: body.promoCode?.trim(),
    giftWrap: Boolean(body.giftWrap),
    paymentMethod,
  };
}

export function paymentRoutes(
  app: Hono<{ Variables: AuthVariables }>,
  {
    productRepository,
    discountRepository,
  }: {
    productRepository: ProductRepository;
    discountRepository: DiscountRepository;
  },
) {
  const products = createProductService(productRepository);
  const discounts = createDiscountService(discountRepository);

  const lookupProduct = (productId: string) => products.getStorefrontProductById(productId);

  const resolvePromo = async (code: string, subtotal: number) => {
    const validation = await discounts.validateCode(code, subtotal);
    if (!validation.valid || !validation.promo) {
      return null;
    }
    return validation.promo;
  };

  app.get('/api/payments/config', (c) => {
    const methods: PaymentMethod[] = ['cod', 'paypal'];
    if (isStripeConfigured()) {
      methods.splice(1, 0, 'stripe');
    }

    return c.json({
      methods,
      stripePublishableKey: getStripePublishableKey(),
      currency: 'usd',
    });
  });

  app.post('/api/payments/quote', requireCustomerAuth, async (c) => {
    const body = await c.req.json<QuoteBody>();
    const input = parseQuoteBody(body);
    if (!input) {
      return c.json({ status: 'error', message: 'Invalid checkout quote payload' }, 400);
    }

    try {
      const totals = await buildCheckoutQuote(input, lookupProduct, resolvePromo);
      return c.json(totals);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unable to calculate checkout totals';
      return c.json({ status: 'error', message }, 400);
    }
  });

  app.post('/api/payments/stripe/intent', requireCustomerAuth, async (c) => {
    const stripe = getStripe();
    if (!stripe) {
      return c.json({ status: 'error', message: 'Card payments are not configured' }, 503);
    }

    const user = c.get('user');
    const body = await c.req.json<QuoteBody>();
    const input = parseQuoteBody({ ...body, paymentMethod: 'stripe' });
    if (!input) {
      return c.json({ status: 'error', message: 'Invalid payment intent payload' }, 400);
    }

    try {
      const totals = await buildCheckoutQuote(input, lookupProduct, resolvePromo);
      const amount = totalsToCents(totals.total);
      if (amount < 50) {
        return c.json({ status: 'error', message: 'Order total is too low for card payment' }, 400);
      }

      const intent = await stripe.paymentIntents.create({
        amount,
        currency: 'usd',
        automatic_payment_methods: { enabled: true },
        metadata: {
          customerEmail: user.email,
          itemCount: String(totals.items.length),
        },
      });

      if (!intent.client_secret) {
        return c.json({ status: 'error', message: 'Failed to initialize card payment' }, 500);
      }

      return c.json({
        clientSecret: intent.client_secret,
        paymentIntentId: intent.id,
        totals,
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unable to create payment intent';
      return c.json({ status: 'error', message }, 400);
    }
  });
}
