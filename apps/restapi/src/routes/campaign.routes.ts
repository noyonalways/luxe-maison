import type { Hono } from 'hono';
import type { Campaign, CampaignRepository, CampaignType } from '@luxe-maison/core';
import { createCampaignService, deriveCampaignStatus } from '@luxe-maison/core';
import { requireAuth, type AuthVariables } from '../middleware/auth.middleware.js';
import { requireSection } from '../lib/role-permissions.js';

const CAMPAIGN_TYPES: CampaignType[] = ['sale', 'seasonal', 'flash', 'launch'];

function isCampaignType(value: unknown): value is CampaignType {
  return typeof value === 'string' && CAMPAIGN_TYPES.includes(value as CampaignType);
}

function parseCampaignInput(body: Partial<Campaign>): Partial<Campaign> {
  const startDate = body.startDate ? new Date(body.startDate).toISOString() : undefined;
  const endDate = body.endDate ? new Date(body.endDate).toISOString() : undefined;

  const updates: Partial<Campaign> = {
    name: body.name?.trim(),
    type: isCampaignType(body.type) ? body.type : undefined,
    description: body.description?.trim(),
    startDate,
    endDate,
    discountCode: body.discountCode?.trim() || undefined,
    targetAudience: body.targetAudience?.trim(),
    budget: typeof body.budget === 'number' ? body.budget : undefined,
  };

  if (startDate && endDate) {
    updates.status = deriveCampaignStatus(startDate, endDate);
  }

  return updates;
}

export function campaignRoutes(
  app: Hono<{ Variables: AuthVariables }>,
  { campaignRepository }: { campaignRepository: CampaignRepository },
) {
  const campaigns = createCampaignService(campaignRepository);

  app.get('/api/campaigns', requireAuth, requireSection('campaigns', 'view'), async (c) => {
    const activeOnly = c.req.query('active') === 'true';
    const list = activeOnly ? await campaigns.listActive() : await campaigns.list();
    return c.json(list);
  });

  app.get('/api/campaigns/:id', requireAuth, requireSection('campaigns', 'view'), async (c) => {
    const campaign = await campaigns.getById(c.req.param('id'));
    if (!campaign) return c.json({ error: 'Campaign not found' }, 404);
    return c.json(campaign);
  });

  app.post('/api/campaigns', requireAuth, requireSection('campaigns', 'edit'), async (c) => {
    const body = await c.req.json<Partial<Campaign>>();

    if (!body.name?.trim() || !body.startDate || !body.endDate) {
      return c.json({ status: 'error', message: 'name, startDate, and endDate are required' }, 400);
    }

    if (!isCampaignType(body.type)) {
      return c.json({ status: 'error', message: 'Invalid campaign type' }, 400);
    }

    const startDate = new Date(body.startDate).toISOString();
    const endDate = new Date(body.endDate).toISOString();

    if (new Date(endDate) < new Date(startDate)) {
      return c.json({ status: 'error', message: 'endDate must be after startDate' }, 400);
    }

    const campaign: Campaign = {
      id: body.id || `camp-${Date.now()}`,
      name: body.name.trim(),
      type: body.type,
      description: body.description?.trim() || '',
      startDate,
      endDate,
      discountCode: body.discountCode?.trim() || undefined,
      targetAudience: body.targetAudience?.trim() || 'All subscribers',
      budget: Number(body.budget) || 0,
      revenue: 0,
      impressions: 0,
      clicks: 0,
      conversions: 0,
      status: deriveCampaignStatus(startDate, endDate),
      createdAt: new Date().toISOString(),
    };

    const created = await campaigns.create(campaign);
    return c.json(created, 201);
  });

  app.put('/api/campaigns/:id', requireAuth, requireSection('campaigns', 'edit'), async (c) => {
    const id = c.req.param('id');
    const body = await c.req.json<Partial<Campaign>>();
    const updates = parseCampaignInput(body);

    if (updates.name !== undefined && !updates.name) {
      return c.json({ status: 'error', message: 'name cannot be empty' }, 400);
    }

    if (updates.startDate && updates.endDate && new Date(updates.endDate) < new Date(updates.startDate)) {
      return c.json({ status: 'error', message: 'endDate must be after startDate' }, 400);
    }

    const existing = await campaigns.getById(id);
    if (!existing) return c.json({ error: 'Campaign not found' }, 404);

    if (!updates.status && (updates.startDate || updates.endDate)) {
      const startDate = updates.startDate ?? existing.startDate;
      const endDate = updates.endDate ?? existing.endDate;
      updates.status = deriveCampaignStatus(startDate, endDate);
    }

    const updated = await campaigns.update(id, updates);
    if (!updated) return c.json({ error: 'Campaign not found' }, 404);
    return c.json(updated);
  });

  app.delete('/api/campaigns/:id', requireAuth, requireSection('campaigns', 'full'), async (c) => {
    const deleted = await campaigns.delete(c.req.param('id'));
    if (!deleted) return c.json({ error: 'Campaign not found' }, 404);
    return c.json({ status: 'ok' });
  });
}
