import { useQuery } from '@tanstack/react-query';
import { staffApi } from '@/lib/api/staff.api';
import { staffKeys } from '@/hooks/staff/staff-keys';

import { getStoredToken } from '@/lib/auth-session';

export function useStaffList(enabled = true) {
  const hasToken = Boolean(getStoredToken());

  return useQuery({
    queryKey: staffKeys.list(),
    queryFn: () => staffApi.list(),
    enabled: enabled && hasToken,
    staleTime: 30_000,
  });
}
