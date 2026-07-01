import { createContext, useContext, useState, ReactNode } from 'react';
import { mockCustomers, mockOrders } from '@/data/admin-mock';
import type { Customer } from '@/data/admin-types';

interface CustomerProfile extends Customer {
  // editable fields
}

interface CustomerContextType {
  profile: CustomerProfile;
  orders: typeof mockOrders;
  updateProfile: (updates: Partial<Pick<CustomerProfile, 'name' | 'phone' | 'address'>>) => void;
}

const CustomerContext = createContext<CustomerContextType | null>(null);

export function CustomerProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<CustomerProfile>({ ...mockCustomers[0] });

  const orders = mockOrders
    .filter(o => o.customerEmail === profile.email)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const updateProfile = (updates: Partial<Pick<CustomerProfile, 'name' | 'phone' | 'address'>>) => {
    setProfile(prev => ({ ...prev, ...updates }));
  };

  return (
    <CustomerContext.Provider value={{ profile, orders, updateProfile }}>
      {children}
    </CustomerContext.Provider>
  );
}

export function useCustomer() {
  const ctx = useContext(CustomerContext);
  if (!ctx) throw new Error('useCustomer must be used within CustomerProvider');
  return ctx;
}
