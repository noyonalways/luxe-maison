import type { NewsletterEmail, Subscriber } from '@luxe-maison/core';
import type { NewsletterRepository } from '@luxe-maison/core';
import type { Model } from 'mongoose';
import { NewsletterEmailModel, SubscriberModel } from './schemas/newsletter.schema.js';

function toPlain<T>(doc: T | null): T | null {
  if (!doc) return null;
  return JSON.parse(JSON.stringify(doc)) as T;
}

export function createImpNewsletterRepository(
  subscriberModel: Model<Subscriber> = SubscriberModel,
  emailModel: Model<NewsletterEmail> = NewsletterEmailModel,
): NewsletterRepository {
  return {
    async findAllSubscribers() {
      const docs = await subscriberModel.find().lean<Subscriber[]>();
      return docs.map((doc) => toPlain(doc)!);
    },

    async findSubscriberById(id: string) {
      const doc = await subscriberModel.findOne({ id }).lean<Subscriber>();
      return toPlain(doc);
    },

    async findSubscriberByEmail(email: string) {
      const normalized = email.toLowerCase();
      const doc = await subscriberModel
        .findOne({ email: { $regex: new RegExp(`^${normalized}$`, 'i') } })
        .lean<Subscriber>();
      return toPlain(doc);
    },

    async createSubscriber(subscriber: Subscriber) {
      const doc = await subscriberModel.create(subscriber);
      return toPlain(doc.toObject())!;
    },

    async updateSubscriber(id: string, updates: Partial<Subscriber>) {
      const doc = await subscriberModel
        .findOneAndUpdate({ id }, { $set: updates }, { new: true })
        .lean<Subscriber>();
      return toPlain(doc);
    },

    async deleteSubscriber(id: string) {
      const result = await subscriberModel.deleteOne({ id });
      return result.deletedCount > 0;
    },

    async findAllEmails() {
      const docs = await emailModel.find().lean<NewsletterEmail[]>();
      return docs.map((doc) => toPlain(doc)!);
    },

    async findEmailById(id: string) {
      const doc = await emailModel.findOne({ id }).lean<NewsletterEmail>();
      return toPlain(doc);
    },

    async createEmail(email: NewsletterEmail) {
      const doc = await emailModel.create(email);
      return toPlain(doc.toObject())!;
    },
  };
}
