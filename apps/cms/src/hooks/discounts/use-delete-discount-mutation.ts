import { useMutation, useQueryClient } from '@tanstack/react-query';
import { discountsApi } from '@/lib/api/discounts.api';
import { discountKeys } from '@/hooks/discounts/discount-keys';

export function useDeleteDiscountMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => discountsApi.delete(id),
    onSuccess: (_data, id) => {
      queryClient.removeQueries({ queryKey: discountKeys.detail(id) });
      void queryClient.invalidateQueries({ queryKey: discountKeys.all });
    },
  });
}
