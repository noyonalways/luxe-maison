import { createContext, useContext, useState, type ReactNode } from 'react';
import { adminProducts as initialProducts } from '@/data/cms-mock';
import type { AdminProduct } from '@/data/cms-types';

interface ProductsContextType {
  products: AdminProduct[];
  addProduct: (p: AdminProduct) => void;
  updateProduct: (p: AdminProduct) => void;
  deleteProduct: (id: string) => void;
  toggleStatus: (id: string) => void;
  getProduct: (id: string) => AdminProduct | undefined;
  setProducts: React.Dispatch<React.SetStateAction<AdminProduct[]>>;
}

const ProductsContext = createContext<ProductsContextType | null>(null);

export function ProductsProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<AdminProduct[]>(initialProducts);

  const addProduct = (p: AdminProduct) => setProducts((prev) => [p, ...prev]);
  const updateProduct = (p: AdminProduct) =>
    setProducts((prev) => prev.map((x) => (x.id === p.id ? p : x)));
  const deleteProduct = (id: string) =>
    setProducts((prev) => prev.filter((p) => p.id !== id));
  const toggleStatus = (id: string) =>
    setProducts((prev) =>
      prev.map((p) =>
        p.id === id
          ? { ...p, status: p.status === 'active' ? ('archived' as const) : ('active' as const) }
          : p,
      ),
    );
  const getProduct = (id: string) => products.find((p) => p.id === id);

  return (
    <ProductsContext.Provider
      value={{
        products,
        addProduct,
        updateProduct,
        deleteProduct,
        toggleStatus,
        getProduct,
        setProducts,
      }}
    >
      {children}
    </ProductsContext.Provider>
  );
}

export function useProducts() {
  const ctx = useContext(ProductsContext);
  if (!ctx) throw new Error('useProducts must be used within ProductsProvider');
  return ctx;
}
