import { useNavigate, useParams } from '@tanstack/react-router';
import { format } from 'date-fns';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { useOrderQuery } from '@/hooks/orders/use-order-query';
import { OrderDetailContent } from '@/components/orders/OrderDetailContent';
import { StatusBadge } from '@/components/staff/StatusBadge';
import { cmsTo } from '@/lib/cms-navigation';
import { useRole } from '@/contexts/role-context';
import { Button } from '@/components/ui/button';

export default function OrderDetailPage() {
  const { id } = useParams({ strict: false });
  const navigate = useNavigate();
  const { role } = useRole();
  const ordersRoute = cmsTo('orders', role);
  const { data: order, isPending, isError } = useOrderQuery(id ?? '');

  if (!id) {
    return (
      <div className="text-center py-24">
        <h2 className="font-heading text-xl mb-2">Order not found</h2>
        <p className="text-sm text-muted-foreground mb-6">Invalid order link.</p>
        <Button variant="outline" onClick={() => navigate(ordersRoute)} className="gap-2">
          <ArrowLeft size={14} />
          Back to orders
        </Button>
      </div>
    );
  }

  if (isPending) {
    return (
      <div className="flex items-center justify-center py-24 text-muted-foreground gap-2">
        <Loader2 size={20} className="animate-spin" />
        <span className="text-sm">Loading order…</span>
      </div>
    );
  }

  if (isError || !order) {
    return (
      <div className="text-center py-24">
        <h2 className="font-heading text-xl mb-2">Order not found</h2>
        <p className="text-sm text-muted-foreground mb-6">
          This order may have been removed or the link is invalid.
        </p>
        <Button variant="outline" onClick={() => navigate(ordersRoute)} className="gap-2">
          <ArrowLeft size={14} />
          Back to orders
        </Button>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="sticky top-0 z-20 -mx-6 lg:-mx-8 px-6 lg:px-8 py-4 mb-6 bg-secondary/95 backdrop-blur border-b border-border">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3 min-w-0">
            <button
              onClick={() => navigate(ordersRoute)}
              className="mt-0.5 p-2 text-muted-foreground transition-smooth hover-gold shrink-0"
            >
              <ArrowLeft size={18} />
            </button>
            <div className="min-w-0">
              <p className="text-xs font-medium letter-wider uppercase text-gold mb-1">Order</p>
              <h1 className="font-heading text-2xl lg:text-3xl truncate">{order.id}</h1>
              <p className="text-xs text-muted-foreground mt-0.5">
                {order.customerName} · {format(new Date(order.createdAt), 'MMMM d, yyyy')}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <StatusBadge status={order.status} />
            <span className="font-heading text-lg font-semibold">${order.total.toFixed(2)}</span>
          </div>
        </div>
      </div>

      <OrderDetailContent order={order} variant="page" />
    </div>
  );
}
