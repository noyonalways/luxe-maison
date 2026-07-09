import { useQuery } from '@tanstack/react-query';
import { ordersApi } from '@/lib/api/orders.api';
import { orderKeys } from '@/hooks/orders/order-keys';
import { getStoredToken } from '@/lib/auth-session';

export function useOrderQuery(id: string, enabled = true) {
  const hasToken = Boolean(getStoredToken());

  return useQuery({
    queryKey: orderKeys.detail(id),
    queryFn: () => ordersApi.getById(id),
    enabled: enabled && hasToken && Boolean(id),
    staleTime: 30_000,
  });
}
