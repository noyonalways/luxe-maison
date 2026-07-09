export {
  initDatabase,
  disconnectDatabase,
  getActiveDatabaseAdapter,
  getProductRepository,
  getOrderRepository,
  getCustomerRepository,
  getCampaignRepository,
  getDiscountRepository,
  getNewsletterRepository,
  getStaffRepository,
  getSettingsRepository,
  getReviewRepository,
  getPopupRepository,
  getHomepageRepository,
  getRolePermissionsRepository,
} from './get-repositories.js';

export type {
  DatabaseClient,
  DatabaseAdapter,
  CreateDatabaseOptions,
} from './clients/index.js';

export type { InitDatabaseOptions } from './get-repositories.js';

export {
  createDatabase,
  createInMemoryClient,
  createMongooseClient,
  createInMemoryDatabase,
  createMemoryDatabase,
} from './clients/index.js';

export {
  createImpProductRepository as createInMemoryProductRepository,
  createImpOrderRepository as createInMemoryOrderRepository,
  createImpCustomerRepository as createInMemoryCustomerRepository,
  createImpCampaignRepository as createInMemoryCampaignRepository,
  createImpDiscountRepository as createInMemoryDiscountRepository,
  createImpNewsletterRepository as createInMemoryNewsletterRepository,
  createImpStaffRepository as createInMemoryStaffRepository,
  createImpSettingsRepository as createInMemorySettingsRepository,
  createImpReviewRepository as createInMemoryReviewRepository,
  createImpPopupRepository as createInMemoryPopupRepository,
  createImpHomepageRepository as createInMemoryHomepageRepository,
  createImpRolePermissionsRepository as createInMemoryRolePermissionsRepository,
} from './adapters/in_memory/repositories.js';

export {
  createImpProductRepository as createMongooseProductRepository,
  createImpOrderRepository as createMongooseOrderRepository,
  createImpCustomerRepository as createMongooseCustomerRepository,
  createImpCampaignRepository as createMongooseCampaignRepository,
  createImpDiscountRepository as createMongooseDiscountRepository,
  createImpNewsletterRepository as createMongooseNewsletterRepository,
  createImpStaffRepository as createMongooseStaffRepository,
  createImpSettingsRepository as createMongooseSettingsRepository,
  createImpReviewRepository as createMongooseReviewRepository,
  createImpPopupRepository as createMongoosePopupRepository,
  createImpHomepageRepository as createMongooseHomepageRepository,
  createImpRolePermissionsRepository as createMongooseRolePermissionsRepository,
  connectMongoose,
  disconnectMongoose,
} from './adapters/mongoose/repositories.js';

export {
  adminProducts,
  mockOrders,
  mockCustomers,
  mockCampaigns,
  mockDiscounts,
  mockSubscribers,
  mockNewsletterEmails,
  analyticsData,
  mockStaff,
  defaultStoreSettings,
  seedReviews,
  defaultPopups,
  defaultHomepageContent,
  products,
  sections,
  categories,
  getProductById,
  getProductsByCategory,
  getProductsBySection,
  getProductsBySectionAndCategory,
  getRelatedProducts,
} from './adapters/in_memory/index.js';

export { STAFF_SEED_ACCOUNTS } from './seed/staff-accounts.seed.js';
