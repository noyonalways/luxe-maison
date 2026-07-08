import { useMutation, useQueryClient } from '@tanstack/react-query';
import { productsApi } from '@/lib/api/products.api';
import { productKeys } from '@/hooks/products/product-keys';

export function useDeleteProductMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => productsApi.delete(id),
    onSuccess: (_data, id) => {
      queryClient.removeQueries({ queryKey: productKeys.detail(id) });
      void queryClient.invalidateQueries({ queryKey: productKeys.list() });
    },
  });
}
