import type { Customer, Order } from '@luxe-maison/shared';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import {
  Calendar,
  DollarSign,
  Mail,
  MapPin,
  Package,
  Phone,
  ShoppingCart,
  Truck,
} from 'lucide-react';

const ORDER_STATUS_COLORS: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  processing: 'bg-blue-100 text-blue-800',
  shipped: 'bg-purple-100 text-purple-800',
  delivered: 'bg-green-100 text-green-800',
  returned: 'bg-red-100 text-red-800',
};

interface CustomerDetailContentProps {
  customer: Customer;
  orders: Order[];
}

export function CustomerDetailContent({ customer, orders }: CustomerDetailContentProps) {
  const customerOrders = orders.filter(
    (o) => o.customerEmail.toLowerCase() === customer.email.toLowerCase(),
  );
  const avgOrderValue =
    customer.totalOrders > 0 ? Math.round(customer.totalSpent / customer.totalOrders) : 0;

  const stats = [
    { icon: ShoppingCart, label: 'Total Orders', value: String(customer.totalOrders) },
    { icon: DollarSign, label: 'Total Spent', value: `$${customer.totalSpent.toLocaleString()}` },
    { icon: DollarSign, label: 'Avg. Order', value: `$${avgOrderValue.toLocaleString()}` },
    { icon: Calendar, label: 'Joined', value: format(new Date(customer.joinedAt), 'MMM d, yyyy') },
    { icon: Calendar, label: 'Last Order', value: format(new Date(customer.lastOrderAt), 'MMM d, yyyy') },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center gap-3">
        <Badge
          variant={customer.status === 'active' ? 'default' : 'destructive'}
          className="text-[10px]"
        >
          {customer.status}
        </Badge>
        <p className="text-sm text-muted-foreground flex items-center gap-1.5">
          <Mail size={13} />
          {customer.email}
        </p>
        <p className="text-xs text-muted-foreground font-mono">ID: {customer.id}</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        {stats.map((s) => (
          <div key={s.label} className="border border-border rounded-lg p-3 bg-background">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <s.icon size={12} />
              <span className="text-[10px] uppercase tracking-wider">{s.label}</span>
            </div>
            <p className="text-sm font-semibold">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="rounded-lg border border-border bg-secondary/20 p-4 space-y-3">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Contact & address
        </p>
        <div className="grid gap-2 text-sm sm:grid-cols-2">
          <p className="flex items-center gap-2">
            <Phone size={14} className="text-muted-foreground shrink-0" />
            {customer.phone}
          </p>
          <p className="flex items-start gap-2 sm:col-span-2">
            <MapPin size={14} className="text-muted-foreground shrink-0 mt-0.5" />
            <span className="text-muted-foreground">{customer.address}</span>
          </p>
        </div>
      </div>

      <div className="space-y-3">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Order history ({customerOrders.length})
        </p>
        {customerOrders.length === 0 ? (
          <p className="text-sm text-muted-foreground py-6 text-center border border-dashed border-border rounded-lg">
            No orders found for this customer.
          </p>
        ) : (
          <div className="space-y-4">
            {customerOrders.map((order) => (
              <div key={order.id} className="border border-border rounded-lg p-4 space-y-3 bg-background">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Package size={14} className="text-muted-foreground" />
                    <span className="text-sm font-semibold">{order.id}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                        ORDER_STATUS_COLORS[order.status] ?? ''
                      }`}
                    >
                      {order.status}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {format(new Date(order.createdAt), 'MMM d, yyyy')}
                    </span>
                  </div>
                </div>
                <div className="space-y-2">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-3">
                      <img
                        src={item.image}
                        alt={item.productName}
                        className="w-10 h-10 rounded object-cover bg-secondary"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{item.productName}</p>
                        <p className="text-[11px] text-muted-foreground">
                          {item.size} · {item.color} · Qty {item.quantity}
                        </p>
                      </div>
                      <p className="text-sm font-medium">
                        ${(item.price * item.quantity).toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>
                <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-border">
                  <div className="text-xs text-muted-foreground">
                    {order.trackingNumber && (
                      <span className="flex items-center gap-1">
                        <Truck size={11} />
                        {order.carrier} · {order.trackingNumber}
                      </span>
                    )}
                  </div>
                  <p className="text-sm font-semibold">${order.total.toLocaleString()}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
