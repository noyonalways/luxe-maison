import { useCallback, useMemo, type ReactNode } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { StaffContext } from '@/contexts/staff-context';
import { useAuth } from '@/contexts/auth-context';
import { useStaffList } from '@/hooks/staff/use-staff-list';
import { staffKeys } from '@/hooks/staff/staff-keys';
import type { StaffMember } from '@/contexts/staff-context';

export function StaffProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const isAdmin = user?.role === 'admin';

  const { data, isLoading, error, refetch } = useStaffList(isAdmin);

  const invalidate = useCallback(() => {
    void queryClient.invalidateQueries({ queryKey: staffKeys.list() });
  }, [queryClient]);

  const value = useMemo(
    () => ({
      members: data ?? [],
      isLoading: isAdmin ? isLoading : false,
      error: error ? 'Failed to load team members' : null,
      refetch: () => { void refetch(); },
      addMember: (_data: Omit<StaffMember, 'id' | 'addedAt'>) => invalidate(),
      removeMember: (_id: string) => invalidate(),
      updateMember: (_id: string, _data: Partial<Pick<StaffMember, 'name' | 'email' | 'role'>>) => invalidate(),
    }),
    [data, isAdmin, isLoading, error, refetch, invalidate],
  );

  return <StaffContext.Provider value={value}>{children}</StaffContext.Provider>;
}
