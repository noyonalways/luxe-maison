import { useMutation, useQueryClient } from '@tanstack/react-query';
import { customersApi, type UpdateCustomerPayload } from '@/lib/api/customers.api';
import { customerKeys } from '@/hooks/customers/customer-keys';

export function useUpdateCustomerMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateCustomerPayload }) =>
      customersApi.update(id, payload),
    onSuccess: (updated) => {
      queryClient.setQueryData(customerKeys.detail(updated.id), updated);
      void queryClient.invalidateQueries({ queryKey: customerKeys.all });
    },
  });
}
