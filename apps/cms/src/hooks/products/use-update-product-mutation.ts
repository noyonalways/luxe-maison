import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { AdminProduct } from '@luxe-maison/shared';
import { productsApi } from '@/lib/api/products.api';
import { productKeys } from '@/hooks/products/product-keys';

export function useUpdateProductMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, product }: { id: string; product: Partial<AdminProduct> }) =>
      productsApi.update(id, product),
    onSuccess: (updated) => {
      queryClient.setQueryData(productKeys.detail(updated.id), updated);
      void queryClient.invalidateQueries({ queryKey: productKeys.list() });
    },
  });
}
