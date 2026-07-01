import type { NewsletterEmail, Subscriber } from '@luxe-maison/core';
import type { NewsletterRepository } from '@luxe-maison/core';
import { mockNewsletterEmails, mockSubscribers } from './seed.js';

export function createImpNewsletterRepository(
  initialSubscribers: Subscriber[] = structuredClone(mockSubscribers),
  initialEmails: NewsletterEmail[] = structuredClone(mockNewsletterEmails),
): NewsletterRepository {
  const subscribers = initialSubscribers;
  const emails = initialEmails;

  return {
    async findAllSubscribers() {
      return [...subscribers];
    },

    async findSubscriberById(id: string) {
      return subscribers.find((s) => s.id === id) ?? null;
    },

    async findSubscriberByEmail(email: string) {
      const normalized = email.toLowerCase();
      return subscribers.find((s) => s.email.toLowerCase() === normalized) ?? null;
    },

    async createSubscriber(subscriber: Subscriber) {
      subscribers.push(subscriber);
      return subscriber;
    },

    async updateSubscriber(id: string, updates: Partial<Subscriber>) {
      const index = subscribers.findIndex((s) => s.id === id);
      if (index === -1) return null;
      subscribers[index] = { ...subscribers[index]!, ...updates };
      return subscribers[index]!;
    },

    async deleteSubscriber(id: string) {
      const index = subscribers.findIndex((s) => s.id === id);
      if (index === -1) return false;
      subscribers.splice(index, 1);
      return true;
    },

    async findAllEmails() {
      return [...emails];
    },

    async findEmailById(id: string) {
      return emails.find((e) => e.id === id) ?? null;
    },

    async createEmail(email: NewsletterEmail) {
      emails.push(email);
      return email;
    },
  };
}
