import { useMutation, useQueryClient } from '@tanstack/react-query';
import { discountsApi, type UpdateDiscountPayload } from '@/lib/api/discounts.api';
import { discountKeys } from '@/hooks/discounts/discount-keys';

export function useUpdateDiscountMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, discount }: { id: string; discount: UpdateDiscountPayload }) =>
      discountsApi.update(id, discount),
    onSuccess: (updated) => {
      queryClient.setQueryData(discountKeys.detail(updated.id), updated);
      void queryClient.invalidateQueries({ queryKey: discountKeys.all });
    },
  });
}
