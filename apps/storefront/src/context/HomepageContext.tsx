'use client';

import { createContext, useContext, type ReactNode } from 'react';
import { useQuery } from '@tanstack/react-query';
import type { HomepageContent } from '@luxe-maison/shared';
import { homepageApi } from '@/lib/api/homepage.api';
import { homepageKeys } from '@/hooks/homepage/homepage-keys';

interface HomepageContextType {
  content: HomepageContent | null;
  isLoading: boolean;
  error: string | null;
}

const HomepageContext = createContext<HomepageContextType | null>(null);

export function HomepageProvider({ children }: { children: ReactNode }) {
  const { data, isLoading, error } = useQuery({
    queryKey: homepageKeys.content(),
    queryFn: () => homepageApi.get(),
    staleTime: 60_000,
  });

  return (
    <HomepageContext.Provider
      value={{
        content: data ?? null,
        isLoading,
        error: error instanceof Error ? error.message : null,
      }}
    >
      {children}
    </HomepageContext.Provider>
  );
}

export function useHomepage() {
  const ctx = useContext(HomepageContext);
  if (!ctx) throw new Error('useHomepage must be used within HomepageProvider');
  return ctx;
}
