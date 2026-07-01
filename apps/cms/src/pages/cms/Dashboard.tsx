import { Link } from '@tanstack/react-router';
import { mockOrders } from '@/data/cms-mock';
import { analyticsData } from '@/data/cms-mock';
import { adminProducts } from '@/data/cms-mock';
import { DollarSign, ShoppingCart, TrendingUp, Package, AlertTriangle, Users, ArrowRight } from 'lucide-react';
import { useRole } from '@/context/RoleContext';
import { useStaff } from '@/context/StaffContext';
import { cmsTo } from '@/lib/cms-navigation';
import { useStaffUrlRole } from '@/lib/use-staff-url-role';
import { StatusBadge } from '@/components/staff/StatusBadge';

export default function Dashboard() {
  const { role, canEdit, hasAccess } = useRole();
  const { members } = useStaff();
  const urlRole = useStaffUrlRole();
  const pendingOrders = mockOrders.filter(o => o.status === 'pending').length;
  const lowStockProducts = adminProducts.filter(p => p.stock < 15).length;

  // Employees see limited stats
  const showRevenue = role !== 'employee';

  const stats = showRevenue ? [
    { label: 'Revenue', value: `$${(analyticsData.totalRevenue / 1000).toFixed(1)}k`, icon: DollarSign, change: '+12.4%' },
    { label: 'Orders', value: analyticsData.totalOrders, icon: ShoppingCart, change: '+8.2%' },
    { label: 'Avg Order', value: `$${analyticsData.avgOrderValue.toFixed(0)}`, icon: TrendingUp, change: '+3.1%' },
    { label: 'Conversion', value: `${analyticsData.conversionRate}%`, icon: TrendingUp, change: '+0.5%' },
  ] : [
    { label: 'Orders', value: analyticsData.totalOrders, icon: ShoppingCart, change: '+8.2%' },
    { label: 'Pending', value: pendingOrders, icon: Package, change: '' },
  ];

  return (
    <div>
      <h1 className="font-heading text-2xl lg:text-3xl mb-8">Dashboard</h1>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map(s => (
          <div key={s.label} className="bg-background border border-border rounded p-4 lg:p-5">
            <div className="flex items-center justify-between mb-3">
              <s.icon size={16} className="text-muted-foreground" />
              <span className="text-[10px] font-medium text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
                {s.change}
              </span>
            </div>
            <p className="text-xl lg:text-2xl font-heading font-semibold">{s.value}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Alerts - only show if user has access to those sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-8">
        {pendingOrders > 0 && hasAccess('orders') && (
          <Link {...cmsTo('orders', urlRole)} className="flex items-center gap-3 bg-amber-50 border border-amber-200 rounded p-4 transition-smooth hover:border-amber-400">
            <ShoppingCart size={16} className="text-amber-600" />
            <span className="text-sm font-medium text-amber-800">{pendingOrders} pending order{pendingOrders > 1 ? 's' : ''} require attention</span>
          </Link>
        )}
        {lowStockProducts > 0 && hasAccess('products') && (
          <Link {...cmsTo('products', urlRole)} className="flex items-center gap-3 bg-red-50 border border-red-200 rounded p-4 transition-smooth hover:border-red-400">
            <AlertTriangle size={16} className="text-red-600" />
            <span className="text-sm font-medium text-red-800">{lowStockProducts} product{lowStockProducts > 1 ? 's' : ''} running low on stock</span>
          </Link>
        )}
      </div>

      {/* Team Summary - Admin only */}
      {role === 'admin' && (
        <Link {...cmsTo('team', urlRole)} className="flex items-center justify-between bg-background border border-border rounded p-5 mb-8 transition-smooth hover:border-foreground/20">
          <div className="flex items-center gap-3">
            <Users size={18} className="text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">Team Members</p>
              <p className="text-xs text-muted-foreground">
                {members.filter(m => m.role === 'manager').length} managers, {members.filter(m => m.role === 'employee').length} employees
              </p>
            </div>
          </div>
          <ArrowRight size={16} className="text-muted-foreground" />
        </Link>
      )}

      {/* Recent Orders */}
      <div className="bg-background border border-border rounded">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <h2 className="font-heading text-lg">Recent Orders</h2>
          <Link {...cmsTo('orders', urlRole)} className="text-xs text-gold underline underline-offset-2">View all</Link>
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
              {mockOrders.slice(0, 5).map(order => (
                <tr key={order.id} className="border-b border-border last:border-0">
                  <td className="px-5 py-3 font-medium">{order.id}</td>
                  <td className="px-5 py-3 text-muted-foreground">{order.customerName}</td>
                  <td className="px-5 py-3">
                    <StatusBadge status={order.status} />
                  </td>
                  <td className="px-5 py-3 text-right font-medium">${order.total.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Top Products - hide for employees */}
      {hasAccess('analytics') && (
      <div className="bg-background border border-border rounded mt-6">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <h2 className="font-heading text-lg">Top Products</h2>
          <Link {...cmsTo('analytics', urlRole)} className="text-xs text-gold underline underline-offset-2">Analytics</Link>
        </div>
        <div className="divide-y divide-border">
          {analyticsData.topProducts.map((p, i) => (
            <div key={p.name} className="flex items-center justify-between px-5 py-3">
              <div className="flex items-center gap-3">
                <span className="text-xs text-muted-foreground w-5">#{i + 1}</span>
                <div>
                  <p className="text-sm font-medium">{p.name}</p>
                  <p className="text-xs text-muted-foreground">{p.units} units sold</p>
                </div>
              </div>
              <span className="text-sm font-medium">${p.revenue.toLocaleString()}</span>
            </div>
          ))}
        </div>
      </div>
      )}
    </div>
  );
}
