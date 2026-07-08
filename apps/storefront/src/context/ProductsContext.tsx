import type { Product, ProductSection } from '@luxe-maison/shared';
import { createContext, useCallback, useContext, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { productsApi } from '@/lib/api/products.api';
import { productKeys } from '@/hooks/products/product-keys';
import { categories, sections } from '@/data/products';

export type { Product };

interface ProductsContextValue {
  products: Product[];
  isLoading: boolean;
  error: string | null;
  getProductById: (id: string) => Product | undefined;
  getProductsByCategory: (category: Product['category']) => Product[];
  getProductsBySection: (section: ProductSection) => Product[];
  getProductsBySectionAndCategory: (
    section: ProductSection,
    category: Product['category'],
  ) => Product[];
  getRelatedProducts: (productId: string, limit?: number) => Product[];
  sections: typeof sections;
  categories: typeof categories;
}

const ProductsContext = createContext<ProductsContextValue | null>(null);

export function ProductsProvider({ children }: { children: React.ReactNode }) {
  const { data, isLoading, error } = useQuery({
    queryKey: productKeys.list(),
    queryFn: () => productsApi.list(),
    staleTime: 60_000,
  });

  const products = data ?? [];

  const getProductById = useCallback(
    (id: string) => products.find((product) => product.id === id),
    [products],
  );

  const getProductsByCategory = useCallback(
    (category: Product['category']) => products.filter((product) => product.category === category),
    [products],
  );

  const getProductsBySection = useCallback(
    (section: ProductSection) => products.filter((product) => product.section === section),
    [products],
  );

  const getProductsBySectionAndCategory = useCallback(
    (section: ProductSection, category: Product['category']) =>
      products.filter((product) => product.section === section && product.category === category),
    [products],
  );

  const getRelatedProducts = useCallback(
    (productId: string, limit = 4) => {
      const product = products.find((item) => item.id === productId);
      if (!product) return [];
      return products
        .filter(
          (item) =>
            item.id !== productId &&
            (item.category === product.category || item.section === product.section),
        )
        .slice(0, limit);
    },
    [products],
  );

  const value = useMemo(
    () => ({
      products,
      isLoading,
      error: error instanceof Error ? error.message : null,
      getProductById,
      getProductsByCategory,
      getProductsBySection,
      getProductsBySectionAndCategory,
      getRelatedProducts,
      sections,
      categories,
    }),
    [
      products,
      isLoading,
      error,
      getProductById,
      getProductsByCategory,
      getProductsBySection,
      getProductsBySectionAndCategory,
      getRelatedProducts,
    ],
  );

  return <ProductsContext.Provider value={value}>{children}</ProductsContext.Provider>;
}

export function useProducts() {
  const ctx = useContext(ProductsContext);
  if (!ctx) throw new Error('useProducts must be used within ProductsProvider');
  return ctx;
}
