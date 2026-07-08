import { useMutation, useQueryClient } from '@tanstack/react-query';
import { settingsApi, type UpdateSettingsPayload } from '@/lib/api/settings.api';
import { settingsKeys } from '@/hooks/settings/settings-keys';

export function useUpdateSettingsMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (updates: UpdateSettingsPayload) => settingsApi.update(updates),
    onSuccess: (updated) => {
      queryClient.setQueryData(settingsKeys.detail(), updated);
    },
  });
}
