import { useMutation, useQueryClient } from '@tanstack/react-query';
import { campaignsApi } from '@/lib/api/campaigns.api';
import { campaignKeys } from '@/hooks/campaigns/campaign-keys';

export function useDeleteCampaignMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => campaignsApi.delete(id),
    onSuccess: (_data, id) => {
      queryClient.removeQueries({ queryKey: campaignKeys.detail(id) });
      void queryClient.invalidateQueries({ queryKey: campaignKeys.all });
    },
  });
}
