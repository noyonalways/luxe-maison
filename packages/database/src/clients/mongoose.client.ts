import type { DatabaseClient } from './types.js';
import { connectMongoose, disconnectMongoose } from '../adapters/mongoose/connection.js';
import { createImpProductRepository } from '../adapters/mongoose/imp_product.repository.js';
import { createImpOrderRepository } from '../adapters/mongoose/imp_order.repository.js';
import { createImpCustomerRepository } from '../adapters/mongoose/imp_customer.repository.js';
import { createImpCampaignRepository } from '../adapters/mongoose/imp_campaign.repository.js';
import { createImpDiscountRepository } from '../adapters/mongoose/imp_discount.repository.js';
import { createImpNewsletterRepository } from '../adapters/mongoose/imp_newsletter.repository.js';
import { createImpStaffRepository } from '../adapters/mongoose/imp_staff.repository.js';
import { createImpSettingsRepository } from '../adapters/mongoose/imp_settings.repository.js';
import { createImpReviewRepository } from '../adapters/mongoose/imp_review.repository.js';
import { createImpPopupRepository } from '../adapters/mongoose/imp_popup.repository.js';

export async function createMongooseClient(uri: string): Promise<DatabaseClient> {
  await connectMongoose(uri);

  return {
    adapter: 'mongoose',
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
    disconnect: disconnectMongoose,
  };
}
