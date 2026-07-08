import { useMutation, useQueryClient } from '@tanstack/react-query';
import { customersApi } from '@/lib/api/customers.api';
import { customerKeys } from '@/hooks/customers/customer-keys';
import type { Customer } from '@luxe-maison/shared';

export function useSetCustomerStatusMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: Customer['status'] }) =>
      customersApi.setStatus(id, status),
    onSuccess: (updated) => {
      queryClient.setQueryData(customerKeys.detail(updated.id), updated);
      void queryClient.invalidateQueries({ queryKey: customerKeys.all });
    },
  });
}
