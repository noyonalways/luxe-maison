import { createContext, useContext } from 'react';
import type { StoreSettings } from '@luxe-maison/shared';

export type { StoreSettings };

export interface SettingsContextValue {
  settings: StoreSettings | null;
  isLoading: boolean;
  error: string | null;
  updateSettings: (partial: Partial<StoreSettings>) => Promise<void>;
  resetSettings: () => Promise<void>;
  isSaving: boolean;
}

export const SettingsContext = createContext<SettingsContextValue | undefined>(undefined);

export function useSettings() {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error('useSettings must be used within SettingsProvider');
  return ctx;
}
