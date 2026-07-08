import { useMutation, useQueryClient } from '@tanstack/react-query';
import { customersApi } from '@/lib/api/customers.api';
import { customerKeys } from '@/hooks/customers/customer-keys';

export function useDeleteCustomerMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => customersApi.delete(id),
    onSuccess: (_data, id) => {
      queryClient.removeQueries({ queryKey: customerKeys.detail(id) });
      void queryClient.invalidateQueries({ queryKey: customerKeys.all });
    },
  });
}
