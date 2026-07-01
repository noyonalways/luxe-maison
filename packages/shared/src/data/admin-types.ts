import type { Product } from './products';

export interface AdminProduct extends Product {
  sku: string;
  stock: number;
  tags: string[];
  seoTitle: string;
  seoDescription: string;
  status: 'active' | 'draft' | 'archived';
  createdAt: string;
}

export type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'returned';

export interface OrderItem {
  productId: string;
  productName: string;
  size: string;
  color: string;
  quantity: number;
  price: number;
  image: string;
}

export interface Order {
  id: string;
  customerName: string;
  customerEmail: string;
  phone: string;
  shippingAddress: string;
  status: OrderStatus;
  items: OrderItem[];
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
  trackingNumber?: string;
  carrier?: string;
  notes: string[];
  createdAt: string;
  updatedAt: string;
}

export interface AnalyticsData {
  totalRevenue: number;
  totalOrders: number;
  avgOrderValue: number;
  conversionRate: number;
  cartAbandonmentRate: number;
  revenueByMonth: { month: string; revenue: number; orders: number }[];
  topProducts: { name: string; revenue: number; units: number }[];
  salesByCategory: { category: string; revenue: number; percentage: number }[];
  salesByRegion: { region: string; revenue: number; orders: number }[];
  trafficSources: { source: string; visitors: number; conversion: number }[];
}

// Newsletter
export interface Subscriber {
  id: string;
  email: string;
  name: string;
  status: 'active' | 'unsubscribed';
  subscribedAt: string;
}

export interface NewsletterEmail {
  id: string;
  subject: string;
  body: string;
  audience: 'all' | 'active';
  recipientCount: number;
  openRate: number;
  sentAt: string;
}

// Discounts
export interface Discount {
  id: string;
  code: string;
  type: 'percentage' | 'fixed';
  value: number;
  minOrder: number;
  maxUses: number;
  usedCount: number;
  status: 'active' | 'expired' | 'disabled';
  expiresAt: string;
  categories: string[];
  description: string;
  createdAt: string;
}

// Customers
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

// Campaigns
export type CampaignType = 'sale' | 'seasonal' | 'flash' | 'launch';
export type CampaignStatus = 'scheduled' | 'active' | 'ended';

export interface Campaign {
  id: string;
  name: string;
  type: CampaignType;
  status: CampaignStatus;
  description: string;
  startDate: string;
  endDate: string;
  discountCode?: string;
  targetAudience: string;
  budget: number;
  revenue: number;
  impressions: number;
  clicks: number;
  conversions: number;
  createdAt: string;
}
