import { useMutation, useQueryClient } from '@tanstack/react-query';
import { discountsApi, type CreateDiscountPayload } from '@/lib/api/discounts.api';
import { discountKeys } from '@/hooks/discounts/discount-keys';

export function useCreateDiscountMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (discount: CreateDiscountPayload) => discountsApi.create(discount),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: discountKeys.all });
    },
  });
}
