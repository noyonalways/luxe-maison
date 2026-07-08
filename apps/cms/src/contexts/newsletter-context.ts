import { createContext, useContext } from 'react';
import type { NewsletterEmail, Subscriber } from '@/data/cms-types';
import type {
  CreateSubscriberPayload,
  SendNewsletterPayload,
  UpdateSubscriberPayload,
} from '@/lib/api/newsletter.api';

export interface NewsletterContextValue {
  subscribers: Subscriber[];
  emails: NewsletterEmail[];
  isLoading: boolean;
  isSaving: boolean;
  error: string | null;
  addSubscriber: (payload: CreateSubscriberPayload) => Promise<Subscriber>;
  updateSubscriber: (id: string, payload: UpdateSubscriberPayload) => Promise<Subscriber>;
  deleteSubscriber: (id: string) => Promise<void>;
  sendEmail: (payload: SendNewsletterPayload) => Promise<NewsletterEmail>;
}

export const NewsletterContext = createContext<NewsletterContextValue | null>(null);

export function useNewsletter() {
  const ctx = useContext(NewsletterContext);
  if (!ctx) throw new Error('useNewsletter must be used within NewsletterProvider');
  return ctx;
}
