import { apiFetch } from '@/lib/api/client';
import type { CheckoutLineItemInput, CheckoutTotals, PaymentMethod } from '@luxe-maison/shared';

export type PaymentConfig = {
  methods: PaymentMethod[];
  stripePublishableKey: string | null;
  currency: string;
};

export type StripeIntentResponse = {
  clientSecret: string;
  paymentIntentId: string;
  totals: CheckoutTotals;
};

export type QuotePayload = {
  items: CheckoutLineItemInput[];
  promoCode?: string;
  giftWrap?: boolean;
  paymentMethod: PaymentMethod;
};

export const paymentsApi = {
  getConfig() {
    return apiFetch<PaymentConfig>('/api/payments/config');
  },

  quote(payload: QuotePayload) {
    return apiFetch<CheckoutTotals>('/api/payments/quote', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  createStripeIntent(payload: Omit<QuotePayload, 'paymentMethod'>) {
    return apiFetch<StripeIntentResponse>('/api/payments/stripe/intent', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },
};
