import { createContext, useContext } from 'react';
import type { HomepageContent } from '@luxe-maison/shared';

export type { HomepageContent };

export interface HomepageContextValue {
  content: HomepageContent | null;
  isLoading: boolean;
  error: string | null;
  updateHomepage: (partial: Partial<HomepageContent>) => Promise<void>;
  resetHomepage: () => Promise<void>;
  isSaving: boolean;
}

export const HomepageContext = createContext<HomepageContextValue | undefined>(undefined);

export function useHomepage() {
  const ctx = useContext(HomepageContext);
  if (!ctx) throw new Error('useHomepage must be used within HomepageProvider');
  return ctx;
}
