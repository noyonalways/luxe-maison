import { useMutation, useQueryClient } from '@tanstack/react-query';
import { popupsApi } from '@/lib/api/popups.api';
import { popupKeys } from '@/hooks/popups/popup-keys';

export function useSetPopupEnabledMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, enabled }: { id: string; enabled: boolean }) =>
      popupsApi.setEnabled(id, enabled),
    onSuccess: (updated) => {
      queryClient.setQueryData(popupKeys.detail(updated.id), updated);
      void queryClient.invalidateQueries({ queryKey: popupKeys.all });
    },
  });
}
