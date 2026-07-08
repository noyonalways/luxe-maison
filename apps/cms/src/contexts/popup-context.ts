import { createContext, useContext } from 'react';
import type { CreatePopupPayload, UpdatePopupPayload } from '@/lib/api/popups.api';

export type PopupType = 'welcome' | 'discount' | 'campaign';
export type PopupTrigger = 'page_load' | 'exit_intent' | 'scroll_50' | 'delay_10s';

export interface PopupConfig {
  id: string;
  type: PopupType;
  enabled: boolean;
  title: string;
  message: string;
  discountCode: string;
  ctaText: string;
  ctaLink: string;
  trigger: PopupTrigger;
  priority: number;
}

export interface PopupContextValue {
  popups: PopupConfig[];
  isLoading: boolean;
  isSaving: boolean;
  error: string | null;
  addPopup: (popup: CreatePopupPayload) => Promise<PopupConfig>;
  updatePopup: (id: string, partial: UpdatePopupPayload) => Promise<PopupConfig>;
  setPopupEnabled: (id: string, enabled: boolean) => Promise<PopupConfig>;
  deletePopup: (id: string) => Promise<void>;
  getActivePopups: () => PopupConfig[];
}

export const PopupContext = createContext<PopupContextValue | null>(null);

export function usePopup() {
  const ctx = useContext(PopupContext);
  if (!ctx) throw new Error('usePopup must be used within PopupProvider');
  return ctx;
}
