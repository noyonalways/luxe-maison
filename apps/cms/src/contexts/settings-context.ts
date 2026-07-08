import { createContext, useContext } from 'react';

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

export interface SettingsContextValue {
  settings: StoreSettings;
  updateSettings: (partial: Partial<StoreSettings>) => void;
  resetSettings: () => void;
}

export const SettingsContext = createContext<SettingsContextValue | undefined>(undefined);

export function useSettings() {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error('useSettings must be used within SettingsProvider');
  return ctx;
}
