"use client";

import { useState, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft, CreditCard, Banknote, Check, Lock, Tag, Printer } from 'lucide-react';
import { z } from 'zod';
import { useCart, CartItem } from '@/context/CartContext';
import { validatePromoCode, calculateDiscount, type PromoCode } from '@/data/promo-codes';

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

const paymentSchema = z.object({
  method: z.enum(['card', 'cod'], { required_error: 'Select a payment method' }),
  cardNumber: z.string().optional(),
  cardExpiry: z.string().optional(),
  cardCvc: z.string().optional(),
  cardName: z.string().optional(),
}).superRefine((data, ctx) => {
  if (data.method === 'card') {
    if (!data.cardNumber || data.cardNumber.replace(/\s/g, '').length < 13) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Valid card number required', path: ['cardNumber'] });
    }
    if (!data.cardExpiry || !/^\d{2}\/\d{2}$/.test(data.cardExpiry)) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'MM/YY format required', path: ['cardExpiry'] });
    }
    if (!data.cardCvc || data.cardCvc.length < 3) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Valid CVC required', path: ['cardCvc'] });
    }
    if (!data.cardName || data.cardName.trim().length < 2) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Cardholder name required', path: ['cardName'] });
    }
  }
});

type ShippingData = z.infer<typeof shippingSchema>;
type PaymentData = z.infer<typeof paymentSchema>;
type FieldErrors = Record<string, string>;

const SHIPPING_RATE = 12;
const FREE_SHIPPING_THRESHOLD = 200;
const TAX_RATE = 0.08;

function generateOrderNumber() {
  return `MSN-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
}

export default function CheckoutPage() {
  const { items, totalPrice, totalItems } = useCart();
  const router = useRouter();

  const [shipping, setShipping] = useState<ShippingData>({
    firstName: '', lastName: '', email: '', phone: '',
    address: '', city: '', state: '', zip: '', country: '',
  });
  const [payment, setPayment] = useState<PaymentData>({
    method: 'card', cardNumber: '', cardExpiry: '', cardCvc: '', cardName: '',
  });
  const [shippingErrors, setShippingErrors] = useState<FieldErrors>({});
  const [paymentErrors, setPaymentErrors] = useState<FieldErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [giftWrap, setGiftWrap] = useState(false);
  const [giftMessage, setGiftMessage] = useState('');

  // Promo code state
  const [promoInput, setPromoInput] = useState('');
  const [appliedPromo, setAppliedPromo] = useState<PromoCode | null>(null);
  const [promoError, setPromoError] = useState('');
  const [promoSuccess, setPromoSuccess] = useState('');

  // Order confirmation state
  const [orderNumber, setOrderNumber] = useState('');
  const [orderDate, setOrderDate] = useState('');
  const [orderItems, setOrderItems] = useState<CartItem[]>([]);
  const [orderTotals, setOrderTotals] = useState({ subtotal: 0, shipping: 0, giftWrap: 0, discount: 0, tax: 0, total: 0 });

  const receiptRef = useRef<HTMLDivElement>(null);

  const shippingCost = totalPrice >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_RATE;
  const giftWrapCost = giftWrap ? 8 : 0;
  const discount = appliedPromo ? calculateDiscount(appliedPromo, totalPrice) : 0;
  const subtotal = totalPrice + shippingCost + giftWrapCost - discount;
  const tax = subtotal * TAX_RATE;
  const grandTotal = subtotal + tax;

  const handleApplyPromo = () => {
    setPromoError('');
    setPromoSuccess('');
    if (!promoInput.trim()) {
      setPromoError('Please enter a promo code');
      return;
    }
    const result = validatePromoCode(promoInput, totalPrice);
    if (result.valid && result.promo) {
      setAppliedPromo(result.promo);
      setPromoSuccess(result.promo.description);
      setPromoError('');
    } else {
      setPromoError(result.error || 'Invalid code');
      setAppliedPromo(null);
    }
  };

  const handleRemovePromo = () => {
    setAppliedPromo(null);
    setPromoInput('');
    setPromoSuccess('');
    setPromoError('');
  };

  if (totalItems === 0 && !orderPlaced) {
    return (
      <main className="pt-20 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="font-heading text-2xl mb-4">Your bag is empty</h1>
          <Link href="/shop" className="text-sm text-gold underline underline-offset-4">Continue Shopping</Link>
        </div>
      </main>
    );
  }

  if (orderPlaced) {
    return (
      <main className="pt-20 min-h-screen pb-16">
        <div className="container mx-auto px-6 lg:px-12 py-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl mx-auto">
            {/* Receipt */}
            <div ref={receiptRef} className="border border-border p-8 lg:p-10">
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
                  <p className="text-sm font-medium">{payment.method === 'card' ? `Card ending ${(payment.cardNumber || '').slice(-4)}` : 'Cash on Delivery'}</p>
                </div>
              </div>

              {/* Shipping address */}
              <div className="mb-8 pb-6 border-b border-border">
                <p className="text-xs font-body font-semibold letter-wide uppercase text-muted-foreground mb-2">Shipping To</p>
                <p className="text-sm">{shipping.firstName} {shipping.lastName}</p>
                <p className="text-sm text-muted-foreground">{shipping.address}</p>
                <p className="text-sm text-muted-foreground">{shipping.city}, {shipping.state} {shipping.zip}</p>
                <p className="text-sm text-muted-foreground">{shipping.country}</p>
              </div>

              {/* Items */}
              <div className="mb-8 pb-6 border-b border-border">
                <p className="text-xs font-body font-semibold letter-wide uppercase text-muted-foreground mb-4">Items Ordered</p>
                <div className="space-y-3">
                  {orderItems.map(item => (
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

              {/* Totals */}
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

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3 mt-6">
              <button
                onClick={() => window.print()}
                className="flex-1 py-3 border border-foreground text-sm font-medium letter-wide uppercase transition-smooth hover:bg-foreground hover:text-background flex items-center justify-center gap-2"
              >
                <Printer size={14} /> Print Receipt
              </button>
              <Link
                href="/shop"
                className="flex-1 py-3 bg-primary text-primary-foreground text-sm font-medium letter-wide uppercase transition-smooth hover:opacity-90 text-center"
              >
                Continue Shopping
              </Link>
            </div>
          </motion.div>
        </div>
      </main>
    );
  }

  const updateShipping = (field: keyof ShippingData, value: string) => {
    setShipping(prev => ({ ...prev, [field]: value }));
    if (shippingErrors[field]) {
      setShippingErrors(prev => { const n = { ...prev }; delete n[field]; return n; });
    }
  };

  const updatePayment = (field: keyof PaymentData, value: string) => {
    setPayment(prev => ({ ...prev, [field]: value }));
    if (paymentErrors[field]) {
      setPaymentErrors(prev => { const n = { ...prev }; delete n[field]; return n; });
    }
  };

  const formatCardNumber = (val: string) => {
    const digits = val.replace(/\D/g, '').slice(0, 16);
    return digits.replace(/(.{4})/g, '$1 ').trim();
  };

  const formatExpiry = (val: string) => {
    const digits = val.replace(/\D/g, '').slice(0, 4);
    if (digits.length >= 3) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
    return digits;
  };

  const handleSubmit = () => {
    const shipResult = shippingSchema.safeParse(shipping);
    const payResult = paymentSchema.safeParse(payment);

    const sErrors: FieldErrors = {};
    const pErrors: FieldErrors = {};

    if (!shipResult.success) {
      shipResult.error.issues.forEach(i => { sErrors[i.path[0] as string] = i.message; });
    }
    if (!payResult.success) {
      payResult.error.issues.forEach(i => { pErrors[i.path[0] as string] = i.message; });
    }

    setShippingErrors(sErrors);
    setPaymentErrors(pErrors);

    if (Object.keys(sErrors).length > 0 || Object.keys(pErrors).length > 0) return;

    setIsSubmitting(true);
    // Save order data before clearing cart
    const savedItems = [...items];
    const savedTotals = { subtotal: totalPrice, shipping: shippingCost, giftWrap: giftWrapCost, discount, tax, total: grandTotal };
    setTimeout(() => {
      setIsSubmitting(false);
      setOrderNumber(generateOrderNumber());
      setOrderDate(new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }));
      setOrderItems(savedItems);
      setOrderTotals(savedTotals);
      setOrderPlaced(true);
    }, 1500);
  };

  const Input = ({ label, field, value, onChange, error, type = 'text', placeholder = '' }: {
    label: string; field: string; value: string; onChange: (v: string) => void; error?: string; type?: string; placeholder?: string;
  }) => (
    <div>
      <label className="block text-xs font-body font-medium letter-wide uppercase text-muted-foreground mb-1.5">{label}</label>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className={`w-full px-4 py-3 border text-sm bg-background transition-smooth focus:outline-none focus:border-foreground ${
          error ? 'border-destructive' : 'border-border'
        }`}
      />
      {error && <p className="text-xs text-destructive mt-1">{error}</p>}
    </div>
  );

  return (
    <main className="pt-20 lg:pt-24 min-h-screen pb-16">
      <div className="container mx-auto px-6 lg:px-12 py-8">
        <Link href="/shop" className="inline-flex items-center gap-2 text-xs text-muted-foreground transition-smooth hover-gold mb-8">
          <ArrowLeft size={14} /> Back to Shop
        </Link>

        <h1 className="font-heading text-3xl lg:text-4xl mb-10">Checkout</h1>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16">
          {/* Left — Forms */}
          <div className="lg:col-span-7 space-y-10">
            {/* Shipping */}
            <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <h2 className="font-heading text-xl mb-6">Shipping Address</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input label="First Name" field="firstName" value={shipping.firstName} onChange={v => updateShipping('firstName', v)} error={shippingErrors.firstName} />
                <Input label="Last Name" field="lastName" value={shipping.lastName} onChange={v => updateShipping('lastName', v)} error={shippingErrors.lastName} />
                <Input label="Email" field="email" value={shipping.email} onChange={v => updateShipping('email', v)} error={shippingErrors.email} type="email" placeholder="you@example.com" />
                <Input label="Phone" field="phone" value={shipping.phone} onChange={v => updateShipping('phone', v)} error={shippingErrors.phone} type="tel" />
                <div className="sm:col-span-2">
                  <Input label="Address" field="address" value={shipping.address} onChange={v => updateShipping('address', v)} error={shippingErrors.address} />
                </div>
                <Input label="City" field="city" value={shipping.city} onChange={v => updateShipping('city', v)} error={shippingErrors.city} />
                <Input label="State / Province" field="state" value={shipping.state} onChange={v => updateShipping('state', v)} error={shippingErrors.state} />
                <Input label="Postal Code" field="zip" value={shipping.zip} onChange={v => updateShipping('zip', v)} error={shippingErrors.zip} />
                <Input label="Country" field="country" value={shipping.country} onChange={v => updateShipping('country', v)} error={shippingErrors.country} />
              </div>
            </motion.section>

            {/* Gift Options */}
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
                <span className="text-sm">Add gift wrapping (+$8.00)</span>
              </label>
              {giftWrap && (
                <textarea
                  value={giftMessage}
                  onChange={e => setGiftMessage(e.target.value.slice(0, 200))}
                  placeholder="Add a personalized message (optional)"
                  rows={3}
                  className="w-full mt-4 px-4 py-3 border border-border text-sm bg-background transition-smooth focus:outline-none focus:border-foreground resize-none"
                />
              )}
            </motion.section>

            {/* Payment */}
            <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
              <h2 className="font-heading text-xl mb-6">Payment Method</h2>

              <div className="flex gap-3 mb-6">
                {[
                  { id: 'card' as const, label: 'Credit Card', icon: CreditCard },
                  { id: 'cod' as const, label: 'Cash on Delivery', icon: Banknote },
                ].map(({ id, label, icon: Icon }) => (
                  <button
                    key={id}
                    onClick={() => updatePayment('method', id)}
                    className={`flex-1 flex items-center gap-3 px-5 py-4 border text-sm font-medium transition-smooth ${
                      payment.method === id ? 'border-foreground bg-secondary' : 'border-border hover:border-foreground'
                    }`}
                  >
                    <Icon size={18} />
                    {label}
                  </button>
                ))}
              </div>
              {paymentErrors.method && <p className="text-xs text-destructive mb-4">{paymentErrors.method}</p>}

              {payment.method === 'card' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <Input label="Card Number" field="cardNumber" value={payment.cardNumber || ''} onChange={v => updatePayment('cardNumber', formatCardNumber(v))} error={paymentErrors.cardNumber} placeholder="1234 5678 9012 3456" />
                  </div>
                  <Input label="Expiry Date" field="cardExpiry" value={payment.cardExpiry || ''} onChange={v => updatePayment('cardExpiry', formatExpiry(v))} error={paymentErrors.cardExpiry} placeholder="MM/YY" />
                  <Input label="CVC" field="cardCvc" value={payment.cardCvc || ''} onChange={v => updatePayment('cardCvc', v.replace(/\D/g, '').slice(0, 4))} error={paymentErrors.cardCvc} placeholder="123" />
                  <div className="sm:col-span-2">
                    <Input label="Cardholder Name" field="cardName" value={payment.cardName || ''} onChange={v => updatePayment('cardName', v)} error={paymentErrors.cardName} placeholder="As shown on card" />
                  </div>
                </div>
              )}

              {payment.method === 'cod' && (
                <div className="px-5 py-4 bg-secondary text-sm text-muted-foreground">
                  Pay with cash when your order is delivered. A ₹50 COD fee may apply.
                </div>
              )}
            </motion.section>
          </div>

          {/* Right — Order Summary */}
          <div className="lg:col-span-5">
            <div className="lg:sticky lg:top-28">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="border border-border p-6"
              >
                <h2 className="font-heading text-xl mb-6">Order Summary</h2>

                {/* Items */}
                <div className="space-y-4 mb-6 max-h-64 overflow-y-auto">
                  {items.map(item => (
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

                {/* Promo Code */}
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
                        onChange={e => { setPromoInput(e.target.value.toUpperCase()); setPromoError(''); }}
                        placeholder="Enter code"
                        className="flex-1 px-3 py-2.5 border border-border text-sm bg-background transition-smooth focus:outline-none focus:border-foreground"
                      />
                      <button
                        onClick={handleApplyPromo}
                        className="px-5 py-2.5 border border-foreground text-sm font-medium transition-smooth hover:bg-foreground hover:text-background"
                      >
                        Apply
                      </button>
                    </div>
                  )}
                  {promoError && <p className="text-xs text-destructive mt-1.5">{promoError}</p>}
                  {promoSuccess && !appliedPromo && <p className="text-xs text-gold mt-1.5">{promoSuccess}</p>}
                </div>

                {/* Totals */}
                <div className="border-t border-border pt-4 space-y-2.5">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>${totalPrice.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Shipping</span>
                    <span>{shippingCost === 0 ? <span className="text-gold">Free</span> : `$${shippingCost.toFixed(2)}`}</span>
                  </div>
                  {giftWrap && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Gift Wrap</span>
                      <span>${giftWrapCost.toFixed(2)}</span>
                    </div>
                  )}
                  {discount > 0 && (
                    <div className="flex justify-between text-sm text-gold">
                      <span>Discount</span>
                      <span>-${discount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Tax (8%)</span>
                    <span>${tax.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-base font-heading font-semibold pt-3 border-t border-border">
                    <span>Total</span>
                    <span>${grandTotal.toFixed(2)}</span>
                  </div>
                </div>

                {totalPrice < FREE_SHIPPING_THRESHOLD && (
                  <p className="text-xs text-muted-foreground mt-4 text-center">
                    Add ${(FREE_SHIPPING_THRESHOLD - totalPrice).toFixed(2)} more for free shipping
                  </p>
                )}

                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="w-full mt-6 py-3.5 bg-primary text-primary-foreground text-sm font-medium letter-wide uppercase transition-smooth hover:opacity-90 disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <span className="flex items-center gap-2">
                      <span className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                      Processing...
                    </span>
                  ) : (
                    <>
                      <Lock size={14} /> Place Order
                    </>
                  )}
                </button>

                <p className="text-[10px] text-muted-foreground text-center mt-3">
                  Your payment information is encrypted and secure.
                </p>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
