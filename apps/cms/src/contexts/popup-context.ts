import { createContext, useContext } from 'react';

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
  addPopup: (popup: PopupConfig) => void;
  updatePopup: (id: string, partial: Partial<PopupConfig>) => void;
  deletePopup: (id: string) => void;
  getActivePopups: () => PopupConfig[];
}

export const PopupContext = createContext<PopupContextValue | null>(null);

export function usePopup() {
  const ctx = useContext(PopupContext);
  if (!ctx) throw new Error('usePopup must be used within PopupProvider');
  return ctx;
}
