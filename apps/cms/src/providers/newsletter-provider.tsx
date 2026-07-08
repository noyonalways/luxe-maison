import { useCallback, useMemo, type ReactNode } from 'react';
import { NewsletterContext } from '@/contexts/newsletter-context';
import { useAuth } from '@/contexts/auth-context';
import { useRole } from '@/contexts/role-context';
import { useSubscribersList } from '@/hooks/newsletter/use-subscribers-list';
import { useEmailsList } from '@/hooks/newsletter/use-emails-list';
import { useCreateSubscriberMutation } from '@/hooks/newsletter/use-create-subscriber-mutation';
import { useUpdateSubscriberMutation } from '@/hooks/newsletter/use-update-subscriber-mutation';
import { useDeleteSubscriberMutation } from '@/hooks/newsletter/use-delete-subscriber-mutation';
import { useSendEmailMutation } from '@/hooks/newsletter/use-send-email-mutation';
import { toApiError } from '@/lib/api/errors';
import type {
  CreateSubscriberPayload,
  SendNewsletterPayload,
  UpdateSubscriberPayload,
} from '@/lib/api/newsletter.api';

export function NewsletterProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth();
  const { hasAccess } = useRole();
  const canViewNewsletter = isAuthenticated && hasAccess('newsletter');

  const {
    data: subscribersData,
    isLoading: subscribersLoading,
    error: subscribersError,
  } = useSubscribersList(canViewNewsletter);
  const {
    data: emailsData,
    isLoading: emailsLoading,
    error: emailsError,
  } = useEmailsList(canViewNewsletter);

  const createSubscriberMutation = useCreateSubscriberMutation();
  const updateSubscriberMutation = useUpdateSubscriberMutation();
  const deleteSubscriberMutation = useDeleteSubscriberMutation();
  const sendEmailMutation = useSendEmailMutation();

  const subscribers = subscribersData ?? [];
  const emails = emailsData ?? [];

  const addSubscriber = useCallback(
    async (payload: CreateSubscriberPayload) => createSubscriberMutation.mutateAsync(payload),
    [createSubscriberMutation],
  );

  const updateSubscriber = useCallback(
    async (id: string, payload: UpdateSubscriberPayload) =>
      updateSubscriberMutation.mutateAsync({ id, payload }),
    [updateSubscriberMutation],
  );

  const deleteSubscriber = useCallback(
    async (id: string) => {
      await deleteSubscriberMutation.mutateAsync(id);
    },
    [deleteSubscriberMutation],
  );

  const sendEmail = useCallback(
    async (payload: SendNewsletterPayload) => sendEmailMutation.mutateAsync(payload),
    [sendEmailMutation],
  );

  const isSaving =
    createSubscriberMutation.isPending ||
    updateSubscriberMutation.isPending ||
    deleteSubscriberMutation.isPending ||
    sendEmailMutation.isPending;

  const error = subscribersError ?? emailsError;

  const value = useMemo(
    () => ({
      subscribers,
      emails,
      isLoading: canViewNewsletter && (subscribersLoading || emailsLoading),
      error: error ? toApiError(error).message : null,
      addSubscriber,
      updateSubscriber,
      deleteSubscriber,
      sendEmail,
      isSaving,
    }),
    [
      subscribers,
      emails,
      canViewNewsletter,
      subscribersLoading,
      emailsLoading,
      error,
      addSubscriber,
      updateSubscriber,
      deleteSubscriber,
      sendEmail,
      isSaving,
    ],
  );

  return <NewsletterContext.Provider value={value}>{children}</NewsletterContext.Provider>;
}
