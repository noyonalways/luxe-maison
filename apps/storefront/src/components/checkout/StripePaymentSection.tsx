'use client';

import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { Elements, PaymentElement, useElements, useStripe } from '@stripe/react-stripe-js';
import { loadStripe, type Stripe } from '@stripe/stripe-js';
import { Loader2 } from 'lucide-react';
import { paymentsApi } from '@/lib/api/payments.api';
import type { CheckoutLineItemInput } from '@luxe-maison/shared';
import { ApiError } from '@/lib/api/client';

export type StripeCheckoutRef = {
  confirmPayment: () => Promise<{ paymentIntentId: string }>;
};

type InnerProps = {
  clientSecret: string;
  paymentIntentId: string;
};

const StripePaymentInner = forwardRef<StripeCheckoutRef, InnerProps>(
  function StripePaymentInner({ clientSecret, paymentIntentId }, ref) {
    const stripe = useStripe();
    const elements = useElements();

    useImperativeHandle(ref, () => ({
      async confirmPayment() {
        if (!stripe || !elements) {
          throw new Error('Card payment is still loading. Please wait a moment.');
        }

        const { error, paymentIntent } = await stripe.confirmPayment({
          elements,
          clientSecret,
          redirect: 'if_required',
        });

        if (error) {
          throw new Error(error.message || 'Card payment failed');
        }

        if (!paymentIntent || paymentIntent.status !== 'succeeded') {
          throw new Error('Card payment was not completed');
        }

        return { paymentIntentId: paymentIntent.id || paymentIntentId };
      },
    }));

    return (
      <div className="rounded border border-border p-4 bg-secondary/30">
        <PaymentElement options={{ layout: 'tabs' }} />
      </div>
    );
  },
);

type StripePaymentSectionProps = {
  publishableKey: string;
  items: CheckoutLineItemInput[];
  promoCode?: string;
  giftWrap: boolean;
};

export const StripePaymentSection = forwardRef<StripeCheckoutRef, StripePaymentSectionProps>(
  function StripePaymentSection({ publishableKey, items, promoCode, giftWrap }, ref) {
    const [stripePromise, setStripePromise] = useState<Promise<Stripe | null> | null>(null);
    const [clientSecret, setClientSecret] = useState<string | null>(null);
    const [paymentIntentId, setPaymentIntentId] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const innerRef = useRef<StripeCheckoutRef | null>(null);

    useImperativeHandle(ref, () => ({
      confirmPayment: async () => {
        if (!innerRef.current) {
          throw new Error('Card payment is not ready');
        }
        return innerRef.current.confirmPayment();
      },
    }));

    useEffect(() => {
      setStripePromise(loadStripe(publishableKey));
    }, [publishableKey]);

    useEffect(() => {
      let cancelled = false;

      async function loadIntent() {
        setLoading(true);
        setError(null);
        try {
          const result = await paymentsApi.createStripeIntent({
            items,
            promoCode,
            giftWrap,
          });
          if (cancelled) return;
          setClientSecret(result.clientSecret);
          setPaymentIntentId(result.paymentIntentId);
        } catch (err) {
          if (cancelled) return;
          setError(err instanceof ApiError ? err.message : 'Unable to initialize card payment');
          setClientSecret(null);
          setPaymentIntentId(null);
        } finally {
          if (!cancelled) setLoading(false);
        }
      }

      void loadIntent();
      return () => {
        cancelled = true;
      };
    }, [items, promoCode, giftWrap]);

    if (loading) {
      return (
        <div className="flex items-center gap-2 text-sm text-muted-foreground py-4">
          <Loader2 size={16} className="animate-spin" />
          Preparing secure card payment…
        </div>
      );
    }

    if (error || !clientSecret || !paymentIntentId || !stripePromise) {
      return <p className="text-sm text-destructive">{error || 'Card payment is unavailable'}</p>;
    }

    return (
      <Elements stripe={stripePromise} options={{ clientSecret }}>
        <StripePaymentInner
          ref={innerRef}
          clientSecret={clientSecret}
          paymentIntentId={paymentIntentId}
        />
      </Elements>
    );
  },
);
