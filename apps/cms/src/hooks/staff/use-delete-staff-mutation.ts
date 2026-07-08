import { useMutation, useQueryClient } from '@tanstack/react-query';
import { staffApi } from '@/lib/api/staff.api';
import { staffKeys } from '@/hooks/staff/staff-keys';

export function useDeleteStaffMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => staffApi.delete(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: staffKeys.list() });
    },
  });
}
