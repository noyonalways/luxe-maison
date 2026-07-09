import Stripe from 'stripe';
import { totalsToCents } from '@luxe-maison/core';

let stripeClient: Stripe | null | undefined;

export function isStripeConfigured(): boolean {
  return Boolean(process.env.STRIPE_SECRET_KEY?.trim());
}

export function getStripe(): Stripe | null {
  if (stripeClient !== undefined) return stripeClient;

  const secretKey = process.env.STRIPE_SECRET_KEY?.trim();
  if (!secretKey) {
    stripeClient = null;
    return stripeClient;
  }

  stripeClient = new Stripe(secretKey, {
    apiVersion: '2025-02-24.acacia',
  });
  return stripeClient;
}

export function getStripePublishableKey(): string | null {
  const key = process.env.STRIPE_PUBLISHABLE_KEY?.trim();
  return key || null;
}

export async function verifyStripePayment(
  paymentIntentId: string,
  expectedTotal: number,
): Promise<{ ok: true } | { ok: false; message: string }> {
  const stripe = getStripe();
  if (!stripe) {
    return { ok: false, message: 'Card payments are not configured' };
  }

  const intent = await stripe.paymentIntents.retrieve(paymentIntentId);
  if (intent.status !== 'succeeded') {
    return { ok: false, message: 'Payment has not been completed' };
  }

  if (intent.amount !== totalsToCents(expectedTotal)) {
    return { ok: false, message: 'Payment amount does not match order total' };
  }

  return { ok: true };
}
