export interface AnalyticsPeriodChanges {
  revenue: number | null;
  orders: number | null;
  avgOrder: number | null;
  conversion: number | null;
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
  periodChanges: AnalyticsPeriodChanges;
}
