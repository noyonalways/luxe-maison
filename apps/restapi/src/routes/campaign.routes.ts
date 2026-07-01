import type { Hono } from 'hono';
import type { CampaignRepository } from '@luxe-maison/core';
import { createCampaignService } from '@luxe-maison/core';

export function campaignRoutes(
  app: Hono,
  { campaignRepository }: { campaignRepository: CampaignRepository },
) {
  const campaigns = createCampaignService(campaignRepository);

  app.get('/api/campaigns', async (c) => {
    const activeOnly = c.req.query('active') === 'true';
    const list = activeOnly ? await campaigns.listActive() : await campaigns.list();
    return c.json(list);
  });

  app.get('/api/campaigns/:id', async (c) => {
    const campaign = await campaigns.getById(c.req.param('id'));
    if (!campaign) return c.json({ error: 'Campaign not found' }, 404);
    return c.json(campaign);
  });
}
