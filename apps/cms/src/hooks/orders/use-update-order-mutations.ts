import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ordersApi } from '@/lib/api/orders.api';
import { orderKeys } from '@/hooks/orders/order-keys';
import { analyticsKeys } from '@/hooks/analytics/analytics-keys';
import type { OrderStatus } from '@luxe-maison/shared';
import type { UpdateOrderPayload } from '@/lib/api/orders.api';

export function useUpdateOrderStatusMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: OrderStatus }) =>
      ordersApi.updateStatus(id, status),
    onSuccess: (updated) => {
      queryClient.setQueryData(orderKeys.detail(updated.id), updated);
      void queryClient.invalidateQueries({ queryKey: orderKeys.all });
      void queryClient.invalidateQueries({ queryKey: analyticsKeys.all });
    },
  });
}

export function useUpdateOrderMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateOrderPayload }) =>
      ordersApi.update(id, payload),
    onSuccess: (updated) => {
      queryClient.setQueryData(orderKeys.detail(updated.id), updated);
      void queryClient.invalidateQueries({ queryKey: orderKeys.all });
      void queryClient.invalidateQueries({ queryKey: analyticsKeys.all });
    },
  });
}

export function useAddOrderNoteMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, note }: { id: string; note: string }) => ordersApi.addNote(id, note),
    onSuccess: (updated) => {
      queryClient.setQueryData(orderKeys.detail(updated.id), updated);
      void queryClient.invalidateQueries({ queryKey: orderKeys.all });
      void queryClient.invalidateQueries({ queryKey: analyticsKeys.all });
    },
  });
}
