import { Loader2 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { useAnalytics } from '@/hooks/analytics/use-analytics';
import { useRole } from '@/contexts/role-context';

const COLORS = ['hsl(40, 45%, 56%)', 'hsl(0, 0%, 20%)', 'hsl(0, 0%, 50%)', 'hsl(0, 0%, 75%)'];

function formatRevenue(value: number): string {
  if (value >= 1000) return `$${(value / 1000).toFixed(1)}k`;
  return `$${value.toFixed(0)}`;
}

export default function Analytics() {
  const { hasAccess } = useRole();
  const { data, isLoading, error } = useAnalytics(hasAccess('analytics'));

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20 text-muted-foreground gap-2">
        <Loader2 size={20} className="animate-spin" />
        <span className="text-sm">Loading analytics…</span>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="py-20 text-center">
        <h1 className="font-heading text-2xl lg:text-3xl mb-3">Analytics</h1>
        <p className="text-sm text-muted-foreground">Unable to load analytics data.</p>
      </div>
    );
  }

  const {
    revenueByMonth,
    topProducts,
    salesByCategory,
    salesByRegion,
    trafficSources,
    conversionRate,
    cartAbandonmentRate,
    totalRevenue,
    totalOrders,
    avgOrderValue,
  } = data;

  const topProductMax = topProducts[0]?.revenue ?? 1;
  const regionMax = salesByRegion[0]?.revenue ?? 1;

  return (
    <div>
      <h1 className="font-heading text-2xl lg:text-3xl mb-8">Analytics</h1>

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        {[
          { label: 'Total Revenue', value: formatRevenue(totalRevenue) },
          { label: 'Total Orders', value: totalOrders },
          { label: 'Avg Order Value', value: `$${avgOrderValue.toFixed(0)}` },
          { label: 'Customer Conversion', value: `${conversionRate}%` },
          { label: 'Campaign Drop-off', value: `${cartAbandonmentRate}%` },
        ].map((stat) => (
          <div key={stat.label} className="bg-background border border-border rounded p-4">
            <p className="text-xl font-heading font-semibold">{stat.value}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="bg-background border border-border rounded p-5 mb-6">
        <h2 className="font-heading text-lg mb-4">Monthly Revenue</h2>
        <div className="h-64">
          {revenueByMonth.every((month) => month.revenue === 0) ? (
            <div className="h-full flex items-center justify-center text-sm text-muted-foreground">
              No revenue recorded in the last six months.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenueByMonth}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(0, 0%, 90%)" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} tickFormatter={(value) => `$${value / 1000}k`} />
                <Tooltip
                  contentStyle={{ border: '1px solid hsl(0,0%,90%)', borderRadius: 4, fontSize: 12 }}
                  formatter={(value: number) => [`$${value.toLocaleString()}`, 'Revenue']}
                />
                <Bar dataKey="revenue" fill="hsl(40, 45%, 56%)" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-background border border-border rounded p-5">
          <h2 className="font-heading text-lg mb-4">Sales by Category</h2>
          <div className="h-48">
            {salesByCategory.length === 0 ? (
              <div className="h-full flex items-center justify-center text-sm text-muted-foreground">
                No category sales yet.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={salesByCategory}
                    dataKey="revenue"
                    nameKey="category"
                    cx="50%"
                    cy="50%"
                    outerRadius={70}
                    label={({ category, percentage }) => `${category} ${percentage}%`}
                    labelLine={false}
                    fontSize={11}
                  >
                    {salesByCategory.map((_, index) => (
                      <Cell key={index} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: number) => `$${value.toLocaleString()}`}
                    contentStyle={{ border: '1px solid hsl(0,0%,90%)', borderRadius: 4, fontSize: 12 }}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        <div className="bg-background border border-border rounded p-5">
          <h2 className="font-heading text-lg mb-4">Hero Products</h2>
          <div className="space-y-3">
            {topProducts.length === 0 ? (
              <p className="text-sm text-muted-foreground">No product sales yet.</p>
            ) : (
              topProducts.map((product, index) => (
                <div key={product.name}>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="font-medium truncate mr-2">{product.name}</span>
                    <span className="text-muted-foreground flex-shrink-0">${product.revenue.toLocaleString()}</span>
                  </div>
                  <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-smooth"
                      style={{
                        width: `${(product.revenue / topProductMax) * 100}%`,
                        backgroundColor: COLORS[index % COLORS.length],
                      }}
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-background border border-border rounded p-5">
          <h2 className="font-heading text-lg mb-4">Sales by Region</h2>
          <div className="space-y-3">
            {salesByRegion.length === 0 ? (
              <p className="text-sm text-muted-foreground">No regional sales yet.</p>
            ) : (
              salesByRegion.map((region) => (
                <div key={region.region} className="flex items-center justify-between">
                  <div className="flex-1 mr-4">
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span>{region.region}</span>
                      <span className="text-muted-foreground">{region.orders} orders</span>
                    </div>
                    <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full"
                        style={{ width: `${(region.revenue / regionMax) * 100}%` }}
                      />
                    </div>
                  </div>
                  <span className="text-sm font-medium w-16 text-right">{formatRevenue(region.revenue)}</span>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="bg-background border border-border rounded p-5">
          <h2 className="font-heading text-lg mb-4">Campaign Performance</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left text-xs font-body font-semibold letter-wide uppercase text-muted-foreground pb-2">Campaign</th>
                  <th className="text-right text-xs font-body font-semibold letter-wide uppercase text-muted-foreground pb-2">Impressions</th>
                  <th className="text-right text-xs font-body font-semibold letter-wide uppercase text-muted-foreground pb-2">Conv.</th>
                </tr>
              </thead>
              <tbody>
                {trafficSources.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="py-6 text-center text-sm text-muted-foreground">
                      No campaign data available.
                    </td>
                  </tr>
                ) : (
                  trafficSources.map((source) => (
                    <tr key={source.source} className="border-b border-border last:border-0">
                      <td className="py-2.5">{source.source}</td>
                      <td className="py-2.5 text-right text-muted-foreground">{source.visitors.toLocaleString()}</td>
                      <td className="py-2.5 text-right font-medium">{source.conversion}%</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
