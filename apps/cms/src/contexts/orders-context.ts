import { createContext, useContext } from 'react';
import type { Order, OrderStatus } from '@luxe-maison/shared';
import type { UpdateOrderPayload } from '@/lib/api/orders.api';

export interface OrdersContextValue {
  orders: Order[];
  isLoading: boolean;
  error: string | null;
  advanceStatus: (id: string, nextStatus: OrderStatus) => Promise<void>;
  updateTracking: (id: string, trackingNumber: string, carrier: string) => Promise<void>;
  addNote: (id: string, note: string) => Promise<void>;
  isSaving: boolean;
}

export const OrdersContext = createContext<OrdersContextValue | undefined>(undefined);

export function useOrders() {
  const ctx = useContext(OrdersContext);
  if (!ctx) throw new Error('useOrders must be used within OrdersProvider');
  return ctx;
}
