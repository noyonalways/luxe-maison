import type { Hono } from 'hono';
import type { NewsletterRepository, Subscriber } from '@luxe-maison/core';
import { createNewsletterService } from '@luxe-maison/core';
import { requireAuth, type AuthVariables } from '../middleware/auth.middleware.js';
import { requireSection } from '../lib/role-permissions.js';

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isSubscriberStatus(value: unknown): value is Subscriber['status'] {
  return value === 'active' || value === 'unsubscribed';
}

function isAudience(value: unknown): value is 'all' | 'active' {
  return value === 'all' || value === 'active';
}

export function newsletterRoutes(
  app: Hono<{ Variables: AuthVariables }>,
  { newsletterRepository }: { newsletterRepository: NewsletterRepository },
) {
  const newsletter = createNewsletterService(newsletterRepository);

  app.post('/api/newsletter/subscribe', async (c) => {
    const body = await c.req.json<{ email?: string; name?: string }>();
    const email = body.email?.trim().toLowerCase();
    const name = body.name?.trim() || email?.split('@')[0] || 'Subscriber';

    if (!email) {
      return c.json({ status: 'error', message: 'email is required' }, 400);
    }

    if (!isValidEmail(email)) {
      return c.json({ status: 'error', message: 'Invalid email address' }, 400);
    }

    const existing = await newsletter.getSubscriberByEmail(email);
    if (existing) {
      if (existing.status === 'active') {
        return c.json({ status: 'ok', message: 'You are already subscribed' });
      }
      const reactivated = await newsletter.updateSubscriber(existing.id, {
        status: 'active',
        name,
      });
      return c.json(reactivated);
    }

    const subscriber: Subscriber = {
      id: `sub-${Date.now()}`,
      email,
      name,
      status: 'active',
      subscribedAt: new Date().toISOString(),
    };

    const created = await newsletter.createSubscriber(subscriber);
    return c.json(created, 201);
  });

  app.get('/api/newsletter/subscribers', requireAuth, requireSection('newsletter', 'view'), async (c) => {
    const list = await newsletter.listSubscribers();
    return c.json(list);
  });

  app.get('/api/newsletter/subscribers/:id', requireAuth, requireSection('newsletter', 'view'), async (c) => {
    const subscriber = await newsletter.getSubscriberById(c.req.param('id'));
    if (!subscriber) return c.json({ error: 'Subscriber not found' }, 404);
    return c.json(subscriber);
  });

  app.post('/api/newsletter/subscribers', requireAuth, requireSection('newsletter', 'edit'), async (c) => {
    const body = await c.req.json<{ email?: string; name?: string; status?: Subscriber['status'] }>();

    const email = body.email?.trim().toLowerCase();
    const name = body.name?.trim();

    if (!email || !name) {
      return c.json({ status: 'error', message: 'email and name are required' }, 400);
    }

    if (!isValidEmail(email)) {
      return c.json({ status: 'error', message: 'Invalid email address' }, 400);
    }

    const existing = await newsletter.getSubscriberByEmail(email);
    if (existing) {
      return c.json({ status: 'error', message: 'This email is already subscribed' }, 409);
    }

    const subscriber: Subscriber = {
      id: `sub-${Date.now()}`,
      email,
      name,
      status: isSubscriberStatus(body.status) ? body.status : 'active',
      subscribedAt: new Date().toISOString(),
    };

    const created = await newsletter.createSubscriber(subscriber);
    return c.json(created, 201);
  });

  app.put('/api/newsletter/subscribers/:id', requireAuth, requireSection('newsletter', 'edit'), async (c) => {
    const id = c.req.param('id');
    const body = await c.req.json<{ email?: string; name?: string; status?: Subscriber['status'] }>();

    const updates: Partial<Subscriber> = {};

    if (body.name !== undefined) {
      const name = body.name.trim();
      if (!name) return c.json({ status: 'error', message: 'name cannot be empty' }, 400);
      updates.name = name;
    }

    if (body.email !== undefined) {
      const email = body.email.trim().toLowerCase();
      if (!email) return c.json({ status: 'error', message: 'email cannot be empty' }, 400);
      if (!isValidEmail(email)) {
        return c.json({ status: 'error', message: 'Invalid email address' }, 400);
      }
      const existing = await newsletter.getSubscriberByEmail(email);
      if (existing && existing.id !== id) {
        return c.json({ status: 'error', message: 'This email is already subscribed' }, 409);
      }
      updates.email = email;
    }

    if (body.status !== undefined) {
      if (!isSubscriberStatus(body.status)) {
        return c.json({ status: 'error', message: 'Invalid subscriber status' }, 400);
      }
      updates.status = body.status;
    }

    const updated = await newsletter.updateSubscriber(id, updates);
    if (!updated) return c.json({ error: 'Subscriber not found' }, 404);
    return c.json(updated);
  });

  app.delete('/api/newsletter/subscribers/:id', requireAuth, requireSection('newsletter', 'full'), async (c) => {
    const deleted = await newsletter.deleteSubscriber(c.req.param('id'));
    if (!deleted) return c.json({ error: 'Subscriber not found' }, 404);
    return c.json({ status: 'ok' });
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

  app.post('/api/newsletter/emails', requireAuth, requireSection('newsletter', 'edit'), async (c) => {
    const body = await c.req.json<{ subject?: string; body?: string; audience?: 'all' | 'active' }>();

    const subject = body.subject?.trim();
    const emailBody = body.body?.trim();

    if (!subject || !emailBody) {
      return c.json({ status: 'error', message: 'subject and body are required' }, 400);
    }

    if (!isAudience(body.audience)) {
      return c.json({ status: 'error', message: 'audience must be all or active' }, 400);
    }

    const sent = await newsletter.sendEmail({
      subject,
      body: emailBody,
      audience: body.audience,
    });

    return c.json(sent, 201);
  });
}
