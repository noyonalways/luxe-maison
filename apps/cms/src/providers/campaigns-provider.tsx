import { useCallback, useMemo, type ReactNode } from 'react';
import { CampaignsContext } from '@/contexts/campaigns-context';
import { useAuth } from '@/contexts/auth-context';
import { useRole } from '@/contexts/role-context';
import { useCampaignsList } from '@/hooks/campaigns/use-campaigns-list';
import { useCreateCampaignMutation } from '@/hooks/campaigns/use-create-campaign-mutation';
import { useUpdateCampaignMutation } from '@/hooks/campaigns/use-update-campaign-mutation';
import { useDeleteCampaignMutation } from '@/hooks/campaigns/use-delete-campaign-mutation';
import { toApiError } from '@/lib/api/errors';
import type { CreateCampaignPayload, UpdateCampaignPayload } from '@/lib/api/campaigns.api';

export function CampaignsProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth();
  const { hasAccess } = useRole();
  const canViewCampaigns = isAuthenticated && hasAccess('campaigns');

  const { data, isLoading, error } = useCampaignsList(canViewCampaigns);
  const createMutation = useCreateCampaignMutation();
  const updateMutation = useUpdateCampaignMutation();
  const deleteMutation = useDeleteCampaignMutation();

  const campaigns = data ?? [];

  const addCampaign = useCallback(
    async (campaign: CreateCampaignPayload) => createMutation.mutateAsync(campaign),
    [createMutation],
  );

  const updateCampaign = useCallback(
    async (id: string, campaign: UpdateCampaignPayload) =>
      updateMutation.mutateAsync({ id, campaign }),
    [updateMutation],
  );

  const deleteCampaign = useCallback(
    async (id: string) => {
      await deleteMutation.mutateAsync(id);
    },
    [deleteMutation],
  );

  const getActiveCampaigns = useCallback(
    () => campaigns.filter((c) => c.status === 'active'),
    [campaigns],
  );

  const isSaving =
    createMutation.isPending || updateMutation.isPending || deleteMutation.isPending;

  const value = useMemo(
    () => ({
      campaigns,
      isLoading: canViewCampaigns && isLoading,
      error: error ? toApiError(error).message : null,
      addCampaign,
      updateCampaign,
      deleteCampaign,
      getActiveCampaigns,
      isSaving,
    }),
    [
      campaigns,
      canViewCampaigns,
      isLoading,
      error,
      addCampaign,
      updateCampaign,
      deleteCampaign,
      getActiveCampaigns,
      isSaving,
    ],
  );

  return <CampaignsContext.Provider value={value}>{children}</CampaignsContext.Provider>;
}
