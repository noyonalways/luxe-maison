import { useMutation, useQueryClient } from '@tanstack/react-query';
import { newsletterApi } from '@/lib/api/newsletter.api';
import { newsletterKeys } from '@/hooks/newsletter/newsletter-keys';

export function useDeleteSubscriberMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => newsletterApi.deleteSubscriber(id),
    onSuccess: (_data, id) => {
      queryClient.removeQueries({ queryKey: newsletterKeys.subscriber(id) });
      void queryClient.invalidateQueries({ queryKey: newsletterKeys.subscribers() });
    },
  });
}
