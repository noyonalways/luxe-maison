import { useCallback, useMemo, type ReactNode } from 'react';
import { DiscountsContext } from '@/contexts/discounts-context';
import { useAuth } from '@/contexts/auth-context';
import { useRole } from '@/contexts/role-context';
import { useDiscountsList } from '@/hooks/discounts/use-discounts-list';
import { useCreateDiscountMutation } from '@/hooks/discounts/use-create-discount-mutation';
import { useUpdateDiscountMutation } from '@/hooks/discounts/use-update-discount-mutation';
import { useToggleDiscountStatusMutation } from '@/hooks/discounts/use-toggle-discount-status-mutation';
import { useDeleteDiscountMutation } from '@/hooks/discounts/use-delete-discount-mutation';
import { toApiError } from '@/lib/api/errors';
import type { CreateDiscountPayload, UpdateDiscountPayload } from '@/lib/api/discounts.api';

export function DiscountsProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth();
  const { hasAccess } = useRole();
  const canViewDiscounts = isAuthenticated && hasAccess('discounts');

  const { data, isLoading, error } = useDiscountsList(canViewDiscounts);
  const createMutation = useCreateDiscountMutation();
  const updateMutation = useUpdateDiscountMutation();
  const toggleMutation = useToggleDiscountStatusMutation();
  const deleteMutation = useDeleteDiscountMutation();

  const discounts = data ?? [];

  const addDiscount = useCallback(
    async (discount: CreateDiscountPayload) => createMutation.mutateAsync(discount),
    [createMutation],
  );

  const updateDiscount = useCallback(
    async (id: string, discount: UpdateDiscountPayload) =>
      updateMutation.mutateAsync({ id, discount }),
    [updateMutation],
  );

  const toggleStatus = useCallback(
    async (id: string) => toggleMutation.mutateAsync(id),
    [toggleMutation],
  );

  const deleteDiscount = useCallback(
    async (id: string) => {
      await deleteMutation.mutateAsync(id);
    },
    [deleteMutation],
  );

  const isSaving =
    createMutation.isPending ||
    updateMutation.isPending ||
    toggleMutation.isPending ||
    deleteMutation.isPending;

  const value = useMemo(
    () => ({
      discounts,
      isLoading: canViewDiscounts && isLoading,
      error: error ? toApiError(error).message : null,
      addDiscount,
      updateDiscount,
      toggleStatus,
      deleteDiscount,
      isSaving,
    }),
    [
      discounts,
      canViewDiscounts,
      isLoading,
      error,
      addDiscount,
      updateDiscount,
      toggleStatus,
      deleteDiscount,
      isSaving,
    ],
  );

  return <DiscountsContext.Provider value={value}>{children}</DiscountsContext.Provider>;
}
