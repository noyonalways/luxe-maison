import type {
  CampaignRepository,
  CustomerRepository,
  DiscountRepository,
  NewsletterRepository,
  OrderRepository,
  PopupRepository,
  HomepageRepository,
  ProductRepository,
  ReviewRepository,
  RolePermissionsRepository,
  SettingsRepository,
  StaffRepository,
} from '@luxe-maison/core';
import type { DatabaseAdapter } from './clients/types.js';
import { getDatabaseConfig } from './config/database.config.js';
import {
  createImpCampaignRepository,
  createImpCustomerRepository,
  createImpDiscountRepository,
  createImpNewsletterRepository,
  createImpOrderRepository,
  createImpPopupRepository,
  createImpHomepageRepository,
  createImpProductRepository,
  createImpReviewRepository,
  createImpRolePermissionsRepository,
  createImpSettingsRepository,
  createImpStaffRepository,
} from './adapters/in_memory/repositories.js';
import {
  connectMongoose,
  createImpCampaignRepository as createMongooseCampaignRepository,
  createImpCustomerRepository as createMongooseCustomerRepository,
  createImpDiscountRepository as createMongooseDiscountRepository,
  createImpNewsletterRepository as createMongooseNewsletterRepository,
  createImpOrderRepository as createMongooseOrderRepository,
  createImpPopupRepository as createMongoosePopupRepository,
  createImpHomepageRepository as createMongooseHomepageRepository,
  createImpProductRepository as createMongooseProductRepository,
  createImpReviewRepository as createMongooseReviewRepository,
  createImpRolePermissionsRepository as createMongooseRolePermissionsRepository,
  createImpSettingsRepository as createMongooseSettingsRepository,
  createImpStaffRepository as createMongooseStaffRepository,
  disconnectMongoose,
} from './adapters/mongoose/repositories.js';

let currentAdapter: DatabaseAdapter = 'in_memory';

export interface InitDatabaseOptions {
  adapter?: DatabaseAdapter;
  mongoUri?: string;
}

export async function initDatabase(options: InitDatabaseOptions = {}): Promise<DatabaseAdapter> {
  const config = getDatabaseConfig();
  const adapter = options.adapter ?? config.adapter;
  const mongoUri = options.mongoUri ?? config.mongoUri;

  if (adapter === 'mongoose') {
    if (!mongoUri) {
      throw new Error('MONGODB_URI is required when using the mongoose adapter');
    }
    await connectMongoose(mongoUri);
  }

  if (adapter === 'prisma') {
    throw new Error('prisma adapter is not implemented yet');
  }

  currentAdapter = adapter;
  return adapter;
}

export function getActiveDatabaseAdapter(): DatabaseAdapter {
  return currentAdapter;
}

export async function disconnectDatabase(): Promise<void> {
  if (currentAdapter === 'mongoose') {
    await disconnectMongoose();
  }
}

function resolveAdapter(adapter?: DatabaseAdapter): DatabaseAdapter {
  return adapter ?? currentAdapter;
}

function unsupported(entity: string, adapter: DatabaseAdapter): never {
  throw new Error(`Unsupported adapter for ${entity} repository: ${adapter}`);
}

export function getProductRepository(adapter?: DatabaseAdapter): ProductRepository {
  switch (resolveAdapter(adapter)) {
    case 'in_memory':
      return createImpProductRepository();
    case 'mongoose':
      return createMongooseProductRepository();
    default:
      return unsupported('product', resolveAdapter(adapter));
  }
}

export function getOrderRepository(adapter?: DatabaseAdapter): OrderRepository {
  switch (resolveAdapter(adapter)) {
    case 'in_memory':
      return createImpOrderRepository();
    case 'mongoose':
      return createMongooseOrderRepository();
    default:
      return unsupported('order', resolveAdapter(adapter));
  }
}

export function getCustomerRepository(adapter?: DatabaseAdapter): CustomerRepository {
  switch (resolveAdapter(adapter)) {
    case 'in_memory':
      return createImpCustomerRepository();
    case 'mongoose':
      return createMongooseCustomerRepository();
    default:
      return unsupported('customer', resolveAdapter(adapter));
  }
}

export function getCampaignRepository(adapter?: DatabaseAdapter): CampaignRepository {
  switch (resolveAdapter(adapter)) {
    case 'in_memory':
      return createImpCampaignRepository();
    case 'mongoose':
      return createMongooseCampaignRepository();
    default:
      return unsupported('campaign', resolveAdapter(adapter));
  }
}

export function getDiscountRepository(adapter?: DatabaseAdapter): DiscountRepository {
  switch (resolveAdapter(adapter)) {
    case 'in_memory':
      return createImpDiscountRepository();
    case 'mongoose':
      return createMongooseDiscountRepository();
    default:
      return unsupported('discount', resolveAdapter(adapter));
  }
}

export function getNewsletterRepository(adapter?: DatabaseAdapter): NewsletterRepository {
  switch (resolveAdapter(adapter)) {
    case 'in_memory':
      return createImpNewsletterRepository();
    case 'mongoose':
      return createMongooseNewsletterRepository();
    default:
      return unsupported('newsletter', resolveAdapter(adapter));
  }
}

export function getStaffRepository(adapter?: DatabaseAdapter): StaffRepository {
  switch (resolveAdapter(adapter)) {
    case 'in_memory':
      return createImpStaffRepository();
    case 'mongoose':
      return createMongooseStaffRepository();
    default:
      return unsupported('staff', resolveAdapter(adapter));
  }
}

export function getSettingsRepository(adapter?: DatabaseAdapter): SettingsRepository {
  switch (resolveAdapter(adapter)) {
    case 'in_memory':
      return createImpSettingsRepository();
    case 'mongoose':
      return createMongooseSettingsRepository();
    default:
      return unsupported('settings', resolveAdapter(adapter));
  }
}

export function getReviewRepository(adapter?: DatabaseAdapter): ReviewRepository {
  switch (resolveAdapter(adapter)) {
    case 'in_memory':
      return createImpReviewRepository();
    case 'mongoose':
      return createMongooseReviewRepository();
    default:
      return unsupported('review', resolveAdapter(adapter));
  }
}

export function getPopupRepository(adapter?: DatabaseAdapter): PopupRepository {
  switch (resolveAdapter(adapter)) {
    case 'in_memory':
      return createImpPopupRepository();
    case 'mongoose':
      return createMongoosePopupRepository();
    default:
      return unsupported('popup', resolveAdapter(adapter));
  }
}

export function getHomepageRepository(adapter?: DatabaseAdapter): HomepageRepository {
  switch (resolveAdapter(adapter)) {
    case 'in_memory':
      return createImpHomepageRepository();
    case 'mongoose':
      return createMongooseHomepageRepository();
    default:
      return unsupported('homepage', resolveAdapter(adapter));
  }
}

export function getRolePermissionsRepository(adapter?: DatabaseAdapter): RolePermissionsRepository {
  switch (resolveAdapter(adapter)) {
    case 'in_memory':
      return createImpRolePermissionsRepository();
    case 'mongoose':
      return createMongooseRolePermissionsRepository();
    default:
      return unsupported('role permissions', resolveAdapter(adapter));
  }
}
