import type { AnalyticsData, AnalyticsPeriodChanges } from '../entities/analytics.entity.js';
import type { Campaign } from '../entities/campaign.entity.js';
import type { Customer } from '../entities/customer.entity.js';
import type { AdminProduct } from '../entities/product.entity.js';
import type { Order } from '../entities/order.entity.js';
import type { CampaignRepository } from '../repositories/campaign.repository.js';
import type { CustomerRepository } from '../repositories/customer.repository.js';
import type { OrderRepository } from '../repositories/order.repository.js';
import type { ProductRepository } from '../repositories/product.repository.js';

const MONTH_LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const CATEGORY_LABELS: Record<string, string> = {
  punjabi: 'Punjabi',
  shirt: 'Shirts',
  tshirt: 'T-Shirts',
  pants: 'Pants',
};

const COUNTRY_REGION: Record<string, string> = {
  usa: 'North America',
  'united states': 'North America',
  canada: 'North America',
  uk: 'Europe',
  'united kingdom': 'Europe',
  france: 'Europe',
  germany: 'Europe',
  india: 'South Asia',
  uae: 'Middle East',
  'united arab emirates': 'Middle East',
  dubai: 'Middle East',
  australia: 'Oceania',
};

function roundMoney(value: number): number {
  return Math.round(value * 100) / 100;
}

function roundPercent(value: number): number {
  return Math.round(value * 10) / 10;
}

function isCountableOrder(order: Order): boolean {
  return order.status !== 'returned' && order.paymentStatus !== 'failed';
}

function parseCountry(shippingAddress: string): string {
  const parts = shippingAddress.split(',').map((part) => part.trim()).filter(Boolean);
  return parts[parts.length - 1] ?? 'Unknown';
}

function countryToRegion(country: string): string {
  const normalized = country.toLowerCase();
  return COUNTRY_REGION[normalized] ?? country;
}

function percentChange(current: number, previous: number): number | null {
  if (previous === 0) {
    return current > 0 ? 100 : null;
  }
  return roundPercent(((current - previous) / previous) * 100);
}

function filterOrdersByRange(orders: Order[], start: Date, end: Date): Order[] {
  return orders.filter((order) => {
    const created = new Date(order.createdAt);
    return created >= start && created < end;
  });
}

function summarizeOrders(orders: Order[]) {
  const countable = orders.filter(isCountableOrder);
  const totalRevenue = roundMoney(countable.reduce((sum, order) => sum + order.total, 0));
  const totalOrders = countable.length;
  const avgOrderValue = totalOrders > 0 ? roundMoney(totalRevenue / totalOrders) : 0;
  return { totalRevenue, totalOrders, avgOrderValue, countable };
}

function buyerRateInPeriod(
  orders: Order[],
  customers: Customer[],
  start: Date,
  end: Date,
): number {
  const periodOrders = filterOrdersByRange(orders, start, end).filter(isCountableOrder);
  const buyerEmails = new Set(periodOrders.map((order) => order.customerEmail.toLowerCase()));
  const eligibleCustomers = customers.filter((customer) => new Date(customer.joinedAt) <= end).length;
  if (eligibleCustomers === 0) return 0;
  return roundPercent((buyerEmails.size / eligibleCustomers) * 100);
}

function buildPeriodChanges(allOrders: Order[], customers: Customer[]): AnalyticsPeriodChanges {
  const now = new Date();
  const currentStart = new Date(now);
  currentStart.setDate(currentStart.getDate() - 30);
  const previousStart = new Date(now);
  previousStart.setDate(previousStart.getDate() - 60);

  const current = summarizeOrders(filterOrdersByRange(allOrders, currentStart, now));
  const previous = summarizeOrders(filterOrdersByRange(allOrders, previousStart, currentStart));
  const currentBuyerRate = buyerRateInPeriod(allOrders, customers, currentStart, now);
  const previousBuyerRate = buyerRateInPeriod(allOrders, customers, previousStart, currentStart);

  return {
    revenue: percentChange(current.totalRevenue, previous.totalRevenue),
    orders: percentChange(current.totalOrders, previous.totalOrders),
    avgOrder: percentChange(current.avgOrderValue, previous.avgOrderValue),
    conversion: percentChange(currentBuyerRate, previousBuyerRate),
  };
}

function buildRevenueByMonth(orders: Order[]) {
  const buckets = new Map<string, { month: string; revenue: number; orders: number; sortKey: string }>();

  for (let offset = 5; offset >= 0; offset -= 1) {
    const date = new Date();
    date.setDate(1);
    date.setMonth(date.getMonth() - offset);
    const key = `${date.getFullYear()}-${date.getMonth()}`;
    buckets.set(key, {
      month: MONTH_LABELS[date.getMonth()]!,
      revenue: 0,
      orders: 0,
      sortKey: key,
    });
  }

  for (const order of orders.filter(isCountableOrder)) {
    const created = new Date(order.createdAt);
    const key = `${created.getFullYear()}-${created.getMonth()}`;
    const bucket = buckets.get(key);
    if (!bucket) continue;
    bucket.revenue = roundMoney(bucket.revenue + order.total);
    bucket.orders += 1;
  }

  return [...buckets.values()]
    .sort((a, b) => a.sortKey.localeCompare(b.sortKey))
    .map(({ month, revenue, orders: orderCount }) => ({ month, revenue, orders: orderCount }));
}

function buildTopProducts(orders: Order[]) {
  const map = new Map<string, { name: string; revenue: number; units: number }>();

  for (const order of orders.filter(isCountableOrder)) {
    for (const item of order.items) {
      const existing = map.get(item.productId) ?? {
        name: item.productName,
        revenue: 0,
        units: 0,
      };
      existing.revenue = roundMoney(existing.revenue + item.price * item.quantity);
      existing.units += item.quantity;
      map.set(item.productId, existing);
    }
  }

  return [...map.values()].sort((a, b) => b.revenue - a.revenue).slice(0, 5);
}

function buildSalesByCategory(orders: Order[], products: AdminProduct[]) {
  const categoryByProduct = new Map(products.map((product) => [product.id, product.category]));
  const totals = new Map<string, number>();

  for (const order of orders.filter(isCountableOrder)) {
    for (const item of order.items) {
      const category = categoryByProduct.get(item.productId) ?? 'other';
      const label = CATEGORY_LABELS[category] ?? category;
      totals.set(label, roundMoney((totals.get(label) ?? 0) + item.price * item.quantity));
    }
  }

  const revenueTotal = [...totals.values()].reduce((sum, value) => sum + value, 0);
  if (revenueTotal === 0) return [];

  return [...totals.entries()]
    .map(([category, revenue]) => ({
      category,
      revenue,
      percentage: roundPercent((revenue / revenueTotal) * 100),
    }))
    .sort((a, b) => b.revenue - a.revenue);
}

function buildSalesByRegion(orders: Order[]) {
  const totals = new Map<string, { revenue: number; orders: number }>();

  for (const order of orders.filter(isCountableOrder)) {
    const region = countryToRegion(parseCountry(order.shippingAddress));
    const existing = totals.get(region) ?? { revenue: 0, orders: 0 };
    existing.revenue = roundMoney(existing.revenue + order.total);
    existing.orders += 1;
    totals.set(region, existing);
  }

  return [...totals.entries()]
    .map(([region, stats]) => ({ region, revenue: stats.revenue, orders: stats.orders }))
    .sort((a, b) => b.revenue - a.revenue);
}

function buildTrafficSources(campaigns: Campaign[]) {
  return campaigns
    .filter((campaign) => campaign.impressions > 0)
    .map((campaign) => ({
      source: campaign.name,
      visitors: campaign.impressions,
      conversion:
        campaign.impressions > 0
          ? roundPercent((campaign.conversions / campaign.impressions) * 100)
          : 0,
    }))
    .sort((a, b) => b.visitors - a.visitors)
    .slice(0, 6);
}

function buildConversionRate(customers: Customer[]): number {
  if (customers.length === 0) return 0;
  const buyers = customers.filter((customer) => customer.totalOrders > 0).length;
  return roundPercent((buyers / customers.length) * 100);
}

function buildCartAbandonmentRate(campaigns: Campaign[]): number {
  const clicks = campaigns.reduce((sum, campaign) => sum + campaign.clicks, 0);
  const conversions = campaigns.reduce((sum, campaign) => sum + campaign.conversions, 0);
  if (clicks === 0) return 0;
  return roundPercent(((clicks - conversions) / clicks) * 100);
}

export function computeAnalytics(
  orders: Order[],
  products: AdminProduct[],
  customers: Customer[],
  campaigns: Campaign[],
): AnalyticsData {
  const { totalRevenue, totalOrders, avgOrderValue } = summarizeOrders(orders);

  return {
    totalRevenue,
    totalOrders,
    avgOrderValue,
    conversionRate: buildConversionRate(customers),
    cartAbandonmentRate: buildCartAbandonmentRate(campaigns),
    revenueByMonth: buildRevenueByMonth(orders),
    topProducts: buildTopProducts(orders),
    salesByCategory: buildSalesByCategory(orders, products),
    salesByRegion: buildSalesByRegion(orders),
    trafficSources: buildTrafficSources(campaigns),
    periodChanges: buildPeriodChanges(orders, customers),
  };
}

export function createAnalyticsService({
  orderRepository,
  productRepository,
  customerRepository,
  campaignRepository,
}: {
  orderRepository: OrderRepository;
  productRepository: ProductRepository;
  customerRepository: CustomerRepository;
  campaignRepository: CampaignRepository;
}) {
  return {
    async getAnalytics(): Promise<AnalyticsData> {
      const [orders, products, customers, campaigns] = await Promise.all([
        orderRepository.findAll(),
        productRepository.findAll(),
        customerRepository.findAll(),
        campaignRepository.findAll(),
      ]);

      return computeAnalytics(orders, products, customers, campaigns);
    },
  };
}

export type AnalyticsService = ReturnType<typeof createAnalyticsService>;
