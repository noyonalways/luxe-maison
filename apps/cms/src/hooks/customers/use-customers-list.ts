import { useQuery } from '@tanstack/react-query';
import { customersApi } from '@/lib/api/customers.api';
import { customerKeys } from '@/hooks/customers/customer-keys';
import { getStoredToken } from '@/lib/auth-session';

export function useCustomersList(enabled = true) {
  const hasToken = Boolean(getStoredToken());

  return useQuery({
    queryKey: customerKeys.list(),
    queryFn: () => customersApi.list(),
    enabled: enabled && hasToken,
    staleTime: 30_000,
  });
}
