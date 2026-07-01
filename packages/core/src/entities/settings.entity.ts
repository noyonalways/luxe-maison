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
