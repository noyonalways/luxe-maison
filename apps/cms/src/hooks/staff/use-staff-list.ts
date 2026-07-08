import { useQuery } from '@tanstack/react-query';
import { staffApi } from '@/lib/api/staff.api';
import { staffKeys } from '@/hooks/staff/staff-keys';

export function useStaffList(enabled: boolean) {
  return useQuery({
    queryKey: staffKeys.list(),
    queryFn: () => staffApi.list(),
    enabled,
    staleTime: 30_000,
  });
}
