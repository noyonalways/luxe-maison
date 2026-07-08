export interface StoreSettings {
  storeName: string;
  contactEmail: string;
  currency: string;
  language: string;
  maintenanceMode: boolean;
  orderNotifications: boolean;
  stockAlerts: boolean;
  newsletterAutoReply: boolean;
  lowStockThreshold: number;
  timezone: string;
}

export const DEFAULT_STORE_SETTINGS: StoreSettings = {
  storeName: 'MAISON',
  contactEmail: 'hello@luxemaison.com',
  currency: 'USD',
  language: 'en',
  maintenanceMode: false,
  orderNotifications: true,
  stockAlerts: true,
  newsletterAutoReply: false,
  lowStockThreshold: 15,
  timezone: 'America/New_York',
};
