import { useMutation, useQueryClient } from '@tanstack/react-query';
import { popupsApi } from '@/lib/api/popups.api';
import { popupKeys } from '@/hooks/popups/popup-keys';

export function useDeletePopupMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => popupsApi.delete(id),
    onSuccess: (_data, id) => {
      queryClient.removeQueries({ queryKey: popupKeys.detail(id) });
      void queryClient.invalidateQueries({ queryKey: popupKeys.all });
    },
  });
}
