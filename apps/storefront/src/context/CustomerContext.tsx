"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { useAuth } from '@/context/AuthContext';
import { ordersApi } from '@/lib/api/orders.api';
import type { Order } from '@luxe-maison/shared';

interface CustomerProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  avatar?: string;
}

interface CustomerContextType {
  profile: CustomerProfile;
  orders: Order[];
  isLoadingOrders: boolean;
  updateProfile: (updates: Partial<Pick<CustomerProfile, 'name' | 'phone' | 'address' | 'avatar'>>) => void;
  refreshOrders: () => Promise<void>;
}

const CustomerContext = createContext<CustomerContextType | null>(null);

export function CustomerProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [profile, setProfile] = useState<CustomerProfile>({
    id: user?.id ?? '',
    name: user?.name ?? '',
    email: user?.email ?? '',
    phone: '',
    address: '',
    avatar: user?.avatar,
  });
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(true);

  useEffect(() => {
    if (!user) return;
    setProfile((prev) => ({
      ...prev,
      id: user.id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
    }));
  }, [user]);

  const refreshOrders = async () => {
    if (!user) {
      setOrders([]);
      setIsLoadingOrders(false);
      return;
    }

    setIsLoadingOrders(true);
    try {
      const list = await ordersApi.mine();
      setOrders(
        [...list].sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        ),
      );
    } catch {
      setOrders([]);
    } finally {
      setIsLoadingOrders(false);
    }
  };

  useEffect(() => {
    void refreshOrders();
  }, [user?.id]);

  const updateProfile = (
    updates: Partial<Pick<CustomerProfile, 'name' | 'phone' | 'address' | 'avatar'>>,
  ) => {
    setProfile((prev) => ({ ...prev, ...updates }));
  };

  return (
    <CustomerContext.Provider
      value={{ profile, orders, isLoadingOrders, updateProfile, refreshOrders }}
    >
      {children}
    </CustomerContext.Provider>
  );
}

export function useCustomer() {
  const ctx = useContext(CustomerContext);
  if (!ctx) throw new Error('useCustomer must be used within CustomerProvider');
  return ctx;
}
