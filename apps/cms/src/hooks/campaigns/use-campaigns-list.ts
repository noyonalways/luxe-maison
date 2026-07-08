import { useQuery } from '@tanstack/react-query';
import { campaignsApi } from '@/lib/api/campaigns.api';
import { campaignKeys } from '@/hooks/campaigns/campaign-keys';
import { getStoredToken } from '@/lib/auth-session';

export function useCampaignsList(enabled = true, activeOnly = false) {
  const hasToken = Boolean(getStoredToken());

  return useQuery({
    queryKey: campaignKeys.list(activeOnly),
    queryFn: () => campaignsApi.list(activeOnly),
    enabled: enabled && hasToken,
    staleTime: 30_000,
  });
}
