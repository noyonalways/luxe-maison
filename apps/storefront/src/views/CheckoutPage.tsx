'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowLeft, CreditCard, Banknote, Check, Lock, Tag, Printer, Wallet } from 'lucide-react';
import { z } from 'zod';
import { useQuery } from '@tanstack/react-query';
import { CHECKOUT_CONFIG, type PaymentMethod } from '@luxe-maison/shared';
import { useCart, CartItem } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { ordersApi } from '@/lib/api/orders.api';
import { paymentsApi } from '@/lib/api/payments.api';
import { discountsApi } from '@/lib/api/discounts.api';
import { ApiError } from '@/lib/api/client';
import { StripePaymentSection, type StripeCheckoutRef } from '@/components/checkout/StripePaymentSection';
import { PageBody, PageCenter, PageHero, PageMain } from '@/components/layout/PageShell';

const shippingSchema = z.object({
  firstName: z.string().trim().min(1, 'First name is required').max(50, 'Max 50 characters'),
  lastName: z.string().trim().min(1, 'Last name is required').max(50, 'Max 50 characters'),
  email: z.string().trim().email('Invalid email address').max(255, 'Max 255 characters'),
  phone: z.string().trim().min(7, 'Valid phone number required').max(20, 'Max 20 characters'),
  address: z.string().trim().min(5, 'Address is required').max(200, 'Max 200 characters'),
  city: z.string().trim().min(1, 'City is required').max(100, 'Max 100 characters'),
  state: z.string().trim().min(1, 'State is required').max(100, 'Max 100 characters'),
  zip: z.string().trim().min(3, 'Postal code is required').max(20, 'Max 20 characters'),
  country: z.string().trim().min(1, 'Country is required').max(100, 'Max 100 characters'),
});

type ShippingData = z.infer<typeof shippingSchema>;
type FieldErrors = Record<string, string>;

type AppliedPromo = {
  code: string;
  discountAmount: number;
  description?: string;
};

type OrderTotals = {
  subtotal: number;
  shipping: number;
  giftWrap: number;
  codFee: number;
  discount: number;
  tax: number;
  total: number;
};

const PAYMENT_LABELS: Record<PaymentMethod, string> = {
  cod: 'Cash on Delivery',
  stripe: 'Credit / Debit Card',
  paypal: 'PayPal',
};

function buildLineItems(items: CartItem[]) {
  return items.map((item) => ({
    productId: item.product.id,
    size: item.selectedSize,
    color: item.selectedColor,
    quantity: item.quantity,
  }));
}

function calculateLocalTotals(
  subtotal: number,
  paymentMethod: PaymentMethod,
  giftWrap: boolean,
  discount: number,
): OrderTotals {
  const shipping =
    subtotal >= CHECKOUT_CONFIG.FREE_SHIPPING_THRESHOLD ? 0 : CHECKOUT_CONFIG.SHIPPING_RATE;
  const giftWrapAmount = giftWrap ? CHECKOUT_CONFIG.GIFT_WRAP_COST : 0;
  const codFee = paymentMethod === 'cod' ? CHECKOUT_CONFIG.COD_FEE : 0;
  const taxableBase = Math.max(0, subtotal + shipping + giftWrapAmount + codFee - discount);
  const tax = Math.round(taxableBase * CHECKOUT_CONFIG.TAX_RATE * 100) / 100;
  const total = Math.round((taxableBase + tax) * 100) / 100;

  return {
    subtotal,
    shipping,
    giftWrap: giftWrapAmount,
    codFee,
    discount,
    tax,
    total,
  };
}

export default function CheckoutPage() {
  const { items, totalPrice, totalItems, clearCart } = useCart();
  const { user } = useAuth();
  const stripeRef = useRef<StripeCheckoutRef | null>(null);

  const [shipping, setShipping] = useState<ShippingData>({
    firstName: '', lastName: '', email: '', phone: '',
    address: '', city: '', state: '', zip: '', country: '',
  });
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cod');
  const [shippingErrors, setShippingErrors] = useState<FieldErrors>({});
  const [paymentErrors, setPaymentErrors] = useState<FieldErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [giftWrap, setGiftWrap] = useState(false);
  const [giftMessage, setGiftMessage] = useState('');

  const [promoInput, setPromoInput] = useState('');
  const [appliedPromo, setAppliedPromo] = useState<AppliedPromo | null>(null);
  const [promoError, setPromoError] = useState('');

  const [orderNumber, setOrderNumber] = useState('');
  const [orderDate, setOrderDate] = useState('');
  const [confirmedPaymentLabel, setConfirmedPaymentLabel] = useState('');
  const [orderItems, setOrderItems] = useState<CartItem[]>([]);
  const [orderTotals, setOrderTotals] = useState<OrderTotals>({
    subtotal: 0, shipping: 0, giftWrap: 0, codFee: 0, discount: 0, tax: 0, total: 0,
  });

  const receiptRef = useRef<HTMLDivElement>(null);
  const lineItems = useMemo(() => buildLineItems(items), [items]);
  const discount = appliedPromo?.discountAmount ?? 0;
  const totals = calculateLocalTotals(totalPrice, paymentMethod, giftWrap, discount);

  const { data: paymentConfig } = useQuery({
    queryKey: ['payments', 'config'],
    queryFn: () => paymentsApi.getConfig(),
    staleTime: 60_000,
  });

  const availableMethods = paymentConfig?.methods ?? ['cod', 'paypal'];

  useEffect(() => {
    if (!availableMethods.includes(paymentMethod)) {
      setPaymentMethod(availableMethods[0] ?? 'cod');
    }
  }, [availableMethods, paymentMethod]);

  useEffect(() => {
    if (!user) return;
    setShipping((prev) => ({
      ...prev,
      email: user.email,
      firstName: prev.firstName || user.name.split(' ')[0] || '',
      lastName: prev.lastName || user.name.split(' ').slice(1).join(' ') || '',
    }));
  }, [user]);

  const handleApplyPromo = async () => {
    setPromoError('');
    if (!promoInput.trim()) {
      setPromoError('Please enter a promo code');
      return;
    }
    try {
      const result = await discountsApi.validate(promoInput, totalPrice);
      setAppliedPromo({
        code: result.promo.code,
        discountAmount: result.discountAmount,
        description: result.promo.description,
      });
      setPromoError('');
    } catch (err) {
      setPromoError(err instanceof ApiError ? err.message : 'Invalid code');
      setAppliedPromo(null);
    }
  };

  const handleRemovePromo = () => {
    setAppliedPromo(null);
    setPromoInput('');
    setPromoError('');
  };

  if (totalItems === 0 && !orderPlaced) {
    return (
      <PageCenter>
        <div className="text-center">
          <h1 className="font-heading text-2xl mb-4">Your bag is empty</h1>
          <Link href="/shop" className="text-sm text-gold underline underline-offset-4">
            Continue Shopping
          </Link>
        </div>
      </PageCenter>
    );
  }

  if (orderPlaced) {
    return (
      <PageMain className="bg-cream/30">
        <PageBody offset narrow className="py-8 lg:py-12">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div ref={receiptRef} className="border border-border p-8 lg:p-10 bg-background">
              <div className="text-center mb-8">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-5">
                  <Check size={28} className="text-gold" />
                </div>
                <h1 className="font-heading text-3xl mb-2">Order Confirmed</h1>
                <p className="text-sm text-muted-foreground">Thank you, {shipping.firstName}!</p>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-8 pb-6 border-b border-border">
                <div>
                  <p className="text-xs font-body font-semibold letter-wide uppercase text-muted-foreground mb-1">Order Number</p>
                  <p className="text-sm font-medium">{orderNumber}</p>
                </div>
                <div>
                  <p className="text-xs font-body font-semibold letter-wide uppercase text-muted-foreground mb-1">Date</p>
                  <p className="text-sm font-medium">{orderDate}</p>
                </div>
                <div>
                  <p className="text-xs font-body font-semibold letter-wide uppercase text-muted-foreground mb-1">Email</p>
                  <p className="text-sm font-medium">{shipping.email}</p>
                </div>
                <div>
                  <p className="text-xs font-body font-semibold letter-wide uppercase text-muted-foreground mb-1">Payment</p>
                  <p className="text-sm font-medium">{confirmedPaymentLabel}</p>
                </div>
              </div>

              <div className="mb-8 pb-6 border-b border-border">
                <p className="text-xs font-body font-semibold letter-wide uppercase text-muted-foreground mb-2">Shipping To</p>
                <p className="text-sm">{shipping.firstName} {shipping.lastName}</p>
                <p className="text-sm text-muted-foreground">{shipping.address}</p>
                <p className="text-sm text-muted-foreground">{shipping.city}, {shipping.state} {shipping.zip}</p>
                <p className="text-sm text-muted-foreground">{shipping.country}</p>
              </div>

              <div className="mb-8 pb-6 border-b border-border">
                <p className="text-xs font-body font-semibold letter-wide uppercase text-muted-foreground mb-4">Items Ordered</p>
                <div className="space-y-3">
                  {orderItems.map((item) => (
                    <div key={`${item.product.id}-${item.selectedSize}-${item.selectedColor}`} className="flex justify-between items-start">
                      <div>
                        <p className="text-sm font-medium">{item.product.name}</p>
                        <p className="text-xs text-muted-foreground">{item.selectedColor} · {item.selectedSize} · Qty {item.quantity}</p>
                      </div>
                      <p className="text-sm font-medium">${(item.product.price * item.quantity).toFixed(2)}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>${orderTotals.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Shipping</span>
                  <span>{orderTotals.shipping === 0 ? 'Free' : `$${orderTotals.shipping.toFixed(2)}`}</span>
                </div>
                {orderTotals.giftWrap > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Gift Wrap</span>
                    <span>${orderTotals.giftWrap.toFixed(2)}</span>
                  </div>
                )}
                {orderTotals.codFee > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">COD Fee</span>
                    <span>${orderTotals.codFee.toFixed(2)}</span>
                  </div>
                )}
                {orderTotals.discount > 0 && (
                  <div className="flex justify-between text-sm text-gold">
                    <span>Discount</span>
                    <span>-${orderTotals.discount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Tax</span>
                  <span>${orderTotals.tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-lg font-heading font-semibold pt-3 border-t border-border">
                  <span>Total</span>
                  <span>${orderTotals.total.toFixed(2)}</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 mt-6">
              <button
                onClick={() => window.print()}
                className="flex-1 py-3 border border-foreground text-sm font-medium letter-wide uppercase transition-smooth hover:bg-foreground hover:text-background flex items-center justify-center gap-2"
              >
                <Printer size={14} /> Print Receipt
              </button>
              <Link
                href={`/track-order?orderId=${encodeURIComponent(orderNumber)}&email=${encodeURIComponent(shipping.email)}`}
                className="flex-1 py-3 border border-foreground text-sm font-medium letter-wide uppercase transition-smooth hover:bg-foreground hover:text-background text-center"
              >
                Track Order
              </Link>
              <Link
                href="/shop"
                className="flex-1 py-3 bg-primary text-primary-foreground text-sm font-medium letter-wide uppercase transition-smooth hover:opacity-90 text-center"
              >
                Continue Shopping
              </Link>
            </div>
          </motion.div>
        </PageBody>
      </PageMain>
    );
  }

  const updateShipping = (field: keyof ShippingData, value: string) => {
    setShipping((prev) => ({ ...prev, [field]: value }));
    if (shippingErrors[field]) {
      setShippingErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const handleSubmit = async () => {
    const shipResult = shippingSchema.safeParse(shipping);
    const sErrors: FieldErrors = {};

    if (!shipResult.success) {
      shipResult.error.issues.forEach((issue) => {
        sErrors[issue.path[0] as string] = issue.message;
      });
    }

    setShippingErrors(sErrors);
    setPaymentErrors({});

    if (Object.keys(sErrors).length > 0) return;

    setIsSubmitting(true);
    const savedItems = [...items];
    const savedTotals = { ...totals };

    try {
      let stripePaymentIntentId: string | undefined;

      if (paymentMethod === 'stripe') {
        if (!stripeRef.current) {
          throw new Error('Card payment is not ready yet');
        }
        const payment = await stripeRef.current.confirmPayment();
        stripePaymentIntentId = payment.paymentIntentId;
      }

      const order = await ordersApi.create({
        items: lineItems,
        customerName: `${shipping.firstName} ${shipping.lastName}`.trim(),
        customerEmail: shipping.email,
        phone: shipping.phone,
        shippingAddress: `${shipping.address}, ${shipping.city}, ${shipping.state} ${shipping.zip}, ${shipping.country}`,
        paymentMethod,
        stripePaymentIntentId,
        promoCode: appliedPromo?.code,
        giftWrap,
        giftMessage: giftWrap ? giftMessage : undefined,
      });

      clearCart();
      setOrderNumber(order.id);
      setOrderDate(new Date(order.createdAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }));
      setConfirmedPaymentLabel(PAYMENT_LABELS[paymentMethod]);
      setOrderItems(savedItems);
      setOrderTotals(savedTotals);
      setOrderPlaced(true);
    } catch (err) {
      setPaymentErrors({
        method: err instanceof ApiError || err instanceof Error ? err.message : 'Unable to place order. Please try again.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const paymentOptions = ([
    { id: 'cod' as const, label: 'Cash on Delivery', icon: Banknote },
    { id: 'stripe' as const, label: 'Credit / Debit Card', icon: CreditCard },
    { id: 'paypal' as const, label: 'PayPal', icon: Wallet },
  ] satisfies { id: PaymentMethod; label: string; icon: typeof CreditCard }[])
    .filter((option) => availableMethods.includes(option.id));

  const Input = ({ label, field, value, onChange, error, type = 'text', placeholder = '' }: {
    label: string; field: string; value: string; onChange: (v: string) => void; error?: string; type?: string; placeholder?: string;
  }) => (
    <div>
      <label className="block text-xs font-body font-medium letter-wide uppercase text-muted-foreground mb-1.5">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`w-full px-4 py-3 border text-sm bg-background transition-smooth focus:outline-none focus:border-foreground ${
          error ? 'border-destructive' : 'border-border'
        }`}
      />
      {error && <p className="text-xs text-destructive mt-1">{error}</p>}
    </div>
  );

  return (
    <PageMain>
      <PageHero title="Checkout" description="Complete your order below." />

      <PageBody className="py-8 lg:py-10">
        <Link href="/shop" className="inline-flex items-center gap-2 text-xs text-muted-foreground transition-smooth hover-gold mb-8">
          <ArrowLeft size={14} /> Back to Shop
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16">
          <div className="lg:col-span-7 space-y-10">
            <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <h2 className="font-heading text-xl mb-6">Shipping Address</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input label="First Name" field="firstName" value={shipping.firstName} onChange={(v) => updateShipping('firstName', v)} error={shippingErrors.firstName} />
                <Input label="Last Name" field="lastName" value={shipping.lastName} onChange={(v) => updateShipping('lastName', v)} error={shippingErrors.lastName} />
                <Input label="Email" field="email" value={shipping.email} onChange={(v) => updateShipping('email', v)} error={shippingErrors.email} type="email" placeholder="you@example.com" />
                <Input label="Phone" field="phone" value={shipping.phone} onChange={(v) => updateShipping('phone', v)} error={shippingErrors.phone} type="tel" />
                <div className="sm:col-span-2">
                  <Input label="Address" field="address" value={shipping.address} onChange={(v) => updateShipping('address', v)} error={shippingErrors.address} />
                </div>
                <Input label="City" field="city" value={shipping.city} onChange={(v) => updateShipping('city', v)} error={shippingErrors.city} />
                <Input label="State / Province" field="state" value={shipping.state} onChange={(v) => updateShipping('state', v)} error={shippingErrors.state} />
                <Input label="Postal Code" field="zip" value={shipping.zip} onChange={(v) => updateShipping('zip', v)} error={shippingErrors.zip} />
                <Input label="Country" field="country" value={shipping.country} onChange={(v) => updateShipping('country', v)} error={shippingErrors.country} />
              </div>
            </motion.section>

            <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
              <h2 className="font-heading text-xl mb-6">Gift Options</h2>
              <label className="flex items-center gap-3 cursor-pointer">
                <div
                  onClick={() => setGiftWrap(!giftWrap)}
                  className={`w-5 h-5 border flex items-center justify-center transition-smooth ${
                    giftWrap ? 'bg-foreground border-foreground' : 'border-border'
                  }`}
                >
                  {giftWrap && <Check size={12} className="text-background" />}
                </div>
                <span className="text-sm">Add gift wrapping (+${CHECKOUT_CONFIG.GIFT_WRAP_COST.toFixed(2)})</span>
              </label>
              {giftWrap && (
                <textarea
                  value={giftMessage}
                  onChange={(e) => setGiftMessage(e.target.value.slice(0, 200))}
                  placeholder="Add a personalized message (optional)"
                  rows={3}
                  className="w-full mt-4 px-4 py-3 border border-border text-sm bg-background transition-smooth focus:outline-none focus:border-foreground resize-none"
                />
              )}
            </motion.section>

            <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
              <h2 className="font-heading text-xl mb-6">Payment Method</h2>

              <div className="flex flex-col sm:flex-row gap-3 mb-6">
                {paymentOptions.map(({ id, label, icon: Icon }) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setPaymentMethod(id)}
                    className={`flex-1 flex items-center gap-3 px-5 py-4 border text-sm font-medium transition-smooth ${
                      paymentMethod === id ? 'border-foreground bg-secondary' : 'border-border hover:border-foreground'
                    }`}
                  >
                    <Icon size={18} />
                    {label}
                  </button>
                ))}
              </div>
              {paymentErrors.method && <p className="text-xs text-destructive mb-4">{paymentErrors.method}</p>}

              {paymentMethod === 'stripe' && paymentConfig?.stripePublishableKey && (
                <StripePaymentSection
                  ref={stripeRef}
                  publishableKey={paymentConfig.stripePublishableKey}
                  items={lineItems}
                  promoCode={appliedPromo?.code}
                  giftWrap={giftWrap}
                />
              )}

              {paymentMethod === 'cod' && (
                <div className="px-5 py-4 bg-secondary text-sm text-muted-foreground">
                  Pay with cash when your order is delivered. A ${CHECKOUT_CONFIG.COD_FEE.toFixed(2)} COD fee applies.
                </div>
              )}

              {paymentMethod === 'paypal' && (
                <div className="px-5 py-4 bg-secondary text-sm text-muted-foreground">
                  Your order will be placed with PayPal payment pending. Our team will send a PayPal invoice to complete payment.
                </div>
              )}
            </motion.section>
          </div>

          <div className="lg:col-span-5">
            <div className="lg:sticky lg:top-28">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="border border-border p-6"
              >
                <h2 className="font-heading text-xl mb-6">Order Summary</h2>

                <div className="space-y-4 mb-6 max-h-64 overflow-y-auto">
                  {items.map((item) => (
                    <div key={`${item.product.id}-${item.selectedSize}-${item.selectedColor}`} className="flex gap-3">
                      <div className="w-14 h-18 bg-secondary overflow-hidden flex-shrink-0">
                        <img src={item.product.images[0]} alt={item.product.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{item.product.name}</p>
                        <p className="text-xs text-muted-foreground">{item.selectedColor} · {item.selectedSize} · Qty {item.quantity}</p>
                      </div>
                      <p className="text-sm font-medium">${(item.product.price * item.quantity).toFixed(2)}</p>
                    </div>
                  ))}
                </div>

                <div className="mb-6 pb-4 border-b border-border">
                  <p className="text-xs font-body font-semibold letter-wide uppercase text-muted-foreground mb-2">Promo Code</p>
                  {appliedPromo ? (
                    <div className="flex items-center justify-between bg-primary/5 px-4 py-3 border border-primary/20">
                      <div className="flex items-center gap-2">
                        <Tag size={14} className="text-gold" />
                        <span className="text-sm font-medium">{appliedPromo.code}</span>
                        <span className="text-xs text-muted-foreground">(-${discount.toFixed(2)})</span>
                      </div>
                      <button onClick={handleRemovePromo} className="text-xs text-destructive underline underline-offset-2">Remove</button>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={promoInput}
                        onChange={(e) => { setPromoInput(e.target.value.toUpperCase()); setPromoError(''); }}
                        placeholder="Enter code"
                        className="flex-1 px-3 py-2.5 border border-border text-sm bg-background transition-smooth focus:outline-none focus:border-foreground"
                      />
                      <button
                        onClick={() => void handleApplyPromo()}
                        className="px-5 py-2.5 border border-foreground text-sm font-medium transition-smooth hover:bg-foreground hover:text-background"
                      >
                        Apply
                      </button>
                    </div>
                  )}
                  {promoError && <p className="text-xs text-destructive mt-1.5">{promoError}</p>}
                </div>

                <div className="border-t border-border pt-4 space-y-2.5">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>${totalPrice.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Shipping</span>
                    <span>{totals.shipping === 0 ? <span className="text-gold">Free</span> : `$${totals.shipping.toFixed(2)}`}</span>
                  </div>
                  {giftWrap && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Gift Wrap</span>
                      <span>${totals.giftWrap.toFixed(2)}</span>
                    </div>
                  )}
                  {totals.codFee > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">COD Fee</span>
                      <span>${totals.codFee.toFixed(2)}</span>
                    </div>
                  )}
                  {discount > 0 && (
                    <div className="flex justify-between text-sm text-gold">
                      <span>Discount</span>
                      <span>-${discount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Tax ({(CHECKOUT_CONFIG.TAX_RATE * 100).toFixed(0)}%)</span>
                    <span>${totals.tax.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-base font-heading font-semibold pt-3 border-t border-border">
                    <span>Total</span>
                    <span>${totals.total.toFixed(2)}</span>
                  </div>
                </div>

                {totalPrice < CHECKOUT_CONFIG.FREE_SHIPPING_THRESHOLD && (
                  <p className="text-xs text-muted-foreground mt-4 text-center">
                    Add ${(CHECKOUT_CONFIG.FREE_SHIPPING_THRESHOLD - totalPrice).toFixed(2)} more for free shipping
                  </p>
                )}

                <button
                  onClick={() => void handleSubmit()}
                  disabled={isSubmitting || (paymentMethod === 'stripe' && !paymentConfig?.stripePublishableKey)}
                  className="w-full mt-6 py-3.5 bg-primary text-primary-foreground text-sm font-medium letter-wide uppercase transition-smooth hover:opacity-90 disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <span className="flex items-center gap-2">
                      <span className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                      Processing...
                    </span>
                  ) : (
                    <>
                      <Lock size={14} />
                      {paymentMethod === 'stripe' ? 'Pay & Place Order' : 'Place Order'}
                    </>
                  )}
                </button>

                <p className="text-[10px] text-muted-foreground text-center mt-3">
                  {paymentMethod === 'stripe'
                    ? 'Card payments are processed securely by Stripe.'
                    : 'Your order details are transmitted securely.'}
                </p>
              </motion.div>
            </div>
          </div>
        </div>
      </PageBody>
    </PageMain>
  );
}
