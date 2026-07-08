import { useMutation, useQueryClient } from '@tanstack/react-query';
import { campaignsApi, type CreateCampaignPayload } from '@/lib/api/campaigns.api';
import { campaignKeys } from '@/hooks/campaigns/campaign-keys';

export function useCreateCampaignMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (campaign: CreateCampaignPayload) => campaignsApi.create(campaign),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: campaignKeys.all });
    },
  });
}
