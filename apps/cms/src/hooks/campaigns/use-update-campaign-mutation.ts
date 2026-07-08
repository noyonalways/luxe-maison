import { useMutation, useQueryClient } from '@tanstack/react-query';
import { campaignsApi, type UpdateCampaignPayload } from '@/lib/api/campaigns.api';
import { campaignKeys } from '@/hooks/campaigns/campaign-keys';

export function useUpdateCampaignMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, campaign }: { id: string; campaign: UpdateCampaignPayload }) =>
      campaignsApi.update(id, campaign),
    onSuccess: (updated) => {
      queryClient.setQueryData(campaignKeys.detail(updated.id), updated);
      void queryClient.invalidateQueries({ queryKey: campaignKeys.all });
    },
  });
}
