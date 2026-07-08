import { useMutation, useQueryClient } from '@tanstack/react-query';
import { popupsApi, type UpdatePopupPayload } from '@/lib/api/popups.api';
import { popupKeys } from '@/hooks/popups/popup-keys';

export function useUpdatePopupMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, popup }: { id: string; popup: UpdatePopupPayload }) =>
      popupsApi.update(id, popup),
    onSuccess: (updated) => {
      queryClient.setQueryData(popupKeys.detail(updated.id), updated);
      void queryClient.invalidateQueries({ queryKey: popupKeys.all });
    },
  });
}
