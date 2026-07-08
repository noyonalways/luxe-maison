import { useQuery } from '@tanstack/react-query';
import { ordersApi } from '@/lib/api/orders.api';
import { orderKeys } from '@/hooks/orders/order-keys';
import { getStoredToken } from '@/lib/auth-session';

export function useOrdersList(enabled = true) {
  const hasToken = Boolean(getStoredToken());

  return useQuery({
    queryKey: orderKeys.list(),
    queryFn: () => ordersApi.list(),
    enabled: enabled && hasToken,
    staleTime: 30_000,
  });
}
