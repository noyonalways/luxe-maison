import { useMutation, useQueryClient } from '@tanstack/react-query';
import { newsletterApi, type UpdateSubscriberPayload } from '@/lib/api/newsletter.api';
import { newsletterKeys } from '@/hooks/newsletter/newsletter-keys';

export function useUpdateSubscriberMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateSubscriberPayload }) =>
      newsletterApi.updateSubscriber(id, payload),
    onSuccess: (updated) => {
      queryClient.setQueryData(newsletterKeys.subscriber(updated.id), updated);
      void queryClient.invalidateQueries({ queryKey: newsletterKeys.subscribers() });
    },
  });
}
