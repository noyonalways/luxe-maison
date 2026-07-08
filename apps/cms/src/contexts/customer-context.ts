import { createContext, useContext } from 'react';
import type { Customer } from '@/data/cms-types';
import { mockOrders } from '@/data/cms-mock';

export interface CustomerProfile extends Customer {}

export interface CustomerContextValue {
  profile: CustomerProfile;
  orders: typeof mockOrders;
  updateProfile: (updates: Partial<Pick<CustomerProfile, 'name' | 'phone' | 'address'>>) => void;
}

export const CustomerContext = createContext<CustomerContextValue | null>(null);

export function useCustomer() {
  const ctx = useContext(CustomerContext);
  if (!ctx) throw new Error('useCustomer must be used within CustomerProvider');
  return ctx;
}
