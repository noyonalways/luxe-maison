import { useMutation, useQueryClient } from '@tanstack/react-query';
import { popupsApi, type CreatePopupPayload } from '@/lib/api/popups.api';
import { popupKeys } from '@/hooks/popups/popup-keys';

export function useCreatePopupMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (popup: CreatePopupPayload) => popupsApi.create(popup),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: popupKeys.all });
    },
  });
}
