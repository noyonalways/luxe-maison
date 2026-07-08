import { createContext, useContext } from 'react';
import type { AdminProduct } from '@/data/cms-types';

export interface ProductsContextValue {
  products: AdminProduct[];
  addProduct: (p: AdminProduct) => void;
  updateProduct: (p: AdminProduct) => void;
  deleteProduct: (id: string) => void;
  toggleStatus: (id: string) => void;
  getProduct: (id: string) => AdminProduct | undefined;
  setProducts: React.Dispatch<React.SetStateAction<AdminProduct[]>>;
}

export const ProductsContext = createContext<ProductsContextValue | null>(null);

export function useProducts() {
  const ctx = useContext(ProductsContext);
  if (!ctx) throw new Error('useProducts must be used within ProductsProvider');
  return ctx;
}
