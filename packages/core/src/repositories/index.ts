export type { ProductRepository } from './product.repository.js';
export type { OrderRepository } from './order.repository.js';
export type { CustomerRepository } from './customer.repository.js';
export type { CampaignRepository } from './campaign.repository.js';
export type { DiscountRepository } from './discount.repository.js';
export type { NewsletterRepository } from './newsletter.repository.js';
export type { StaffRepository } from './staff.repository.js';
export type { SettingsRepository } from './settings.repository.js';
export type { ReviewRepository } from './review.repository.js';
export type { PopupRepository } from './popup.repository.js';
export type { HomepageRepository } from './homepage.repository.js';
export type { ContentPageRepository } from './content-page.repository.js';
export type { CmsRolesRepository } from './cms-roles.repository.js';

import type { ProductRepository } from './product.repository.js';
import type { OrderRepository } from './order.repository.js';
import type { CustomerRepository } from './customer.repository.js';
import type { CampaignRepository } from './campaign.repository.js';
import type { DiscountRepository } from './discount.repository.js';
import type { NewsletterRepository } from './newsletter.repository.js';
import type { StaffRepository } from './staff.repository.js';
import type { SettingsRepository } from './settings.repository.js';
import type { ReviewRepository } from './review.repository.js';
import type { PopupRepository } from './popup.repository.js';

export interface Repositories {
  products: ProductRepository;
  orders: OrderRepository;
  customers: CustomerRepository;
  campaigns: CampaignRepository;
  discounts: DiscountRepository;
  newsletter: NewsletterRepository;
  staff: StaffRepository;
  settings: SettingsRepository;
  reviews: ReviewRepository;
  popups: PopupRepository;
}
