import { useMutation, useQueryClient } from '@tanstack/react-query';
import { homepageApi, type UpdateHomepagePayload } from '@/lib/api/homepage.api';
import { homepageKeys } from '@/hooks/homepage/homepage-keys';

export function useUpdateHomepageMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (updates: UpdateHomepagePayload) => homepageApi.update(updates),
    onSuccess: (data) => {
      queryClient.setQueryData(homepageKeys.detail(), data);
    },
  });
}
