import type { NewsletterEmail, Subscriber } from '../entities/newsletter.entity.js';
import type { NewsletterRepository } from '../repositories/newsletter.repository.js';

export function createNewsletterService(repository: NewsletterRepository) {
  return {
    listSubscribers(): Promise<Subscriber[]> {
      return repository.findAllSubscribers();
    },

    getSubscriberById(id: string): Promise<Subscriber | null> {
      return repository.findSubscriberById(id);
    },

    getSubscriberByEmail(email: string): Promise<Subscriber | null> {
      return repository.findSubscriberByEmail(email);
    },

    createSubscriber(subscriber: Subscriber): Promise<Subscriber> {
      return repository.createSubscriber(subscriber);
    },

    updateSubscriber(id: string, updates: Partial<Subscriber>): Promise<Subscriber | null> {
      return repository.updateSubscriber(id, updates);
    },

    deleteSubscriber(id: string): Promise<boolean> {
      return repository.deleteSubscriber(id);
    },

    listEmails(): Promise<NewsletterEmail[]> {
      return repository.findAllEmails();
    },

    getEmailById(id: string): Promise<NewsletterEmail | null> {
      return repository.findEmailById(id);
    },

    createEmail(email: NewsletterEmail): Promise<NewsletterEmail> {
      return repository.createEmail(email);
    },
  };
}

export type NewsletterService = ReturnType<typeof createNewsletterService>;
