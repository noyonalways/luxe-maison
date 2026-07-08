import { useQuery } from '@tanstack/react-query';
import { settingsApi } from '@/lib/api/settings.api';
import { settingsKeys } from '@/hooks/settings/settings-keys';
import { getStoredToken } from '@/lib/auth-session';

export function useSettingsQuery(enabled = true) {
  const hasToken = Boolean(getStoredToken());

  return useQuery({
    queryKey: settingsKeys.detail(),
    queryFn: () => settingsApi.get(),
    enabled: enabled && hasToken,
    staleTime: 30_000,
  });
}
