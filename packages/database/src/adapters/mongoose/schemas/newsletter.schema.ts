import mongoose, { Schema, model, type Model } from 'mongoose';
import type { NewsletterEmail, Subscriber } from '@luxe-maison/core';

const subscriberSchema = new Schema<Subscriber>(
  {
    id: { type: String, required: true, unique: true, index: true },
    email: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true },
    status: { type: String, required: true, enum: ['active', 'unsubscribed'] },
    subscribedAt: { type: String, required: true },
  },
  { versionKey: false },
);

const newsletterEmailSchema = new Schema<NewsletterEmail>(
  {
    id: { type: String, required: true, unique: true, index: true },
    subject: { type: String, required: true },
    body: { type: String, required: true },
    audience: { type: String, required: true, enum: ['all', 'active'] },
    recipientCount: { type: Number, required: true },
    openRate: { type: Number, required: true },
    sentAt: { type: String, required: true },
  },
  { versionKey: false },
);

export const SubscriberModel: Model<Subscriber> =
  mongoose.models?.Subscriber ?? model<Subscriber>('Subscriber', subscriberSchema);

export const NewsletterEmailModel: Model<NewsletterEmail> =
  mongoose.models?.NewsletterEmail ??
  model<NewsletterEmail>('NewsletterEmail', newsletterEmailSchema);
