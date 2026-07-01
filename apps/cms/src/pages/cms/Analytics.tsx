import { analyticsData } from '@/data/cms-mock';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const COLORS = ['hsl(40, 45%, 56%)', 'hsl(0, 0%, 20%)', 'hsl(0, 0%, 50%)', 'hsl(0, 0%, 75%)'];

export default function Analytics() {
  const { revenueByMonth, topProducts, salesByCategory, salesByRegion, trafficSources, conversionRate, cartAbandonmentRate, totalRevenue, totalOrders, avgOrderValue } = analyticsData;

  return (
    <div>
      <h1 className="font-heading text-2xl lg:text-3xl mb-8">Analytics</h1>

      {/* KPI Row */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        {[
          { label: 'Total Revenue', value: `$${(totalRevenue / 1000).toFixed(1)}k` },
          { label: 'Total Orders', value: totalOrders },
          { label: 'Avg Order Value', value: `$${avgOrderValue.toFixed(0)}` },
          { label: 'Conversion Rate', value: `${conversionRate}%` },
          { label: 'Cart Abandonment', value: `${cartAbandonmentRate}%` },
        ].map(s => (
          <div key={s.label} className="bg-background border border-border rounded p-4">
            <p className="text-xl font-heading font-semibold">{s.value}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Revenue Chart */}
      <div className="bg-background border border-border rounded p-5 mb-6">
        <h2 className="font-heading text-lg mb-4">Monthly Revenue</h2>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={revenueByMonth}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(0, 0%, 90%)" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} tickFormatter={v => `$${v / 1000}k`} />
              <Tooltip
                contentStyle={{ border: '1px solid hsl(0,0%,90%)', borderRadius: 4, fontSize: 12 }}
                formatter={(value: number) => [`$${value.toLocaleString()}`, 'Revenue']}
              />
              <Bar dataKey="revenue" fill="hsl(40, 45%, 56%)" radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Sales by Category */}
        <div className="bg-background border border-border rounded p-5">
          <h2 className="font-heading text-lg mb-4">Sales by Category</h2>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={salesByCategory} dataKey="revenue" nameKey="category" cx="50%" cy="50%" outerRadius={70} label={({ category, percentage }) => `${category} ${percentage}%`} labelLine={false} fontSize={11}>
                  {salesByCategory.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => `$${value.toLocaleString()}`} contentStyle={{ border: '1px solid hsl(0,0%,90%)', borderRadius: 4, fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Products */}
        <div className="bg-background border border-border rounded p-5">
          <h2 className="font-heading text-lg mb-4">Hero Products</h2>
          <div className="space-y-3">
            {topProducts.map((p, i) => {
              const maxRevenue = topProducts[0].revenue;
              return (
                <div key={p.name}>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="font-medium truncate mr-2">{p.name}</span>
                    <span className="text-muted-foreground flex-shrink-0">${p.revenue.toLocaleString()}</span>
                  </div>
                  <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-smooth"
                      style={{ width: `${(p.revenue / maxRevenue) * 100}%`, backgroundColor: COLORS[i % COLORS.length] }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales by Region */}
        <div className="bg-background border border-border rounded p-5">
          <h2 className="font-heading text-lg mb-4">Sales by Region</h2>
          <div className="space-y-3">
            {salesByRegion.map(r => {
              const maxRev = salesByRegion[0].revenue;
              return (
                <div key={r.region} className="flex items-center justify-between">
                  <div className="flex-1 mr-4">
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span>{r.region}</span>
                      <span className="text-muted-foreground">{r.orders} orders</span>
                    </div>
                    <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                      <div className="h-full bg-primary rounded-full" style={{ width: `${(r.revenue / maxRev) * 100}%` }} />
                    </div>
                  </div>
                  <span className="text-sm font-medium w-16 text-right">${(r.revenue / 1000).toFixed(1)}k</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Traffic Sources */}
        <div className="bg-background border border-border rounded p-5">
          <h2 className="font-heading text-lg mb-4">Traffic Sources</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left text-xs font-body font-semibold letter-wide uppercase text-muted-foreground pb-2">Source</th>
                  <th className="text-right text-xs font-body font-semibold letter-wide uppercase text-muted-foreground pb-2">Visitors</th>
                  <th className="text-right text-xs font-body font-semibold letter-wide uppercase text-muted-foreground pb-2">Conv.</th>
                </tr>
              </thead>
              <tbody>
                {trafficSources.map(t => (
                  <tr key={t.source} className="border-b border-border last:border-0">
                    <td className="py-2.5">{t.source}</td>
                    <td className="py-2.5 text-right text-muted-foreground">{t.visitors.toLocaleString()}</td>
                    <td className="py-2.5 text-right font-medium">{t.conversion}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
