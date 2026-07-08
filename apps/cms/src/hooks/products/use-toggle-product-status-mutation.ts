import { useMutation, useQueryClient } from '@tanstack/react-query';
import { productsApi } from '@/lib/api/products.api';
import { productKeys } from '@/hooks/products/product-keys';

export function useToggleProductStatusMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => productsApi.toggleStatus(id),
    onSuccess: (updated) => {
      queryClient.setQueryData(productKeys.detail(updated.id), updated);
      void queryClient.invalidateQueries({ queryKey: productKeys.list() });
    },
  });
}
