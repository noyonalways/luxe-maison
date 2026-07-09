/** MongoDB collection names (snake_case) — canonical required collections. */
export const COLLECTIONS = {
  products: 'products',
  orders: 'orders',
  customers: 'customers',
  campaigns: 'campaigns',
  discounts: 'discounts',
  reviews: 'reviews',
  subscribers: 'subscribers',
  newsletter_emails: 'newsletter_emails',
  staff_members: 'staff_members',
  store_settings: 'store_settings',
  homepage_contents: 'homepage_contents',
  popup_configs: 'popup_configs',
  content_pages: 'content_pages',
  cms_roles: 'cms_roles',
} as const;

/** All collections the application uses. */
export const REQUIRED_COLLECTIONS = Object.freeze(
  Object.values(COLLECTIONS),
) as readonly string[];

/**
 * Legacy collection names from old Mongoose defaults or superseded schemas.
 * Dropped on connect so only REQUIRED_COLLECTIONS remain in use.
 */
export const LEGACY_COLLECTIONS = [
  'popupconfigs',
  'staffmembers',
  'storesettings',
  'homepagecontents',
  'rolepermissions',
  'role_permissions',
  'contentpages',
  'cmsroles',
  'newsletteremails',
] as const;

/** Mongoose model names (PascalCase with underscores). */
export const MODEL_NAMES = {
  Product: 'Product',
  Order: 'Order',
  Customer: 'Customer',
  Campaign: 'Campaign',
  Discount: 'Discount',
  Review: 'Review',
  Subscriber: 'Subscriber',
  Newsletter_Email: 'Newsletter_Email',
  Staff_Member: 'Staff_Member',
  Store_Settings: 'Store_Settings',
  Homepage_Content: 'Homepage_Content',
  Popup_Config: 'Popup_Config',
  Content_Page: 'Content_Page',
  Cms_Role: 'Cms_Role',
} as const;
