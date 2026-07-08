import { useCallback, useMemo, type ReactNode } from 'react';
import { ProductsContext } from '@/contexts/products-context';
import { useAuth } from '@/contexts/auth-context';
import { useProductsList } from '@/hooks/products/use-products-list';
import { useCreateProductMutation } from '@/hooks/products/use-create-product-mutation';
import { useUpdateProductMutation } from '@/hooks/products/use-update-product-mutation';
import { useDeleteProductMutation } from '@/hooks/products/use-delete-product-mutation';
import { useToggleProductStatusMutation } from '@/hooks/products/use-toggle-product-status-mutation';
import { toApiError } from '@/lib/api/errors';
import type { AdminProduct } from '@/data/cms-types';

export function ProductsProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth();
  const { data, isLoading, error } = useProductsList(isAuthenticated);
  const createMutation = useCreateProductMutation();
  const updateMutation = useUpdateProductMutation();
  const deleteMutation = useDeleteProductMutation();
  const toggleMutation = useToggleProductStatusMutation();

  const products = data ?? [];

  const getProduct = useCallback(
    (id: string) => products.find((p) => p.id === id),
    [products],
  );

  const addProduct = useCallback(
    async (product: AdminProduct) => {
      return createMutation.mutateAsync(product);
    },
    [createMutation],
  );

  const updateProduct = useCallback(
    async (product: AdminProduct) => {
      const { id, ...updates } = product;
      return updateMutation.mutateAsync({ id, product: updates });
    },
    [updateMutation],
  );

  const deleteProduct = useCallback(
    async (id: string) => {
      await deleteMutation.mutateAsync(id);
    },
    [deleteMutation],
  );

  const toggleStatus = useCallback(
    async (id: string) => {
      return toggleMutation.mutateAsync(id);
    },
    [toggleMutation],
  );

  const isSaving =
    createMutation.isPending ||
    updateMutation.isPending ||
    deleteMutation.isPending ||
    toggleMutation.isPending;

  const value = useMemo(
    () => ({
      products,
      isLoading: isAuthenticated && isLoading,
      error: error ? toApiError(error).message : null,
      addProduct,
      updateProduct,
      deleteProduct,
      toggleStatus,
      getProduct,
      isSaving,
    }),
    [
      products,
      isAuthenticated,
      isLoading,
      error,
      addProduct,
      updateProduct,
      deleteProduct,
      toggleStatus,
      getProduct,
      isSaving,
    ],
  );

  return <ProductsContext.Provider value={value}>{children}</ProductsContext.Provider>;
}
