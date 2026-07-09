"use client";

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AlertCircle,
  ArrowRight,
  Loader2,
  Mail,
  Package,
  Search,
  UserCircle,
} from 'lucide-react';
import type { Order } from '@luxe-maison/shared';
import { useAuth } from '@/context/AuthContext';
import { useCustomer } from '@/context/CustomerContext';
import { ordersApi } from '@/lib/api/orders.api';
import { ApiError } from '@/lib/api/client';
import OrderDetailView from '@/components/account/OrderDetailView';
import OrderStatusBadge from '@/components/account/OrderStatusBadge';
import { formatCurrency } from '@/components/account/account-utils';
import { PageBody, PageHero, PageMain } from '@/components/layout/PageShell';

function TrackField({
  label,
  value,
  onChange,
  type = 'text',
  placeholder,
  icon: Icon,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  placeholder?: string;
  icon?: typeof Package;
}) {
  return (
    <div>
      <label className="block text-xs font-body font-medium letter-wide uppercase text-muted-foreground mb-1.5">
        {label}
      </label>
      <div className="relative">
        {Icon && (
          <Icon size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
        )}
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          required
          className={`w-full py-3 border border-border text-sm bg-background transition-smooth focus:outline-none focus:border-foreground ${
            Icon ? 'pl-11 pr-4' : 'px-4'
          }`}
        />
      </div>
    </div>
  );
}

export default function TrackOrderPage() {
  const searchParams = useSearchParams();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const { orders: myOrders, isLoadingOrders } = useCustomer();

  const [orderId, setOrderId] = useState('');
  const [email, setEmail] = useState('');
  const [result, setResult] = useState<Order | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [initialized, setInitialized] = useState(false);

  const trackOrder = useCallback(async (id: string, address: string) => {
    const trimmedId = id.trim();
    const trimmedEmail = address.trim();

    if (!trimmedId || !trimmedEmail) {
      setError('Please enter both your order ID and email address.');
      return;
    }

    setLoading(true);
    setError('');
    setResult(null);

    try {
      if (isAuthenticated && user?.email.toLowerCase() === trimmedEmail.toLowerCase()) {
        const owned = myOrders.find(
          (order) => order.id.toLowerCase() === trimmedId.toLowerCase(),
        );
        if (owned) {
          setResult(owned);
          setLoading(false);
          return;
        }
      }

      const order = await ordersApi.track(trimmedId, trimmedEmail);
      setResult(order);
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : 'No order found. Please check your order ID and email address.',
      );
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, user?.email, myOrders]);

  useEffect(() => {
    if (user?.email && !email) {
      setEmail(user.email);
    }
  }, [user?.email, email]);

  useEffect(() => {
    if (initialized) return;

    const paramOrderId = searchParams.get('orderId') ?? searchParams.get('order');
    const paramEmail = searchParams.get('email');

    if (paramOrderId) setOrderId(paramOrderId);
    if (paramEmail) setEmail(paramEmail);

    const emailToUse = paramEmail ?? user?.email;

    if (paramOrderId && emailToUse) {
      void trackOrder(paramOrderId, emailToUse);
      setInitialized(true);
      return;
    }

    if (paramOrderId && !emailToUse && authLoading) {
      return;
    }

    setInitialized(true);
  }, [initialized, searchParams, user?.email, authLoading, trackOrder]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    void trackOrder(orderId, email);
  };

  const handleQuickTrack = (order: Order) => {
    setOrderId(order.id);
    setEmail(order.customerEmail);
    setResult(order);
    setError('');
  };

  const handleBackToSearch = () => {
    setResult(null);
    setError('');
  };

  if (result) {
    return (
      <PageMain className="bg-cream/30">
        <PageBody offset wide>
          <OrderDetailView
            order={result}
            onBack={handleBackToSearch}
            backLabel="Track another order"
          />
        </PageBody>
      </PageMain>
    );
  }

  return (
    <PageMain>
      <PageHero
        align="center"
        eyebrow="Order tracking"
        title="Track your order"
        description="Enter the order ID from your confirmation email along with the email used at checkout."
      />

      <PageBody narrow className="py-10 lg:py-12">
          <form onSubmit={handleSubmit} className="space-y-5">
            <TrackField
              label="Order ID"
              value={orderId}
              onChange={setOrderId}
              placeholder="e.g. ORD-1006"
              icon={Package}
            />
            <TrackField
              label="Email address"
              value={email}
              onChange={setEmail}
              type="email"
              placeholder="you@example.com"
              icon={Mail}
            />

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-primary text-primary-foreground text-sm font-medium letter-wide uppercase transition-smooth hover:opacity-90 disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Looking up your order…
                </>
              ) : (
                <>
                  <Search size={16} />
                  Track order
                </>
              )}
            </button>
          </form>

          {isAuthenticated && (
            <p className="mt-4 text-xs text-muted-foreground text-center">
              Signed in as {user?.email}. Your email has been pre-filled.
            </p>
          )}

        <AnimatePresence mode="wait">
          {error && (
            <motion.div
              key="error"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex items-start gap-3 p-5 border border-destructive/20 bg-destructive/5 text-sm text-destructive mb-8"
            >
              <AlertCircle size={18} className="flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium">We couldn&apos;t find that order</p>
                <p className="mt-1 opacity-90">{error}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {isAuthenticated && (
          <section className="mb-8">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <UserCircle size={18} className="text-gold" />
                <h2 className="font-heading text-xl">Your recent orders</h2>
              </div>
              <Link
                href="/account"
                className="text-xs font-medium text-muted-foreground transition-smooth hover-gold inline-flex items-center gap-1"
              >
                View account <ArrowRight size={14} />
              </Link>
            </div>

            {isLoadingOrders ? (
              <div className="flex items-center justify-center py-10 text-muted-foreground gap-2">
                <Loader2 size={16} className="animate-spin" />
                <span className="text-sm">Loading your orders…</span>
              </div>
            ) : myOrders.length === 0 ? (
              <div className="border border-border px-6 py-10 text-center text-sm text-muted-foreground">
                You don&apos;t have any orders yet.{' '}
                <Link href="/shop" className="text-foreground underline underline-offset-4 hover:text-gold">
                  Start shopping
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {myOrders.slice(0, 5).map((order) => (
                  <button
                    key={order.id}
                    type="button"
                    onClick={() => handleQuickTrack(order)}
                    className="w-full text-left border border-border p-4 transition-smooth hover:border-foreground group"
                  >
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <div className="flex flex-wrap items-center gap-3 mb-1">
                          <span className="text-sm font-medium">{order.id}</span>
                          <OrderStatusBadge status={order.status} />
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(order.createdAt), 'MMMM d, yyyy')}
                          <span className="mx-2">·</span>
                          {order.items.length} {order.items.length === 1 ? 'item' : 'items'}
                        </p>
                      </div>
                      <div className="flex items-center gap-3 sm:flex-col sm:items-end">
                        <span className="font-heading text-lg">{formatCurrency(order.total)}</span>
                        <span className="text-xs text-muted-foreground transition-smooth group-hover:text-gold">
                          Track this order
                        </span>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </section>
        )}

        <section className="border border-border bg-cream/40 p-6">
          <h3 className="text-xs font-body font-semibold letter-wide uppercase text-muted-foreground mb-3">
            Need help?
          </h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Your order ID appears in your confirmation email and on your receipt. Tracking updates
            when your order is processed and shipped. For account holders, you can also manage orders
            from{' '}
            <Link href="/account" className="text-foreground underline underline-offset-4 hover:text-gold">
              My Account
            </Link>
            .
          </p>
        </section>
      </PageBody>
    </PageMain>
  );
}
