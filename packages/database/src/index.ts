export {
  initDatabase,
  disconnectDatabase,
  getProductRepository,
  getOrderRepository,
  getCustomerRepository,
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
} from './adapters/in_memory/repositories.js';

export {
  createImpProductRepository as createMongooseProductRepository,
  createImpOrderRepository as createMongooseOrderRepository,
  createImpCustomerRepository as createMongooseCustomerRepository,
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
  products,
  sections,
  categories,
  getProductById,
  getProductsByCategory,
  getProductsBySection,
  getProductsBySectionAndCategory,
  getRelatedProducts,
} from './adapters/in_memory/index.js';
