import { createContext, useContext } from 'react';
import type { Discount } from '@/data/cms-types';
import type { CreateDiscountPayload, UpdateDiscountPayload } from '@/lib/api/discounts.api';

export interface DiscountsContextValue {
  discounts: Discount[];
  isLoading: boolean;
  isSaving: boolean;
  error: string | null;
  addDiscount: (discount: CreateDiscountPayload) => Promise<Discount>;
  updateDiscount: (id: string, discount: UpdateDiscountPayload) => Promise<Discount>;
  toggleStatus: (id: string) => Promise<Discount>;
  deleteDiscount: (id: string) => Promise<void>;
}

export const DiscountsContext = createContext<DiscountsContextValue | null>(null);

export function useDiscounts() {
  const ctx = useContext(DiscountsContext);
  if (!ctx) throw new Error('useDiscounts must be used within DiscountsProvider');
  return ctx;
}
