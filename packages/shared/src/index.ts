export * from '@luxe-maison/core';
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
} from '@luxe-maison/database/in-memory';
export { cn } from './lib/utils.js';
