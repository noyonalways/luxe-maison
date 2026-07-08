import { useCallback, useMemo, type ReactNode } from 'react';
import { StaffContext } from '@/contexts/staff-context';
import { useAuth } from '@/contexts/auth-context';
import { useRole } from '@/contexts/role-context';
import { useStaffList } from '@/hooks/staff/use-staff-list';
import { useCreateStaffMutation } from '@/hooks/staff/use-create-staff-mutation';
import { useUpdateStaffMutation } from '@/hooks/staff/use-update-staff-mutation';
import { useDeleteStaffMutation } from '@/hooks/staff/use-delete-staff-mutation';
import { toApiError } from '@/lib/api/errors';
import type { CreateStaffPayload, UpdateStaffPayload } from '@/lib/api/staff.api';

export function StaffProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth();
  const { hasAccess } = useRole();
  const canViewTeam = isAuthenticated && hasAccess('team');

  const { data, isLoading, error, refetch } = useStaffList(canViewTeam);
  const createMutation = useCreateStaffMutation();
  const updateMutation = useUpdateStaffMutation();
  const deleteMutation = useDeleteStaffMutation();

  const addMember = useCallback(
    async (payload: CreateStaffPayload) => createMutation.mutateAsync(payload),
    [createMutation],
  );

  const removeMember = useCallback(
    async (id: string) => {
      await deleteMutation.mutateAsync(id);
    },
    [deleteMutation],
  );

  const updateMember = useCallback(
    async (id: string, payload: UpdateStaffPayload) =>
      updateMutation.mutateAsync({ id, payload }),
    [updateMutation],
  );

  const isSaving =
    createMutation.isPending || updateMutation.isPending || deleteMutation.isPending;

  const value = useMemo(
    () => ({
      members: data ?? [],
      isLoading: canViewTeam && isLoading,
      error: error ? toApiError(error).message : null,
      refetch: () => {
        void refetch();
      },
      addMember,
      removeMember,
      updateMember,
      isSaving,
    }),
    [
      data,
      canViewTeam,
      isLoading,
      error,
      refetch,
      addMember,
      removeMember,
      updateMember,
      isSaving,
    ],
  );

  return <StaffContext.Provider value={value}>{children}</StaffContext.Provider>;
}
