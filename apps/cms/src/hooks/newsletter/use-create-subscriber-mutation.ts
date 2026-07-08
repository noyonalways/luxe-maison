import { useMutation, useQueryClient } from '@tanstack/react-query';
import { newsletterApi, type CreateSubscriberPayload } from '@/lib/api/newsletter.api';
import { newsletterKeys } from '@/hooks/newsletter/newsletter-keys';

export function useCreateSubscriberMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateSubscriberPayload) => newsletterApi.createSubscriber(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: newsletterKeys.subscribers() });
    },
  });
}
