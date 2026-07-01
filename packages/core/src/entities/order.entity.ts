export type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'returned';

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
  trackingNumber?: string;
  carrier?: string;
  notes: string[];
  createdAt: string;
  updatedAt: string;
}
