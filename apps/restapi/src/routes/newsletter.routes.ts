import type { Hono } from 'hono';
import type { NewsletterRepository } from '@luxe-maison/core';
import { createNewsletterService } from '@luxe-maison/core';

export function newsletterRoutes(
  app: Hono,
  { newsletterRepository }: { newsletterRepository: NewsletterRepository },
) {
  const newsletter = createNewsletterService(newsletterRepository);

  app.get('/api/newsletter/subscribers', async (c) => {
    const list = await newsletter.listSubscribers();
    return c.json(list);
  });

  app.get('/api/newsletter/subscribers/:id', async (c) => {
    const subscriber = await newsletter.getSubscriberById(c.req.param('id'));
    if (!subscriber) return c.json({ error: 'Subscriber not found' }, 404);
    return c.json(subscriber);
  });

  app.get('/api/newsletter/emails', async (c) => {
    const list = await newsletter.listEmails();
    return c.json(list);
  });

  app.get('/api/newsletter/emails/:id', async (c) => {
    const email = await newsletter.getEmailById(c.req.param('id'));
    if (!email) return c.json({ error: 'Newsletter email not found' }, 404);
    return c.json(email);
  });
}
