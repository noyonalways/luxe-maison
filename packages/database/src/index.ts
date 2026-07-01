export {
  initDatabase,
  disconnectDatabase,
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
} from './get-repositories.js';

export type {
  DatabaseClient,
  DatabaseAdapter,
  CreateDatabaseOptions,
} from './clients/index.js';

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
  products,
  sections,
  categories,
  getProductById,
  getProductsByCategory,
  getProductsBySection,
  getProductsBySectionAndCategory,
  getRelatedProducts,
} from './adapters/in_memory/index.js';
