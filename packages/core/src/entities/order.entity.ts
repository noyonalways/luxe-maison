export type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'returned';

export type PaymentMethod = 'cod' | 'stripe' | 'paypal';

export type PaymentStatus =
  | 'pending'
  | 'pending_collection'
  | 'paid'
  | 'failed'
  | 'refunded';

export interface OrderItem {
  productId: string;
  productName: string;
  size: string;
  color: string;
  quantity: number;
  price: number;
  image: string;
}

export interface Order {
  id: string;
  customerName: string;
  customerEmail: string;
  phone: string;
  shippingAddress: string;
  status: OrderStatus;
  items: OrderItem[];
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  stripePaymentIntentId?: string;
  promoCode?: string;
  discountAmount: number;
  giftWrap: boolean;
  giftWrapAmount: number;
  codFee: number;
  giftMessage?: string;
  trackingNumber?: string;
  carrier?: string;
  notes: string[];
  createdAt: string;
  updatedAt: string;
}
