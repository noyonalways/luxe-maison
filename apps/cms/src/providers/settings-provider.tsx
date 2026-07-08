import { useCallback, useEffect, useState, type ReactNode } from 'react';
import { SettingsContext, type StoreSettings } from '@/contexts/settings-context';

const defaultSettings: StoreSettings = {
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

const STORAGE_KEY = 'maison-store-settings';

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<StoreSettings>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) return { ...defaultSettings, ...JSON.parse(stored) };
    } catch {
      /* ignore */
    }
    return defaultSettings;
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  }, [settings]);

  const updateSettings = useCallback((partial: Partial<StoreSettings>) => {
    setSettings((prev) => ({ ...prev, ...partial }));
  }, []);

  const resetSettings = useCallback(() => {
    setSettings(defaultSettings);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  return (
    <SettingsContext.Provider value={{ settings, updateSettings, resetSettings }}>
      {children}
    </SettingsContext.Provider>
  );
}
