import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

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

interface SettingsContextType {
  settings: StoreSettings;
  updateSettings: (partial: Partial<StoreSettings>) => void;
  resetSettings: () => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

const STORAGE_KEY = 'maison-store-settings';

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<StoreSettings>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) return { ...defaultSettings, ...JSON.parse(stored) };
    } catch {}
    return defaultSettings;
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  }, [settings]);

  const updateSettings = useCallback((partial: Partial<StoreSettings>) => {
    setSettings(prev => ({ ...prev, ...partial }));
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

export function useSettings() {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error('useSettings must be used within SettingsProvider');
  return ctx;
}
