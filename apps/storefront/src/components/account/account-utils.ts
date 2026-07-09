import type { OrderStatus, PaymentMethod, PaymentStatus } from '@luxe-maison/shared';

export type AccountSection = 'overview' | 'orders' | 'profile';

export const STATUS_LABELS: Record<OrderStatus, string> = {
  pending: 'Pending',
  processing: 'Processing',
  shipped: 'Shipped',
  delivered: 'Delivered',
  returned: 'Returned',
};

export const STATUS_STYLES: Record<OrderStatus, string> = {
  pending: 'border-gold/40 bg-cream text-foreground',
  processing: 'border-foreground/20 bg-secondary text-foreground',
  shipped: 'border-foreground/30 bg-background text-foreground',
  delivered: 'border-gold bg-gold/10 text-foreground',
  returned: 'border-destructive/30 bg-destructive/5 text-destructive',
};

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  cod: 'Cash on Delivery',
  stripe: 'Card',
  paypal: 'PayPal',
};

export const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
  pending: 'Payment pending',
  pending_collection: 'Pay on delivery',
  paid: 'Paid',
  failed: 'Payment failed',
  refunded: 'Refunded',
};

export function getInitials(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');
}

export function formatCurrency(value: number): string {
  return `$${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}
