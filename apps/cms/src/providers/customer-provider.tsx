import { useState, type ReactNode } from 'react';
import { mockCustomers, mockOrders } from '@/data/cms-mock';
import { CustomerContext, type CustomerProfile } from '@/contexts/customer-context';

export function CustomerProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<CustomerProfile>({ ...mockCustomers[0]! });

  const orders = mockOrders
    .filter((o) => o.customerEmail === profile.email)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const updateProfile = (updates: Partial<Pick<CustomerProfile, 'name' | 'phone' | 'address'>>) => {
    setProfile((prev) => ({ ...prev, ...updates }));
  };

  return (
    <CustomerContext.Provider value={{ profile, orders, updateProfile }}>
      {children}
    </CustomerContext.Provider>
  );
}
