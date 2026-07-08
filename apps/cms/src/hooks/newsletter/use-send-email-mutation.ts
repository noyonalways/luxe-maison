import { useMutation, useQueryClient } from '@tanstack/react-query';
import { newsletterApi, type SendNewsletterPayload } from '@/lib/api/newsletter.api';
import { newsletterKeys } from '@/hooks/newsletter/newsletter-keys';

export function useSendEmailMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: SendNewsletterPayload) => newsletterApi.sendEmail(payload),
    onSuccess: (sent) => {
      queryClient.setQueryData(newsletterKeys.email(sent.id), sent);
      void queryClient.invalidateQueries({ queryKey: newsletterKeys.emails() });
    },
  });
}
