export interface Subscriber {
  id: string;
  email: string;
  name: string;
  status: 'active' | 'unsubscribed';
  subscribedAt: string;
}

export interface NewsletterEmail {
  id: string;
  subject: string;
  body: string;
  audience: 'all' | 'active';
  recipientCount: number;
  openRate: number;
  sentAt: string;
}
