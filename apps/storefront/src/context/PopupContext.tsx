'use client';

import { createContext, useContext, useCallback, type ReactNode } from 'react';
import { useQuery } from '@tanstack/react-query';

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

interface PopupContextType {
  popups: PopupConfig[];
  isLoading: boolean;
  getActivePopups: () => PopupConfig[];
}

const PopupContext = createContext<PopupContextType | null>(null);

async function fetchActivePopups(): Promise<PopupConfig[]> {
  const response = await fetch('/api/popups/active');
  if (!response.ok) {
    throw new Error('Failed to load popups');
  }
  return response.json() as Promise<PopupConfig[]>;
}

export function PopupProvider({ children }: { children: ReactNode }) {
  const { data = [], isLoading } = useQuery({
    queryKey: ['popups', 'active'],
    queryFn: fetchActivePopups,
    staleTime: 60_000,
  });

  const getActivePopups = useCallback(() => data, [data]);

  return (
    <PopupContext.Provider value={{ popups: data, isLoading, getActivePopups }}>
      {children}
    </PopupContext.Provider>
  );
}

export function usePopup() {
  const ctx = useContext(PopupContext);
  if (!ctx) throw new Error('usePopup must be used within PopupProvider');
  return ctx;
}
