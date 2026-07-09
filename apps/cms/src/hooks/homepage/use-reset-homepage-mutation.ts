import { useMutation, useQueryClient } from '@tanstack/react-query';
import { homepageApi } from '@/lib/api/homepage.api';
import { homepageKeys } from '@/hooks/homepage/homepage-keys';

export function useResetHomepageMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => homepageApi.reset(),
    onSuccess: (data) => {
      queryClient.setQueryData(homepageKeys.detail(), data);
    },
  });
}
