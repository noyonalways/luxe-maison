import { format } from 'date-fns';
import { ArrowLeft, MapPin, Truck, CreditCard } from 'lucide-react';
import { motion } from 'framer-motion';
import type { Order } from '@luxe-maison/shared';
import OrderTimeline from '@/components/account/OrderTimeline';
import OrderStatusBadge from '@/components/account/OrderStatusBadge';
import {
  formatCurrency,
  PAYMENT_METHOD_LABELS,
  PAYMENT_STATUS_LABELS,
} from '@/components/account/account-utils';

type OrderDetailViewProps = {
  order: Order;
  onBack: () => void;
  backLabel?: string;
};

export default function OrderDetailView({ order, onBack, backLabel = 'Back to orders' }: OrderDetailViewProps) {
  const paymentMethod = order.paymentMethod ?? 'cod';
  const paymentStatus = order.paymentStatus ?? 'pending_collection';

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
      <button
        type="button"
        onClick={onBack}
        className="inline-flex items-center gap-2 text-xs text-muted-foreground transition-smooth hover-gold mb-8"
      >
        <ArrowLeft size={14} /> {backLabel}
      </button>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between mb-10">
        <div>
          <p className="text-xs font-body font-medium letter-wider uppercase text-gold mb-2">Order details</p>
          <h1 className="font-heading text-3xl lg:text-4xl">{order.id}</h1>
          <p className="text-sm text-muted-foreground mt-2">
            Placed {format(new Date(order.createdAt), 'MMMM d, yyyy · h:mm a')}
          </p>
        </div>
        <OrderStatusBadge status={order.status} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
        <div className="lg:col-span-8 space-y-8">
          <section className="border border-border p-6 lg:p-8">
            <h2 className="text-xs font-body font-semibold letter-wide uppercase text-muted-foreground mb-6">
              Delivery progress
            </h2>
            <OrderTimeline status={order.status} />
            {order.trackingNumber && (
              <div className="mt-6 pt-6 border-t border-border flex items-start gap-3 text-sm">
                <Truck size={16} className="text-gold mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium">{order.carrier || 'Carrier'}</p>
                  <p className="text-muted-foreground mt-0.5">{order.trackingNumber}</p>
                </div>
              </div>
            )}
          </section>

          <section className="border border-border">
            <div className="px-6 lg:px-8 py-5 border-b border-border">
              <h2 className="text-xs font-body font-semibold letter-wide uppercase text-muted-foreground">
                Items ({order.items.length})
              </h2>
            </div>
            <div className="divide-y divide-border">
              {order.items.map((item, index) => (
                <div key={`${item.productId}-${index}`} className="flex gap-4 px-6 lg:px-8 py-5">
                  <div className="w-20 h-24 bg-secondary overflow-hidden flex-shrink-0">
                    <img src={item.image} alt={item.productName} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{item.productName}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {item.color} · Size {item.size}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">Qty {item.quantity}</p>
                  </div>
                  <p className="text-sm font-medium">{formatCurrency(item.price * item.quantity)}</p>
                </div>
              ))}
            </div>
          </section>
        </div>

        <div className="lg:col-span-4 space-y-6">
          <section className="border border-border p-6">
            <h2 className="text-xs font-body font-semibold letter-wide uppercase text-muted-foreground mb-4">
              Order summary
            </h2>
            <div className="space-y-2.5 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span>{formatCurrency(order.subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Shipping</span>
                <span>{order.shipping === 0 ? 'Complimentary' : formatCurrency(order.shipping)}</span>
              </div>
              {(order.giftWrapAmount ?? 0) > 0 && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Gift wrap</span>
                  <span>{formatCurrency(order.giftWrapAmount!)}</span>
                </div>
              )}
              {(order.codFee ?? 0) > 0 && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">COD fee</span>
                  <span>{formatCurrency(order.codFee!)}</span>
                </div>
              )}
              {(order.discountAmount ?? 0) > 0 && (
                <div className="flex justify-between text-gold">
                  <span>Discount{order.promoCode ? ` (${order.promoCode})` : ''}</span>
                  <span>-{formatCurrency(order.discountAmount!)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tax</span>
                <span>{formatCurrency(order.tax)}</span>
              </div>
              <div className="flex justify-between font-heading text-lg pt-3 border-t border-border">
                <span>Total</span>
                <span>{formatCurrency(order.total)}</span>
              </div>
            </div>
          </section>

          <section className="border border-border p-6">
            <h2 className="text-xs font-body font-semibold letter-wide uppercase text-muted-foreground mb-4">
              Payment
            </h2>
            <div className="flex items-start gap-3 text-sm">
              <CreditCard size={16} className="text-gold mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium">{PAYMENT_METHOD_LABELS[paymentMethod]}</p>
                <p className="text-xs text-muted-foreground mt-1">{PAYMENT_STATUS_LABELS[paymentStatus]}</p>
              </div>
            </div>
          </section>

          <section className="border border-border p-6">
            <h2 className="text-xs font-body font-semibold letter-wide uppercase text-muted-foreground mb-4">
              Shipping address
            </h2>
            <div className="flex items-start gap-3 text-sm text-muted-foreground leading-relaxed">
              <MapPin size={16} className="text-gold mt-0.5 flex-shrink-0" />
              <p>{order.shippingAddress}</p>
            </div>
          </section>
        </div>
      </div>
    </motion.div>
  );
}
