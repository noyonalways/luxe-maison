import { useMemo, useState } from 'react';
import { Link, useNavigate } from '@tanstack/react-router';
import { Search, Truck, Loader2, CreditCard, ExternalLink, Eye } from 'lucide-react';
import type { Order, OrderStatus, PaymentMethod, PaymentStatus } from '@/data/cms-types';
import { StatusBadge } from '@/components/staff/StatusBadge';
import { useTableSort, useTablePagination, SortableHeader, PaginationControls } from '@/components/staff/TableControls';
import { useRole } from '@/contexts/role-context';
import { useOrders } from '@/contexts/orders-context';
import { OrderDetailContent } from '@/components/orders/OrderDetailContent';
import { cmsOrderDetail } from '@/lib/cms-navigation';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';

const statusFlow: OrderStatus[] = ['pending', 'processing', 'shipped', 'delivered'];

const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  cod: 'Cash on Delivery',
  stripe: 'Card (Stripe)',
  paypal: 'PayPal',
};

const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
  pending: 'Pending',
  pending_collection: 'Awaiting COD',
  paid: 'Paid',
  failed: 'Failed',
  refunded: 'Refunded',
};

function PaymentBadge({ method, status }: { method: PaymentMethod; status: PaymentStatus }) {
  const paid = status === 'paid';
  const pending = status === 'pending' || status === 'pending_collection';
  return (
    <div className="space-y-1">
      <span className="inline-flex items-center gap-1 text-xs font-medium">
        <CreditCard size={12} />
        {PAYMENT_METHOD_LABELS[method] ?? method}
      </span>
      <span
        className={`inline-block text-[10px] font-semibold letter-wide uppercase px-2 py-0.5 rounded ${
          paid
            ? 'bg-emerald-100 text-emerald-800'
            : pending
              ? 'bg-amber-100 text-amber-800'
              : 'bg-secondary text-muted-foreground'
        }`}
      >
        {PAYMENT_STATUS_LABELS[status] ?? status}
      </span>
    </div>
  );
}

type OrderSortKey = 'id' | 'customerName' | 'total' | 'createdAt' | 'status';

export default function Orders() {
  const navigate = useNavigate();
  const { roleSlug } = useRole();
  const { orders, isLoading } = useOrders();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);

  const selectedOrder = useMemo(
    () => orders.find((o) => o.id === selectedOrderId) ?? null,
    [orders, selectedOrderId],
  );

  const { sortField, sortDir, handleSort, sortData } = useTableSort<Record<OrderSortKey, unknown>>(
    'createdAt' as OrderSortKey,
    'desc',
  );

  const filtered = useMemo(() => {
    const result = orders.filter((o) => {
      const matchSearch =
        o.id.toLowerCase().includes(search.toLowerCase()) ||
        o.customerName.toLowerCase().includes(search.toLowerCase()) ||
        o.customerEmail.toLowerCase().includes(search.toLowerCase());
      const matchStatus = statusFilter === 'all' || o.status === statusFilter;
      return matchSearch && matchStatus;
    });
    return sortData(result as Record<OrderSortKey, unknown>[]) as Order[];
  }, [orders, search, statusFilter, sortData]);

  const pagination = useTablePagination(filtered.length, 10);
  const paginated = pagination.paginateData(filtered);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20 text-muted-foreground gap-2">
        <Loader2 size={20} className="animate-spin" />
        <span className="text-sm">Loading orders…</span>
      </div>
    );
  }

  return (
    <div className="w-full">
      <h1 className="font-heading text-2xl lg:text-3xl mb-8">Orders</h1>

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="flex-1 relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value.slice(0, 100));
              pagination.resetPage();
            }}
            placeholder="Search order ID, customer..."
            className="w-full pl-9 pr-4 py-2.5 border border-border text-sm bg-background focus:outline-none focus:border-foreground transition-smooth"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {['all', ...statusFlow, 'returned'].map((s) => (
            <button
              key={s}
              onClick={() => {
                setStatusFilter(s);
                pagination.resetPage();
              }}
              className={`px-3 py-2 text-xs font-medium letter-wide uppercase border transition-smooth ${statusFilter === s ? 'bg-foreground text-background border-foreground' : 'border-border hover:border-foreground'}`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-background border border-border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="w-[120px]">
                <SortableHeader field="id" label="Order" sortField={sortField} sortDir={sortDir} onSort={handleSort} />
              </TableHead>
              <TableHead className="min-w-[200px]">
                <SortableHeader field="customerName" label="Customer" sortField={sortField} sortDir={sortDir} onSort={handleSort} />
              </TableHead>
              <TableHead className="text-center w-[90px]">Items</TableHead>
              <TableHead className="min-w-[140px]">Payment</TableHead>
              <TableHead className="text-center w-[120px]">
                <SortableHeader field="status" label="Status" sortField={sortField} sortDir={sortDir} onSort={handleSort} className="mx-auto" />
              </TableHead>
              <TableHead className="text-center min-w-[140px]">Tracking</TableHead>
              <TableHead className="text-center w-[110px]">
                <SortableHeader field="createdAt" label="Date" sortField={sortField} sortDir={sortDir} onSort={handleSort} className="mx-auto" />
              </TableHead>
              <TableHead className="text-right w-[100px]">
                <SortableHeader field="total" label="Total" sortField={sortField} sortDir={sortDir} onSort={handleSort} className="ml-auto" />
              </TableHead>
              <TableHead className="text-right w-[90px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginated.map((order) => (
              <TableRow key={order.id}>
                <TableCell className="font-medium whitespace-nowrap">
                  <Link
                    {...cmsOrderDetail(roleSlug, order.id)}
                    className="hover:text-gold transition-smooth"
                  >
                    {order.id}
                  </Link>
                </TableCell>
                <TableCell>
                  <div className="min-w-0">
                    <p className="font-medium leading-snug">{order.customerName}</p>
                    <p className="text-xs text-muted-foreground truncate">{order.customerEmail}</p>
                  </div>
                </TableCell>
                <TableCell className="text-center text-muted-foreground whitespace-nowrap">
                  {order.items.reduce((s, i) => s + i.quantity, 0)} items
                </TableCell>
                <TableCell>
                  <PaymentBadge method={order.paymentMethod ?? 'cod'} status={order.paymentStatus ?? 'pending_collection'} />
                </TableCell>
                <TableCell className="text-center">
                  <StatusBadge status={order.status} />
                </TableCell>
                <TableCell className="text-center text-xs text-muted-foreground max-w-[160px]">
                  {order.trackingNumber ? (
                    <div className="min-w-0 mx-auto" title={`${order.carrier ? `${order.carrier} · ` : ''}${order.trackingNumber}`}>
                      <span className="inline-flex items-center gap-1 text-foreground min-w-0 max-w-full">
                        <Truck size={12} className="shrink-0 text-gold" />
                        <span className="truncate font-mono">{order.trackingNumber}</span>
                      </span>
                      {order.carrier && <span className="truncate block mt-0.5">{order.carrier}</span>}
                    </div>
                  ) : (
                    <span className="text-muted-foreground/60">—</span>
                  )}
                </TableCell>
                <TableCell className="text-center text-muted-foreground text-xs whitespace-nowrap">
                  {new Date(order.createdAt).toLocaleDateString()}
                </TableCell>
                <TableCell className="text-right font-medium whitespace-nowrap">
                  ${order.total.toFixed(2)}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end items-center gap-1">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      title="Quick view"
                      onClick={() => setSelectedOrderId(order.id)}
                    >
                      <Eye size={14} />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7" title="Full details" asChild>
                      <Link {...cmsOrderDetail(roleSlug, order.id)}>
                        <ExternalLink size={14} />
                      </Link>
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {filtered.length === 0 && (
          <div className="text-center py-10 text-sm text-muted-foreground">No orders found.</div>
        )}
      </div>

      <PaginationControls {...pagination} totalItems={filtered.length} />

      {selectedOrder && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/30"
          onClick={() => setSelectedOrderId(null)}
        >
          <div
            className="bg-background w-full max-w-2xl max-h-[85vh] overflow-y-auto m-4 shadow-elevated"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-6 py-5 border-b border-border flex items-center justify-between sticky top-0 bg-background z-10">
              <div>
                <h2 className="font-heading text-lg">{selectedOrder.id}</h2>
                <p className="text-xs text-muted-foreground">
                  {new Date(selectedOrder.createdAt).toLocaleString()}
                </p>
              </div>
              <button
                onClick={() => setSelectedOrderId(null)}
                className="text-muted-foreground transition-smooth hover-gold text-sm"
              >
                ✕
              </button>
            </div>
            <div className="px-6 py-6">
              <OrderDetailContent
                order={selectedOrder}
                variant="modal"
                onOpenFullPage={() => {
                  navigate(cmsOrderDetail(roleSlug, selectedOrder.id));
                  setSelectedOrderId(null);
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
