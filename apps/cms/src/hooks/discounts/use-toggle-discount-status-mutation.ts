import { useMutation, useQueryClient } from '@tanstack/react-query';
import { discountsApi } from '@/lib/api/discounts.api';
import { discountKeys } from '@/hooks/discounts/discount-keys';

export function useToggleDiscountStatusMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => discountsApi.toggleStatus(id),
    onSuccess: (updated) => {
      queryClient.setQueryData(discountKeys.detail(updated.id), updated);
      void queryClient.invalidateQueries({ queryKey: discountKeys.all });
    },
  });
}
