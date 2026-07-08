import { useCallback, useMemo, type ReactNode } from 'react';
import type { OrderStatus } from '@luxe-maison/shared';
import { OrdersContext } from '@/contexts/orders-context';
import { useAuth } from '@/contexts/auth-context';
import { useRole } from '@/contexts/role-context';
import { useOrdersList } from '@/hooks/orders/use-orders-list';
import {
  useAddOrderNoteMutation,
  useUpdateOrderMutation,
  useUpdateOrderStatusMutation,
} from '@/hooks/orders/use-update-order-mutations';
import { toApiError } from '@/lib/api/errors';

export function OrdersProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth();
  const { hasAccess } = useRole();
  const canViewOrders = isAuthenticated && hasAccess('orders');

  const { data, isLoading, error } = useOrdersList(canViewOrders);
  const statusMutation = useUpdateOrderStatusMutation();
  const updateMutation = useUpdateOrderMutation();
  const noteMutation = useAddOrderNoteMutation();

  const orders = data ?? [];

  const advanceStatus = useCallback(
    async (id: string, nextStatus: OrderStatus) => {
      await statusMutation.mutateAsync({ id, status: nextStatus });
    },
    [statusMutation],
  );

  const updateTracking = useCallback(
    async (id: string, trackingNumber: string, carrier: string) => {
      await updateMutation.mutateAsync({ id, payload: { trackingNumber, carrier } });
    },
    [updateMutation],
  );

  const addNote = useCallback(
    async (id: string, note: string) => {
      await noteMutation.mutateAsync({ id, note });
    },
    [noteMutation],
  );

  const isSaving =
    statusMutation.isPending || updateMutation.isPending || noteMutation.isPending;

  const value = useMemo(
    () => ({
      orders,
      isLoading: canViewOrders && isLoading,
      error: error ? toApiError(error).message : null,
      advanceStatus,
      updateTracking,
      addNote,
      isSaving,
    }),
    [
      orders,
      canViewOrders,
      isLoading,
      error,
      advanceStatus,
      updateTracking,
      addNote,
      isSaving,
    ],
  );

  return <OrdersContext.Provider value={value}>{children}</OrdersContext.Provider>;
}
