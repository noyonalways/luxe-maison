import type { Order, AnalyticsData, AdminProduct, Subscriber, NewsletterEmail, Discount, Campaign, Customer } from '@luxe-maison/core';
import { products } from './catalog.seed.js';

export const adminProducts: AdminProduct[] = products.map((p, i) => ({
  ...p,
  sku: `SKU-${p.id.toUpperCase()}`,
  stock: Math.floor(Math.random() * 100) + 5,
  tags: [p.category, p.fabric, p.fit, p.season],
  seoTitle: `${p.name} | Premium ${p.category === 'punjabi' ? 'Traditional' : 'Contemporary'} Menswear — MAISON`,
  seoDescription: p.description.slice(0, 155),
  status: i < 6 ? 'active' : 'draft',
  createdAt: new Date(2025, 8 + Math.floor(i / 3), 10 + i).toISOString(),
}));

export const mockOrders: Order[] = [
  {
    id: 'ORD-1001', customerName: 'Arjun Patel', customerEmail: 'arjun@example.com', phone: '+1 555-0101',
    shippingAddress: '42 Park Avenue, New York, NY 10016, USA', status: 'delivered',
    items: [
      { productId: 'pnj-001', productName: 'Royal Silk Punjabi', size: 'L', color: 'Ivory', quantity: 1, price: 189, image: products[0].images[0] },
      { productId: 'pnt-001', productName: 'Tailored Wool Trousers', size: '32', color: 'Charcoal', quantity: 1, price: 179, image: products[6].images[0] },
    ],
    subtotal: 368, shipping: 0, tax: 29.44, total: 397.44, trackingNumber: 'TRK-9876543210', carrier: 'FedEx',
    notes: ['VIP customer — expedited shipping applied.'], createdAt: '2026-02-15T10:30:00Z', updatedAt: '2026-02-19T14:20:00Z',
  },
  {
    id: 'ORD-1002', customerName: 'Sophia Chen', customerEmail: 'sophia.c@example.com', phone: '+1 555-0202',
    shippingAddress: '88 Market St, San Francisco, CA 94103, USA', status: 'shipped',
    items: [
      { productId: 'sht-001', productName: 'Riviera Linen Shirt', size: 'M', color: 'White', quantity: 2, price: 149, image: products[2].images[0] },
    ],
    subtotal: 298, shipping: 0, tax: 23.84, total: 321.84, trackingNumber: 'TRK-1234567890', carrier: 'UPS',
    notes: [], createdAt: '2026-03-01T09:15:00Z', updatedAt: '2026-03-04T11:00:00Z',
  },
  {
    id: 'ORD-1003', customerName: 'Ravi Sharma', customerEmail: 'ravi.s@example.com', phone: '+91 98765-43210',
    shippingAddress: '12 MG Road, Bangalore, KA 560001, India', status: 'processing',
    items: [
      { productId: 'tsh-001', productName: 'Pima Crew Tee', size: 'M', color: 'Black', quantity: 3, price: 69, image: products[4].images[0] },
      { productId: 'pnj-002', productName: 'Heritage Cotton Punjabi', size: 'L', color: 'White', quantity: 1, price: 129, image: products[1].images[0] },
    ],
    subtotal: 336, shipping: 12, tax: 27.84, total: 375.84, notes: ['Customer requested gift wrapping.'],
    createdAt: '2026-03-05T16:45:00Z', updatedAt: '2026-03-06T08:30:00Z',
  },
  {
    id: 'ORD-1004', customerName: 'Emma Wilson', customerEmail: 'emma.w@example.com', phone: '+44 7700-900123',
    shippingAddress: '15 Baker Street, London, W1U 3BW, UK', status: 'pending',
    items: [
      { productId: 'pnt-002', productName: 'Relaxed Linen Pants', size: '30', color: 'Sand', quantity: 1, price: 139, image: products[7].images[0] },
    ],
    subtotal: 139, shipping: 12, tax: 12.08, total: 163.08, notes: [],
    createdAt: '2026-03-07T21:00:00Z', updatedAt: '2026-03-07T21:00:00Z',
  },
  {
    id: 'ORD-1005', customerName: 'Omar Hassan', customerEmail: 'omar.h@example.com', phone: '+971 50-1234567',
    shippingAddress: 'Villa 23, Arabian Ranches, Dubai, UAE', status: 'pending',
    items: [
      { productId: 'pnj-001', productName: 'Royal Silk Punjabi', size: 'XL', color: 'Navy', quantity: 1, price: 189, image: products[0].images[0] },
      { productId: 'sht-002', productName: 'Oxford Classic Shirt', size: 'L', color: 'Light Blue', quantity: 2, price: 119, image: products[3].images[0] },
      { productId: 'tsh-002', productName: 'Merino Henley', size: 'L', color: 'Burgundy', quantity: 1, price: 89, image: products[5].images[0] },
    ],
    subtotal: 516, shipping: 0, tax: 41.28, total: 557.28, notes: ['International order — customs documentation required.'],
    createdAt: '2026-03-08T06:30:00Z', updatedAt: '2026-03-08T06:30:00Z',
  },
];

export const analyticsData: AnalyticsData = {
  totalRevenue: 48750, totalOrders: 312, avgOrderValue: 156.25, conversionRate: 3.8, cartAbandonmentRate: 68.2,
  revenueByMonth: [
    { month: 'Sep', revenue: 5200, orders: 34 }, { month: 'Oct', revenue: 7800, orders: 48 },
    { month: 'Nov', revenue: 9400, orders: 62 }, { month: 'Dec', revenue: 12100, orders: 78 },
    { month: 'Jan', revenue: 6500, orders: 42 }, { month: 'Feb', revenue: 7750, orders: 48 },
  ],
  topProducts: [
    { name: 'Royal Silk Punjabi', revenue: 8505, units: 45 }, { name: 'Pima Crew Tee', revenue: 6210, units: 90 },
    { name: 'Tailored Wool Trousers', revenue: 5370, units: 30 }, { name: 'Riviera Linen Shirt', revenue: 4470, units: 30 },
    { name: 'Heritage Cotton Punjabi', revenue: 3870, units: 30 },
  ],
  salesByCategory: [
    { category: 'Punjabi', revenue: 15600, percentage: 32 }, { category: 'Shirts', revenue: 12200, percentage: 25 },
    { category: 'T-Shirts', revenue: 10950, percentage: 22.5 }, { category: 'Pants', revenue: 10000, percentage: 20.5 },
  ],
  salesByRegion: [
    { region: 'North America', revenue: 19500, orders: 125 }, { region: 'South Asia', revenue: 12180, orders: 82 },
    { region: 'Europe', revenue: 9750, orders: 58 }, { region: 'Middle East', revenue: 7320, orders: 47 },
  ],
  trafficSources: [
    { source: 'Organic Search', visitors: 4200, conversion: 4.2 }, { source: 'Social Media', visitors: 2800, conversion: 3.1 },
    { source: 'Direct', visitors: 1500, conversion: 5.8 }, { source: 'Email', visitors: 900, conversion: 6.2 },
    { source: 'Referral', visitors: 600, conversion: 2.9 },
  ],
};

// Newsletter mock data
export const mockSubscribers: Subscriber[] = [
  { id: 'sub-1', email: 'arjun@example.com', name: 'Arjun Patel', status: 'active', subscribedAt: '2025-10-15T08:00:00Z' },
  { id: 'sub-2', email: 'sophia.c@example.com', name: 'Sophia Chen', status: 'active', subscribedAt: '2025-11-02T14:30:00Z' },
  { id: 'sub-3', email: 'ravi.s@example.com', name: 'Ravi Sharma', status: 'active', subscribedAt: '2025-11-20T09:15:00Z' },
  { id: 'sub-4', email: 'emma.w@example.com', name: 'Emma Wilson', status: 'unsubscribed', subscribedAt: '2025-12-01T16:45:00Z' },
  { id: 'sub-5', email: 'omar.h@example.com', name: 'Omar Hassan', status: 'active', subscribedAt: '2026-01-05T11:00:00Z' },
  { id: 'sub-6', email: 'priya.m@example.com', name: 'Priya Menon', status: 'active', subscribedAt: '2026-01-18T07:30:00Z' },
  { id: 'sub-7', email: 'james.k@example.com', name: 'James Kim', status: 'unsubscribed', subscribedAt: '2026-02-02T13:00:00Z' },
  { id: 'sub-8', email: 'aisha.b@example.com', name: 'Aisha Begum', status: 'active', subscribedAt: '2026-02-28T10:20:00Z' },
];

export const mockNewsletterEmails: NewsletterEmail[] = [
  { id: 'nl-1', subject: 'Welcome to MAISON — Your Style Journey Begins', body: 'Thank you for joining MAISON. Discover our curated collection of premium menswear...', audience: 'all', recipientCount: 6, openRate: 72, sentAt: '2026-01-10T09:00:00Z' },
  { id: 'nl-2', subject: 'New Arrivals: Spring Collection 2026', body: 'Explore the latest additions to our Spring lineup. Fresh fabrics, bold silhouettes...', audience: 'active', recipientCount: 5, openRate: 58, sentAt: '2026-02-15T10:00:00Z' },
  { id: 'nl-3', subject: 'Exclusive: 15% Off This Weekend Only', body: 'Use code WEEKEND15 at checkout for 15% off your entire order. Hurry — this offer expires Sunday...', audience: 'active', recipientCount: 6, openRate: 64, sentAt: '2026-03-01T08:00:00Z' },
];

// Discounts mock data
export const mockDiscounts: Discount[] = [
  { id: 'disc-1', code: 'WELCOME10', type: 'percentage', value: 10, minOrder: 50, maxUses: 500, usedCount: 142, status: 'active', expiresAt: '2026-12-31T23:59:59Z', categories: [], description: '10% off your first order', createdAt: '2025-09-01T00:00:00Z' },
  { id: 'disc-2', code: 'FLAT20', type: 'fixed', value: 20, minOrder: 100, maxUses: 200, usedCount: 87, status: 'active', expiresAt: '2026-06-30T23:59:59Z', categories: [], description: '$20 off orders over $100', createdAt: '2025-09-15T00:00:00Z' },
  { id: 'disc-3', code: 'SUMMER15', type: 'percentage', value: 15, minOrder: 150, maxUses: 300, usedCount: 63, status: 'active', expiresAt: '2026-08-31T23:59:59Z', categories: [], description: '15% off orders over $150', createdAt: '2025-10-01T00:00:00Z' },
  { id: 'disc-4', code: 'VIP25', type: 'fixed', value: 25, minOrder: 200, maxUses: 100, usedCount: 34, status: 'active', expiresAt: '2026-12-31T23:59:59Z', categories: [], description: '$25 off orders over $200', createdAt: '2025-11-01T00:00:00Z' },
  { id: 'disc-5', code: 'NEWYEAR20', type: 'percentage', value: 20, minOrder: 100, maxUses: 150, usedCount: 150, status: 'expired', expiresAt: '2026-01-15T23:59:59Z', categories: [], description: '20% off — New Year Special', createdAt: '2025-12-25T00:00:00Z' },
  { id: 'disc-6', code: 'FLASH50', type: 'fixed', value: 50, minOrder: 300, maxUses: 50, usedCount: 12, status: 'disabled', expiresAt: '2026-04-30T23:59:59Z', categories: ['punjabi'], description: '$50 off Punjabi orders over $300', createdAt: '2026-02-01T00:00:00Z' },
];

// Campaigns mock data
export const mockCampaigns: Campaign[] = [
  {
    id: 'camp-1', name: 'Spring Collection Launch', type: 'launch', status: 'active',
    description: 'Grand launch of the Spring 2026 collection featuring lightweight linen and cotton pieces.',
    startDate: '2026-03-01T00:00:00Z', endDate: '2026-03-31T23:59:59Z',
    discountCode: 'SUMMER15', targetAudience: 'All subscribers', budget: 5000, revenue: 12400,
    impressions: 45200, clicks: 3800, conversions: 156, createdAt: '2026-02-20T00:00:00Z',
  },
  {
    id: 'camp-2', name: 'Eid Flash Sale', type: 'flash', status: 'scheduled',
    description: 'Limited-time flash sale on premium Punjabi collection for Eid celebrations.',
    startDate: '2026-03-28T00:00:00Z', endDate: '2026-04-02T23:59:59Z',
    discountCode: 'FLAT20', targetAudience: 'South Asia & Middle East', budget: 3000, revenue: 0,
    impressions: 0, clicks: 0, conversions: 0, createdAt: '2026-03-05T00:00:00Z',
  },
  {
    id: 'camp-3', name: 'Summer Clearance', type: 'sale', status: 'scheduled',
    description: 'End-of-season clearance with deep discounts on winter inventory.',
    startDate: '2026-06-01T00:00:00Z', endDate: '2026-06-30T23:59:59Z',
    targetAudience: 'All customers', budget: 2500, revenue: 0,
    impressions: 0, clicks: 0, conversions: 0, createdAt: '2026-03-01T00:00:00Z',
  },
  {
    id: 'camp-4', name: 'Holiday Gift Guide', type: 'seasonal', status: 'ended',
    description: 'Curated gift sets and holiday specials with free gift wrapping.',
    startDate: '2025-12-01T00:00:00Z', endDate: '2025-12-31T23:59:59Z',
    discountCode: 'NEWYEAR20', targetAudience: 'All subscribers', budget: 4000, revenue: 18600,
    impressions: 62000, clicks: 5400, conversions: 234, createdAt: '2025-11-15T00:00:00Z',
  },
  {
    id: 'camp-5', name: 'VIP Early Access', type: 'launch', status: 'ended',
    description: 'Exclusive early access to new arrivals for VIP members.',
    startDate: '2026-01-15T00:00:00Z', endDate: '2026-02-15T23:59:59Z',
    discountCode: 'VIP25', targetAudience: 'VIP members', budget: 1500, revenue: 8900,
    impressions: 12000, clicks: 1800, conversions: 89, createdAt: '2026-01-10T00:00:00Z',
  },
];

// Customers mock data
export const mockCustomers: Customer[] = [
  { id: 'cust-1', name: 'Arjun Patel', email: 'arjun@example.com', phone: '+1 555-0101', address: '42 Park Avenue, New York, NY 10016, USA', totalOrders: 8, totalSpent: 2340, status: 'active', joinedAt: '2025-08-15T00:00:00Z', lastOrderAt: '2026-02-15T10:30:00Z' },
  { id: 'cust-2', name: 'Sophia Chen', email: 'sophia.c@example.com', phone: '+1 555-0202', address: '88 Market St, San Francisco, CA 94103, USA', totalOrders: 5, totalSpent: 1580, status: 'active', joinedAt: '2025-09-20T00:00:00Z', lastOrderAt: '2026-03-01T09:15:00Z' },
  { id: 'cust-3', name: 'Ravi Sharma', email: 'ravi.s@example.com', phone: '+91 98765-43210', address: '12 MG Road, Bangalore, KA 560001, India', totalOrders: 12, totalSpent: 3720, status: 'active', joinedAt: '2025-07-10T00:00:00Z', lastOrderAt: '2026-03-05T16:45:00Z' },
  { id: 'cust-4', name: 'Emma Wilson', email: 'emma.w@example.com', phone: '+44 7700-900123', address: '15 Baker Street, London, W1U 3BW, UK', totalOrders: 3, totalSpent: 620, status: 'active', joinedAt: '2025-11-01T00:00:00Z', lastOrderAt: '2026-03-07T21:00:00Z' },
  { id: 'cust-5', name: 'Omar Hassan', email: 'omar.h@example.com', phone: '+971 50-1234567', address: 'Villa 23, Arabian Ranches, Dubai, UAE', totalOrders: 6, totalSpent: 2890, status: 'active', joinedAt: '2025-10-05T00:00:00Z', lastOrderAt: '2026-03-08T06:30:00Z' },
  { id: 'cust-6', name: 'Priya Menon', email: 'priya.m@example.com', phone: '+91 99887-65432', address: '78 Linking Road, Mumbai, MH 400050, India', totalOrders: 15, totalSpent: 4510, status: 'active', joinedAt: '2025-06-20T00:00:00Z', lastOrderAt: '2026-02-28T10:20:00Z' },
  { id: 'cust-7', name: 'James Kim', email: 'james.k@example.com', phone: '+82 10-9876-5432', address: '456 Gangnam-daero, Seoul, South Korea', totalOrders: 2, totalSpent: 380, status: 'blocked', joinedAt: '2025-12-01T00:00:00Z', lastOrderAt: '2026-01-15T14:00:00Z' },
  { id: 'cust-8', name: 'Aisha Begum', email: 'aisha.b@example.com', phone: '+880 1700-000000', address: '90 Gulshan Avenue, Dhaka 1212, Bangladesh', totalOrders: 7, totalSpent: 1940, status: 'active', joinedAt: '2025-09-10T00:00:00Z', lastOrderAt: '2026-02-20T08:00:00Z' },
  { id: 'cust-9', name: 'Lucas Torres', email: 'lucas.t@example.com', phone: '+55 11-99999-0000', address: 'Av. Paulista 1578, São Paulo, SP 01310-200, Brazil', totalOrders: 4, totalSpent: 950, status: 'active', joinedAt: '2025-11-15T00:00:00Z', lastOrderAt: '2026-02-10T12:30:00Z' },
  { id: 'cust-10', name: 'Fatima Al-Rashid', email: 'fatima.r@example.com', phone: '+966 50-1112233', address: 'Al Olaya District, Riyadh, Saudi Arabia', totalOrders: 1, totalSpent: 189, status: 'blocked', joinedAt: '2026-01-20T00:00:00Z', lastOrderAt: '2026-01-20T09:00:00Z' },
];
