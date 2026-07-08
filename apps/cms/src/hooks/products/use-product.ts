import { useQuery } from '@tanstack/react-query';
import { productsApi } from '@/lib/api/products.api';
import { productKeys } from '@/hooks/products/product-keys';
import { getStoredToken } from '@/lib/auth-session';

export function useProduct(id: string | undefined) {
  const hasToken = Boolean(getStoredToken());

  return useQuery({
    queryKey: productKeys.detail(id ?? ''),
    queryFn: () => productsApi.getById(id!),
    enabled: Boolean(id) && hasToken,
    staleTime: 30_000,
  });
}
