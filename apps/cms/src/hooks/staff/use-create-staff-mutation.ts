import { useMutation, useQueryClient } from '@tanstack/react-query';
import { staffApi, type CreateStaffPayload } from '@/lib/api/staff.api';
import { staffKeys } from '@/hooks/staff/staff-keys';

export function useCreateStaffMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateStaffPayload) => staffApi.create(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: staffKeys.list() });
    },
  });
}
