import { createContext, useContext } from 'react';
import type { Customer } from '@/data/cms-types';
import type { CreateCustomerPayload, UpdateCustomerPayload } from '@/lib/api/customers.api';

export interface CustomersContextValue {
  customers: Customer[];
  isLoading: boolean;
  isSaving: boolean;
  error: string | null;
  addCustomer: (payload: CreateCustomerPayload) => Promise<Customer>;
  updateCustomer: (id: string, payload: UpdateCustomerPayload) => Promise<Customer>;
  setCustomerStatus: (id: string, status: Customer['status']) => Promise<Customer>;
  deleteCustomer: (id: string) => Promise<void>;
}

export const CustomersContext = createContext<CustomersContextValue | null>(null);

export function useCustomers() {
  const ctx = useContext(CustomersContext);
  if (!ctx) throw new Error('useCustomers must be used within CustomersProvider');
  return ctx;
}
