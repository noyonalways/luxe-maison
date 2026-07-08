import { useQuery } from '@tanstack/react-query';
import { popupsApi } from '@/lib/api/popups.api';
import { popupKeys } from '@/hooks/popups/popup-keys';
import { getStoredToken } from '@/lib/auth-session';

export function usePopupsList(enabled = true) {
  const hasToken = Boolean(getStoredToken());

  return useQuery({
    queryKey: popupKeys.list(),
    queryFn: () => popupsApi.list(),
    enabled: enabled && hasToken,
    staleTime: 30_000,
  });
}
