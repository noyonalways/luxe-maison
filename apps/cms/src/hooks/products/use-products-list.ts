import { useQuery } from '@tanstack/react-query';
import { productsApi } from '@/lib/api/products.api';
import { productKeys } from '@/hooks/products/product-keys';
import { getStoredToken } from '@/lib/auth-session';

export function useProductsList(enabled = true) {
  const hasToken = Boolean(getStoredToken());

  return useQuery({
    queryKey: productKeys.list(),
    queryFn: () => productsApi.list(),
    enabled: enabled && hasToken,
    staleTime: 30_000,
  });
}
