import type { NewsletterEmail, Subscriber } from '@luxe-maison/shared';
import { apiClient } from '@/lib/api/client';

export interface CreateSubscriberPayload {
  email: string;
  name: string;
  status?: Subscriber['status'];
}

export interface UpdateSubscriberPayload {
  email?: string;
  name?: string;
  status?: Subscriber['status'];
}

export interface SendNewsletterPayload {
  subject: string;
  body: string;
  audience: 'all' | 'active';
}

export const newsletterApi = {
  listSubscribers() {
    return apiClient.get<Subscriber[]>('/api/newsletter/subscribers').then((res) => res.data);
  },

  getSubscriberById(id: string) {
    return apiClient.get<Subscriber>(`/api/newsletter/subscribers/${id}`).then((res) => res.data);
  },

  createSubscriber(payload: CreateSubscriberPayload) {
    return apiClient.post<Subscriber>('/api/newsletter/subscribers', payload).then((res) => res.data);
  },

  updateSubscriber(id: string, payload: UpdateSubscriberPayload) {
    return apiClient
      .put<Subscriber>(`/api/newsletter/subscribers/${id}`, payload)
      .then((res) => res.data);
  },

  deleteSubscriber(id: string) {
    return apiClient
      .delete<{ status: 'ok' }>(`/api/newsletter/subscribers/${id}`)
      .then((res) => res.data);
  },

  listEmails() {
    return apiClient.get<NewsletterEmail[]>('/api/newsletter/emails').then((res) => res.data);
  },

  getEmailById(id: string) {
    return apiClient.get<NewsletterEmail>(`/api/newsletter/emails/${id}`).then((res) => res.data);
  },

  sendEmail(payload: SendNewsletterPayload) {
    return apiClient.post<NewsletterEmail>('/api/newsletter/emails', payload).then((res) => res.data);
  },
};
