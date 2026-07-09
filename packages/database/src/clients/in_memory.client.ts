import type { DatabaseClient } from './types.js';
import { createImpProductRepository } from '../adapters/in_memory/imp_product.repository.js';
import { createImpOrderRepository } from '../adapters/in_memory/imp_order.repository.js';
import { createImpCustomerRepository } from '../adapters/in_memory/imp_customer.repository.js';
import { createImpCampaignRepository } from '../adapters/in_memory/imp_campaign.repository.js';
import { createImpDiscountRepository } from '../adapters/in_memory/imp_discount.repository.js';
import { createImpNewsletterRepository } from '../adapters/in_memory/imp_newsletter.repository.js';
import { createImpStaffRepository } from '../adapters/in_memory/imp_staff.repository.js';
import { createImpSettingsRepository } from '../adapters/in_memory/imp_settings.repository.js';
import { createImpReviewRepository } from '../adapters/in_memory/imp_review.repository.js';
import { createImpPopupRepository } from '../adapters/in_memory/imp_popup.repository.js';

export function createInMemoryClient(): DatabaseClient {
  return {
    adapter: 'in_memory',
    repositories: {
      products: createImpProductRepository(),
      orders: createImpOrderRepository(),
      customers: createImpCustomerRepository(),
      campaigns: createImpCampaignRepository(),
      discounts: createImpDiscountRepository(),
      newsletter: createImpNewsletterRepository(),
      staff: createImpStaffRepository(),
      settings: createImpSettingsRepository(),
      reviews: createImpReviewRepository(),
      popups: createImpPopupRepository(),
    },
  };
}

/** @deprecated Use createInMemoryClient */
export const createInMemoryDatabase = createInMemoryClient;

/** @deprecated Use createInMemoryClient */
export const createMemoryDatabase = createInMemoryClient;
