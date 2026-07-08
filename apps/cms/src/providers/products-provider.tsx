import { useState, type ReactNode } from 'react';
import { adminProducts as initialProducts } from '@/data/cms-mock';
import { ProductsContext, type ProductsContextValue } from '@/contexts/products-context';

export function ProductsProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState(initialProducts);

  const addProduct: ProductsContextValue['addProduct'] = (p) => setProducts((prev) => [p, ...prev]);
  const updateProduct: ProductsContextValue['updateProduct'] = (p) =>
    setProducts((prev) => prev.map((x) => (x.id === p.id ? p : x)));
  const deleteProduct: ProductsContextValue['deleteProduct'] = (id) =>
    setProducts((prev) => prev.filter((p) => p.id !== id));
  const toggleStatus: ProductsContextValue['toggleStatus'] = (id) =>
    setProducts((prev) =>
      prev.map((p) =>
        p.id === id
          ? { ...p, status: p.status === 'active' ? ('archived' as const) : ('active' as const) }
          : p,
      ),
    );
  const getProduct: ProductsContextValue['getProduct'] = (id) => products.find((p) => p.id === id);

  return (
    <ProductsContext.Provider
      value={{ products, addProduct, updateProduct, deleteProduct, toggleStatus, getProduct, setProducts }}
    >
      {children}
    </ProductsContext.Provider>
  );
}
