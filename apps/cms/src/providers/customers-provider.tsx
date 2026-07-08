import { useCallback, useMemo, type ReactNode } from 'react';
import { CustomersContext } from '@/contexts/customers-context';
import { useAuth } from '@/contexts/auth-context';
import { useRole } from '@/contexts/role-context';
import { useCustomersList } from '@/hooks/customers/use-customers-list';
import { useCreateCustomerMutation } from '@/hooks/customers/use-create-customer-mutation';
import { useUpdateCustomerMutation } from '@/hooks/customers/use-update-customer-mutation';
import { useSetCustomerStatusMutation } from '@/hooks/customers/use-set-customer-status-mutation';
import { useDeleteCustomerMutation } from '@/hooks/customers/use-delete-customer-mutation';
import { toApiError } from '@/lib/api/errors';
import type { CreateCustomerPayload, UpdateCustomerPayload } from '@/lib/api/customers.api';
import type { Customer } from '@/data/cms-types';

export function CustomersProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth();
  const { hasAccess } = useRole();
  const canViewCustomers = isAuthenticated && hasAccess('customers');

  const { data, isLoading, error } = useCustomersList(canViewCustomers);
  const createMutation = useCreateCustomerMutation();
  const updateMutation = useUpdateCustomerMutation();
  const setStatusMutation = useSetCustomerStatusMutation();
  const deleteMutation = useDeleteCustomerMutation();

  const customers = data ?? [];

  const addCustomer = useCallback(
    async (payload: CreateCustomerPayload) => createMutation.mutateAsync(payload),
    [createMutation],
  );

  const updateCustomer = useCallback(
    async (id: string, payload: UpdateCustomerPayload) =>
      updateMutation.mutateAsync({ id, payload }),
    [updateMutation],
  );

  const setCustomerStatus = useCallback(
    async (id: string, status: Customer['status']) =>
      setStatusMutation.mutateAsync({ id, status }),
    [setStatusMutation],
  );

  const deleteCustomer = useCallback(
    async (id: string) => {
      await deleteMutation.mutateAsync(id);
    },
    [deleteMutation],
  );

  const isSaving =
    createMutation.isPending ||
    updateMutation.isPending ||
    setStatusMutation.isPending ||
    deleteMutation.isPending;

  const value = useMemo(
    () => ({
      customers,
      isLoading: canViewCustomers && isLoading,
      error: error ? toApiError(error).message : null,
      addCustomer,
      updateCustomer,
      setCustomerStatus,
      deleteCustomer,
      isSaving,
    }),
    [
      customers,
      canViewCustomers,
      isLoading,
      error,
      addCustomer,
      updateCustomer,
      setCustomerStatus,
      deleteCustomer,
      isSaving,
    ],
  );

  return <CustomersContext.Provider value={value}>{children}</CustomersContext.Provider>;
}
