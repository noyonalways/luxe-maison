import { format } from 'date-fns';
import { ArrowRight } from 'lucide-react';
import type { Order } from '@luxe-maison/shared';
import OrderStatusBadge from '@/components/account/OrderStatusBadge';
import { formatCurrency } from '@/components/account/account-utils';

type OrderCardProps = {
  order: Order;
  onSelect: (order: Order) => void;
};

export default function OrderCard({ order, onSelect }: OrderCardProps) {
  const itemCount = order.items.reduce((sum, item) => sum + item.quantity, 0);
  const previewItems = order.items.slice(0, 4);

  return (
    <button
      type="button"
      onClick={() => onSelect(order)}
      className="w-full text-left border border-border bg-background p-5 lg:p-6 transition-smooth hover:border-foreground group"
    >
      <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-3 mb-2">
            <span className="text-sm font-medium tracking-wide">{order.id}</span>
            <OrderStatusBadge status={order.status} />
          </div>
          <p className="text-xs text-muted-foreground">
            {format(new Date(order.createdAt), 'MMMM d, yyyy')}
            <span className="mx-2">·</span>
            {itemCount} {itemCount === 1 ? 'item' : 'items'}
          </p>
        </div>

        <div className="flex items-center gap-4 sm:flex-col sm:items-end sm:gap-2">
          <span className="font-heading text-xl">{formatCurrency(order.total)}</span>
          <span className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground transition-smooth group-hover:text-gold">
            View details <ArrowRight size={14} />
          </span>
        </div>
      </div>

      {previewItems.length > 0 && (
        <div className="mt-5 pt-5 border-t border-border flex gap-2 overflow-x-auto">
          {previewItems.map((item, index) => (
            <div
              key={`${item.productId}-${item.size}-${index}`}
              className="relative flex-shrink-0 w-14 h-[4.5rem] bg-secondary overflow-hidden"
            >
              <img src={item.image} alt={item.productName} className="w-full h-full object-cover" />
              {item.quantity > 1 && (
                <span className="absolute bottom-1 right-1 min-w-[1.1rem] h-[1.1rem] px-1 flex items-center justify-center bg-foreground text-background text-[9px] font-semibold">
                  {item.quantity}
                </span>
              )}
            </div>
          ))}
          {order.items.length > 4 && (
            <div className="flex-shrink-0 w-14 h-[4.5rem] bg-secondary flex items-center justify-center text-xs text-muted-foreground">
              +{order.items.length - 4}
            </div>
          )}
        </div>
      )}
    </button>
  );
}
