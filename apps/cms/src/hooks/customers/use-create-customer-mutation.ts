import { useMutation, useQueryClient } from '@tanstack/react-query';
import { customersApi, type CreateCustomerPayload } from '@/lib/api/customers.api';
import { customerKeys } from '@/hooks/customers/customer-keys';

export function useCreateCustomerMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateCustomerPayload) => customersApi.create(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: customerKeys.all });
    },
  });
}
