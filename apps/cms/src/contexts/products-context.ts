import { createContext, useContext } from 'react';
import type { AdminProduct } from '@/data/cms-types';

export interface ProductsContextValue {
  products: AdminProduct[];
  isLoading: boolean;
  error: string | null;
  addProduct: (product: AdminProduct) => Promise<AdminProduct>;
  updateProduct: (product: AdminProduct) => Promise<AdminProduct>;
  deleteProduct: (id: string) => Promise<void>;
  toggleStatus: (id: string) => Promise<AdminProduct>;
  getProduct: (id: string) => AdminProduct | undefined;
  isSaving: boolean;
}

export const ProductsContext = createContext<ProductsContextValue | null>(null);

export function useProducts() {
  const ctx = useContext(ProductsContext);
  if (!ctx) throw new Error('useProducts must be used within ProductsProvider');
  return ctx;
}
