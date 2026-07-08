import { useQuery } from '@tanstack/react-query';
import { discountsApi } from '@/lib/api/discounts.api';
import { discountKeys } from '@/hooks/discounts/discount-keys';
import { getStoredToken } from '@/lib/auth-session';

export function useDiscountsList(enabled = true) {
  const hasToken = Boolean(getStoredToken());

  return useQuery({
    queryKey: discountKeys.list(),
    queryFn: () => discountsApi.list(),
    enabled: enabled && hasToken,
    staleTime: 30_000,
  });
}
