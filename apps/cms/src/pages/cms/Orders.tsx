import { useMemo, useState } from 'react';
import { Search, Truck, MessageSquare, Loader2 } from 'lucide-react';
import type { Order, OrderStatus } from '@/data/cms-types';
import { StatusBadge } from '@/components/staff/StatusBadge';
import { useTableSort, useTablePagination, SortableHeader, PaginationControls } from '@/components/staff/TableControls';
import { useRole } from '@/contexts/role-context';
import { useOrders } from '@/contexts/orders-context';
import { toast } from 'sonner';
import { toApiError } from '@/lib/api/errors';

const statusFlow: OrderStatus[] = ['pending', 'processing', 'shipped', 'delivered'];

type OrderSortKey = 'id' | 'customerName' | 'total' | 'createdAt' | 'status';

export default function Orders() {
  const { canEdit, canDelete } = useRole();
  const { orders, isLoading, advanceStatus, updateTracking, addNote, isSaving } = useOrders();
  const canEditOrders = canEdit('orders');
  const canDeleteOrders = canDelete('orders');

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [noteInput, setNoteInput] = useState('');
  const [trackingInput, setTrackingInput] = useState('');
  const [carrierInput, setCarrierInput] = useState('');

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

  const handleAdvanceStatus = async (order: Order) => {
    const idx = statusFlow.indexOf(order.status);
    if (idx < 0 || idx >= statusFlow.length - 1) return;
    const nextStatus = statusFlow[idx + 1]!;
    try {
      await advanceStatus(order.id, nextStatus);
      toast.success(`Order marked as ${nextStatus}`);
    } catch (err) {
      toast.error(toApiError(err).message);
    }
  };

  const handleAddNote = async (orderId: string) => {
    if (!noteInput.trim()) return;
    try {
      await addNote(orderId, noteInput.trim());
      setNoteInput('');
      toast.success('Note added');
    } catch (err) {
      toast.error(toApiError(err).message);
    }
  };

  const handleUpdateTracking = async (orderId: string) => {
    if (!trackingInput.trim()) return;
    try {
      await updateTracking(orderId, trackingInput.trim(), carrierInput.trim());
      setTrackingInput('');
      setCarrierInput('');
      toast.success('Tracking updated');
    } catch (err) {
      toast.error(toApiError(err).message);
    }
  };

  const openOrder = (order: Order) => {
    setSelectedOrderId(order.id);
    setTrackingInput(order.trackingNumber || '');
    setCarrierInput(order.carrier || '');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20 text-muted-foreground gap-2">
        <Loader2 size={20} className="animate-spin" />
        <span className="text-sm">Loading orders…</span>
      </div>
    );
  }

  return (
    <div>
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

      <div className="bg-background border border-border rounded overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left">
              <th className="px-5 py-3 text-xs font-body font-semibold letter-wide uppercase text-muted-foreground">
                <SortableHeader field="id" label="Order" sortField={sortField} sortDir={sortDir} onSort={handleSort} />
              </th>
              <th className="px-5 py-3 text-xs font-body font-semibold letter-wide uppercase text-muted-foreground">
                <SortableHeader field="customerName" label="Customer" sortField={sortField} sortDir={sortDir} onSort={handleSort} />
              </th>
              <th className="px-5 py-3 text-xs font-body font-semibold letter-wide uppercase text-muted-foreground">Items</th>
              <th className="px-5 py-3 text-xs font-body font-semibold letter-wide uppercase text-muted-foreground">
                <SortableHeader field="status" label="Status" sortField={sortField} sortDir={sortDir} onSort={handleSort} />
              </th>
              <th className="px-5 py-3 text-xs font-body font-semibold letter-wide uppercase text-muted-foreground">
                <SortableHeader field="createdAt" label="Date" sortField={sortField} sortDir={sortDir} onSort={handleSort} />
              </th>
              <th className="px-5 py-3 text-xs font-body font-semibold letter-wide uppercase text-muted-foreground text-right">
                <SortableHeader field="total" label="Total" sortField={sortField} sortDir={sortDir} onSort={handleSort} className="ml-auto" />
              </th>
            </tr>
          </thead>
          <tbody>
            {paginated.map((order) => (
              <tr
                key={order.id}
                onClick={() => openOrder(order)}
                className="border-b border-border last:border-0 hover:bg-secondary/50 transition-smooth cursor-pointer"
              >
                <td className="px-5 py-3 font-medium">{order.id}</td>
                <td className="px-5 py-3">
                  <div>
                    <p>{order.customerName}</p>
                    <p className="text-xs text-muted-foreground">{order.customerEmail}</p>
                  </div>
                </td>
                <td className="px-5 py-3 text-muted-foreground">
                  {order.items.reduce((s, i) => s + i.quantity, 0)} items
                </td>
                <td className="px-5 py-3">
                  <StatusBadge status={order.status} />
                </td>
                <td className="px-5 py-3 text-muted-foreground text-xs">
                  {new Date(order.createdAt).toLocaleDateString()}
                </td>
                <td className="px-5 py-3 text-right font-medium">${order.total.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
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
            <div className="px-6 py-5 border-b border-border flex items-center justify-between">
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
            <div className="px-6 py-6 space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-body font-semibold letter-wide uppercase text-muted-foreground mb-2">
                    Status
                  </p>
                  <StatusBadge status={selectedOrder.status} />
                </div>
                {canEditOrders && statusFlow.indexOf(selectedOrder.status) < statusFlow.length - 1 && (
                  <button
                    onClick={() => void handleAdvanceStatus(selectedOrder)}
                    disabled={isSaving}
                    className="px-4 py-2 bg-primary text-primary-foreground text-xs font-medium letter-wide uppercase transition-smooth hover:opacity-90 disabled:opacity-50"
                  >
                    Mark as {statusFlow[statusFlow.indexOf(selectedOrder.status) + 1]}
                  </button>
                )}
              </div>
              <div>
                <p className="text-xs font-body font-semibold letter-wide uppercase text-muted-foreground mb-2">
                  Customer
                </p>
                <p className="text-sm font-medium">{selectedOrder.customerName}</p>
                <p className="text-xs text-muted-foreground">
                  {selectedOrder.customerEmail} · {selectedOrder.phone}
                </p>
                <p className="text-xs text-muted-foreground mt-1">{selectedOrder.shippingAddress}</p>
              </div>
              <div>
                <p className="text-xs font-body font-semibold letter-wide uppercase text-muted-foreground mb-2">
                  Items
                </p>
                <div className="space-y-2">
                  {selectedOrder.items.map((item, i) => (
                    <div key={i} className="flex items-center gap-3 p-2 bg-secondary rounded">
                      <div className="w-10 h-12 bg-muted rounded overflow-hidden flex-shrink-0">
                        <img src={item.image} alt={item.productName} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{item.productName}</p>
                        <p className="text-xs text-muted-foreground">
                          {item.color} · {item.size} · Qty {item.quantity}
                        </p>
                      </div>
                      <span className="text-sm font-medium">
                        ${(item.price * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="mt-3 pt-3 border-t border-border space-y-1 text-sm">
                  <div className="flex justify-between text-muted-foreground">
                    <span>Subtotal</span>
                    <span>${selectedOrder.subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Shipping</span>
                    <span>${selectedOrder.shipping.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Tax</span>
                    <span>${selectedOrder.tax.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-medium pt-1 border-t border-border">
                    <span>Total</span>
                    <span>${selectedOrder.total.toFixed(2)}</span>
                  </div>
                </div>
              </div>
              {canDeleteOrders && (
                <div>
                  <p className="text-xs font-body font-semibold letter-wide uppercase text-muted-foreground mb-2 flex items-center gap-1.5">
                    <Truck size={12} /> Tracking
                  </p>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={trackingInput}
                      onChange={(e) => setTrackingInput(e.target.value.slice(0, 50))}
                      placeholder="Tracking number"
                      className="flex-1 px-3 py-2 border border-border text-sm bg-background focus:outline-none focus:border-foreground transition-smooth"
                    />
                    <input
                      type="text"
                      value={carrierInput}
                      onChange={(e) => setCarrierInput(e.target.value.slice(0, 30))}
                      placeholder="Carrier"
                      className="w-28 px-3 py-2 border border-border text-sm bg-background focus:outline-none focus:border-foreground transition-smooth"
                    />
                    <button
                      onClick={() => void handleUpdateTracking(selectedOrder.id)}
                      disabled={isSaving}
                      className="px-3 py-2 bg-foreground text-background text-xs font-medium transition-smooth hover:opacity-90 disabled:opacity-50"
                    >
                      Save
                    </button>
                  </div>
                </div>
              )}
              {canDeleteOrders && (
                <div>
                  <p className="text-xs font-body font-semibold letter-wide uppercase text-muted-foreground mb-2 flex items-center gap-1.5">
                    <MessageSquare size={12} /> Internal Notes
                  </p>
                  {selectedOrder.notes.length > 0 && (
                    <div className="space-y-2 mb-3">
                      {selectedOrder.notes.map((note, i) => (
                        <div key={i} className="px-3 py-2 bg-secondary rounded text-sm text-muted-foreground">
                          {note}
                        </div>
                      ))}
                    </div>
                  )}
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={noteInput}
                      onChange={(e) => setNoteInput(e.target.value.slice(0, 500))}
                      placeholder="Add a private note..."
                      className="flex-1 px-3 py-2 border border-border text-sm bg-background focus:outline-none focus:border-foreground transition-smooth"
                      onKeyDown={(e) => e.key === 'Enter' && void handleAddNote(selectedOrder.id)}
                    />
                    <button
                      onClick={() => void handleAddNote(selectedOrder.id)}
                      disabled={isSaving}
                      className="px-3 py-2 bg-foreground text-background text-xs font-medium transition-smooth hover:opacity-90 disabled:opacity-50"
                    >
                      Add
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
