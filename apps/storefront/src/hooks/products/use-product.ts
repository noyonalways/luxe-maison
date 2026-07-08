import { useQuery, useQueryClient } from '@tanstack/react-query';
import { productsApi } from '@/lib/api/products.api';
import { productKeys } from '@/hooks/products/product-keys';

export function useProduct(id: string) {
  const { data: listData } = useQuery({
    queryKey: productKeys.list(),
    queryFn: () => productsApi.list(),
    staleTime: 60_000,
  });

  const fromList = listData?.find((product) => product.id === id);

  return useQuery({
    queryKey: productKeys.detail(id),
    queryFn: () => productsApi.getById(id),
    enabled: Boolean(id) && !fromList,
    initialData: fromList,
    staleTime: 60_000,
  });
}

export function useInvalidateProducts() {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: productKeys.all });
}
