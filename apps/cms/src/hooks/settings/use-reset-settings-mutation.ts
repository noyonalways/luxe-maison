import { useMutation, useQueryClient } from '@tanstack/react-query';
import { settingsApi } from '@/lib/api/settings.api';
import { settingsKeys } from '@/hooks/settings/settings-keys';

export function useResetSettingsMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => settingsApi.reset(),
    onSuccess: (data) => {
      queryClient.setQueryData(settingsKeys.detail(), data);
    },
  });
}
