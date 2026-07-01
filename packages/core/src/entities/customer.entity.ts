export type CustomerStatus = 'active' | 'blocked';

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  totalOrders: number;
  totalSpent: number;
  status: CustomerStatus;
  joinedAt: string;
  lastOrderAt: string;
  avatar?: string;
}
