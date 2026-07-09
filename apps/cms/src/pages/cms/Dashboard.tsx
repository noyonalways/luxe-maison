import { Link } from '@tanstack/react-router';
import { DollarSign, ShoppingCart, TrendingUp, Package, AlertTriangle, Users, ArrowRight, Loader2 } from 'lucide-react';
import { useRole } from '@/contexts/role-context';
import { useStaff } from '@/contexts/staff-context';
import { useOrders } from '@/contexts/orders-context';
import { useProducts } from '@/contexts/products-context';
import { useAnalytics } from '@/hooks/analytics/use-analytics';
import { cmsTo } from '@/lib/cms-navigation';
import { StatusBadge } from '@/components/staff/StatusBadge';

function formatChange(value: number | null | undefined): string {
  if (value === null || value === undefined) return '—';
  const prefix = value > 0 ? '+' : '';
  return `${prefix}${value.toFixed(1)}%`;
}

function formatRevenue(value: number): string {
  if (value >= 1000) return `$${(value / 1000).toFixed(1)}k`;
  return `$${value.toFixed(0)}`;
}

export default function Dashboard() {
  const { roleSlug, role, hasAccess } = useRole();
  const { members } = useStaff();
  const { orders, isLoading: ordersLoading } = useOrders();
  const { products, isLoading: productsLoading } = useProducts();
  const canViewAnalytics = hasAccess('analytics');
  const { data: analytics, isLoading: analyticsLoading, error: analyticsError } = useAnalytics(canViewAnalytics);

  const pendingOrders = orders.filter((order) => order.status === 'pending').length;
  const lowStockProducts = products.filter((product) => product.stock < 15).length;
  const recentOrders = [...orders]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  const showRevenue = role !== 'employee';
  const isLoading = ordersLoading || productsLoading || (canViewAnalytics && analyticsLoading);

  const stats = showRevenue && analytics
    ? [
        {
          label: 'Revenue',
          value: formatRevenue(analytics.totalRevenue),
          icon: DollarSign,
          change: formatChange(analytics.periodChanges.revenue),
        },
        {
          label: 'Orders',
          value: analytics.totalOrders,
          icon: ShoppingCart,
          change: formatChange(analytics.periodChanges.orders),
        },
        {
          label: 'Avg Order',
          value: `$${analytics.avgOrderValue.toFixed(0)}`,
          icon: TrendingUp,
          change: formatChange(analytics.periodChanges.avgOrder),
        },
        {
          label: 'Conversion',
          value: `${analytics.conversionRate}%`,
          icon: TrendingUp,
          change: formatChange(analytics.periodChanges.conversion),
        },
      ]
    : [
        {
          label: 'Orders',
          value: orders.length,
          icon: ShoppingCart,
          change: formatChange(analytics?.periodChanges.orders),
        },
        {
          label: 'Pending',
          value: pendingOrders,
          icon: Package,
          change: '',
        },
      ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20 text-muted-foreground gap-2">
        <Loader2 size={20} className="animate-spin" />
        <span className="text-sm">Loading dashboard…</span>
      </div>
    );
  }

  return (
    <div className="w-full">
      <h1 className="font-heading text-2xl lg:text-3xl mb-8">Dashboard</h1>

      {analyticsError && canViewAnalytics && (
        <div className="mb-6 px-4 py-3 border border-amber-200 bg-amber-50 text-sm text-amber-800 rounded">
          Analytics summary could not be loaded. Order and product alerts still reflect live data.
        </div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-background border border-border rounded p-4 lg:p-5">
            <div className="flex items-center justify-between mb-3">
              <stat.icon size={16} className="text-muted-foreground" />
              {stat.change ? (
                <span className="text-[10px] font-medium text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
                  {stat.change}
                </span>
              ) : null}
            </div>
            <p className="text-xl lg:text-2xl font-heading font-semibold">{stat.value}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-8">
        {pendingOrders > 0 && hasAccess('orders') && (
          <Link {...cmsTo('orders', roleSlug)} className="flex items-center gap-3 bg-amber-50 border border-amber-200 rounded p-4 transition-smooth hover:border-amber-400">
            <ShoppingCart size={16} className="text-amber-600" />
            <span className="text-sm font-medium text-amber-800">
              {pendingOrders} pending order{pendingOrders > 1 ? 's' : ''} require attention
            </span>
          </Link>
        )}
        {lowStockProducts > 0 && hasAccess('products') && (
          <Link {...cmsTo('products', roleSlug)} className="flex items-center gap-3 bg-red-50 border border-red-200 rounded p-4 transition-smooth hover:border-red-400">
            <AlertTriangle size={16} className="text-red-600" />
            <span className="text-sm font-medium text-red-800">
              {lowStockProducts} product{lowStockProducts > 1 ? 's' : ''} running low on stock
            </span>
          </Link>
        )}
      </div>

      {role === 'admin' && (
        <Link {...cmsTo('team', roleSlug)} className="flex items-center justify-between bg-background border border-border rounded p-5 mb-8 transition-smooth hover:border-foreground/20">
          <div className="flex items-center gap-3">
            <Users size={18} className="text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">Team Members</p>
              <p className="text-xs text-muted-foreground">
                {members.filter((member) => member.role === 'manager').length} managers,{' '}
                {members.filter((member) => member.role === 'employee').length} employees
              </p>
            </div>
          </div>
          <ArrowRight size={16} className="text-muted-foreground" />
        </Link>
      )}

      <div className="bg-background border border-border rounded">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <h2 className="font-heading text-lg">Recent Orders</h2>
          <Link {...cmsTo('orders', roleSlug)} className="text-xs text-gold underline underline-offset-2">View all</Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left">
                <th className="px-5 py-3 text-xs font-body font-semibold letter-wide uppercase text-muted-foreground">Order</th>
                <th className="px-5 py-3 text-xs font-body font-semibold letter-wide uppercase text-muted-foreground">Customer</th>
                <th className="px-5 py-3 text-xs font-body font-semibold letter-wide uppercase text-muted-foreground">Status</th>
                <th className="px-5 py-3 text-xs font-body font-semibold letter-wide uppercase text-muted-foreground text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-5 py-8 text-center text-sm text-muted-foreground">
                    No orders yet.
                  </td>
                </tr>
              ) : (
                recentOrders.map((order) => (
                  <tr key={order.id} className="border-b border-border last:border-0">
                    <td className="px-5 py-3 font-medium">{order.id}</td>
                    <td className="px-5 py-3 text-muted-foreground">{order.customerName}</td>
                    <td className="px-5 py-3">
                      <StatusBadge status={order.status} />
                    </td>
                    <td className="px-5 py-3 text-right font-medium">${order.total.toFixed(2)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {canViewAnalytics && analytics && (
        <div className="bg-background border border-border rounded mt-6">
          <div className="flex items-center justify-between px-5 py-4 border-b border-border">
            <h2 className="font-heading text-lg">Top Products</h2>
            <Link {...cmsTo('analytics', roleSlug)} className="text-xs text-gold underline underline-offset-2">Analytics</Link>
          </div>
          <div className="divide-y divide-border">
            {analytics.topProducts.length === 0 ? (
              <div className="px-5 py-8 text-sm text-muted-foreground text-center">No product sales yet.</div>
            ) : (
              analytics.topProducts.map((product, index) => (
                <div key={product.name} className="flex items-center justify-between px-5 py-3">
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-muted-foreground w-5">#{index + 1}</span>
                    <div>
                      <p className="text-sm font-medium">{product.name}</p>
                      <p className="text-xs text-muted-foreground">{product.units} units sold</p>
                    </div>
                  </div>
                  <span className="text-sm font-medium">${product.revenue.toLocaleString()}</span>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
