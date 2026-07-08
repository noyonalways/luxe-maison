import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { AdminProduct } from '@luxe-maison/shared';
import { productsApi } from '@/lib/api/products.api';
import { productKeys } from '@/hooks/products/product-keys';

export function useCreateProductMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (product: AdminProduct) => productsApi.create(product),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: productKeys.list() });
    },
  });
}
