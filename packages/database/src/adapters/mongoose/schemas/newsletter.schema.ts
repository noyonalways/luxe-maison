import mongoose, { Schema, model, type Model } from 'mongoose';
import type { NewsletterEmail, Subscriber } from '@luxe-maison/core';
import { COLLECTIONS, MODEL_NAMES } from '../collection-names.js';

const subscriberSchema = new Schema<Subscriber>(
  {
    id: { type: String, required: true, unique: true, index: true },
    email: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true },
    status: { type: String, required: true, enum: ['active', 'unsubscribed'] },
    subscribedAt: { type: String, required: true },
  },
  { versionKey: false, collection: COLLECTIONS.subscribers },
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
  { versionKey: false, collection: COLLECTIONS.newsletter_emails },
);

export const SubscriberModel: Model<Subscriber> =
  mongoose.models?.[MODEL_NAMES.Subscriber] ??
  model<Subscriber>(MODEL_NAMES.Subscriber, subscriberSchema);

export const NewsletterEmailModel: Model<NewsletterEmail> =
  mongoose.models?.[MODEL_NAMES.Newsletter_Email] ??
  model<NewsletterEmail>(MODEL_NAMES.Newsletter_Email, newsletterEmailSchema);
