import { useQuery } from '@tanstack/react-query';
import { customersApi } from '@/lib/api/customers.api';
import { customerKeys } from '@/hooks/customers/customer-keys';
import { getStoredToken } from '@/lib/auth-session';

export function useCustomerQuery(id: string, enabled = true) {
  const hasToken = Boolean(getStoredToken());

  return useQuery({
    queryKey: customerKeys.detail(id),
    queryFn: () => customersApi.getById(id),
    enabled: enabled && hasToken && Boolean(id),
    staleTime: 30_000,
  });
}
