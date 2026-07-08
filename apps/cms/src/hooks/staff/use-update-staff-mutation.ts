import { useMutation, useQueryClient } from '@tanstack/react-query';
import { staffApi, type UpdateStaffPayload } from '@/lib/api/staff.api';
import { staffKeys } from '@/hooks/staff/staff-keys';

export function useUpdateStaffMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateStaffPayload }) =>
      staffApi.update(id, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: staffKeys.list() });
    },
  });
}
