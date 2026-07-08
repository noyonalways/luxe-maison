import type { Hono } from 'hono';
import type { NewsletterRepository } from '@luxe-maison/core';
import { createNewsletterService } from '@luxe-maison/core';
import { requireAuth, type AuthVariables } from '../middleware/auth.middleware.js';
import { requireSection } from '../lib/role-permissions.js';

export function newsletterRoutes(
  app: Hono<{ Variables: AuthVariables }>,
  { newsletterRepository }: { newsletterRepository: NewsletterRepository },
) {
  const newsletter = createNewsletterService(newsletterRepository);

  app.get('/api/newsletter/subscribers', requireAuth, requireSection('newsletter', 'view'), async (c) => {
    const list = await newsletter.listSubscribers();
    return c.json(list);
  });

  app.get('/api/newsletter/subscribers/:id', requireAuth, requireSection('newsletter', 'view'), async (c) => {
    const subscriber = await newsletter.getSubscriberById(c.req.param('id'));
    if (!subscriber) return c.json({ error: 'Subscriber not found' }, 404);
    return c.json(subscriber);
  });

  app.get('/api/newsletter/emails', requireAuth, requireSection('newsletter', 'view'), async (c) => {
    const list = await newsletter.listEmails();
    return c.json(list);
  });

  app.get('/api/newsletter/emails/:id', requireAuth, requireSection('newsletter', 'view'), async (c) => {
    const email = await newsletter.getEmailById(c.req.param('id'));
    if (!email) return c.json({ error: 'Newsletter email not found' }, 404);
    return c.json(email);
  });
}
