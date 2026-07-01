import type { NewsletterEmail, Subscriber } from '../entities/newsletter.entity.js';

export interface NewsletterRepository {
  findAllSubscribers(): Promise<Subscriber[]>;
  findSubscriberById(id: string): Promise<Subscriber | null>;
  findSubscriberByEmail(email: string): Promise<Subscriber | null>;
  createSubscriber(subscriber: Subscriber): Promise<Subscriber>;
  updateSubscriber(id: string, updates: Partial<Subscriber>): Promise<Subscriber | null>;
  deleteSubscriber(id: string): Promise<boolean>;
  findAllEmails(): Promise<NewsletterEmail[]>;
  findEmailById(id: string): Promise<NewsletterEmail | null>;
  createEmail(email: NewsletterEmail): Promise<NewsletterEmail>;
}
