import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { ExternalLink, MessageSquare, Package, Truck } from 'lucide-react';
import type { Order, OrderStatus, PaymentMethod, PaymentStatus } from '@/data/cms-types';
import { StatusBadge } from '@/components/staff/StatusBadge';
import { useRole } from '@/contexts/role-context';
import { useOrders } from '@/contexts/orders-context';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { toApiError } from '@/lib/api/errors';

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

const CARRIER_OPTIONS = ['FedEx', 'UPS', 'DHL', 'USPS', 'Aramex', 'Local Courier'];

const STOREFRONT_URL = import.meta.env.VITE_STOREFRONT_URL || 'http://localhost:3000';

function PaymentBadge({ method, status }: { method: PaymentMethod; status: PaymentStatus }) {
  const paid = status === 'paid';
  const pending = status === 'pending' || status === 'pending_collection';
  return (
    <div className="space-y-1">
      <span className="inline-flex items-center gap-1 text-xs font-medium">
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

interface OrderDetailContentProps {
  order: Order;
  variant?: 'modal' | 'page';
  onOpenFullPage?: () => void;
}

export function OrderDetailContent({
  order,
  variant = 'modal',
  onOpenFullPage,
}: OrderDetailContentProps) {
  const { canEdit, canDelete } = useRole();
  const canEditOrders = canEdit('orders');
  const canDeleteOrders = canDelete('orders');
  const { advanceStatus, updateTracking, addNote, isSaving } = useOrders();

  const [noteInput, setNoteInput] = useState('');
  const [trackingInput, setTrackingInput] = useState('');
  const [carrierInput, setCarrierInput] = useState('');

  useEffect(() => {
    setTrackingInput(order.trackingNumber || '');
    setCarrierInput(order.carrier || '');
    setNoteInput('');
  }, [order.id, order.trackingNumber, order.carrier]);

  const trackOrderUrl = `${STOREFRONT_URL}/track-order?orderId=${encodeURIComponent(order.id)}&email=${encodeURIComponent(order.customerEmail)}`;

  const handleAdvanceStatus = async () => {
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

  const handleAddNote = async () => {
    if (!noteInput.trim()) return;
    try {
      await addNote(order.id, noteInput.trim());
      setNoteInput('');
      toast.success('Note added');
    } catch (err) {
      toast.error(toApiError(err).message);
    }
  };

  const handleUpdateTracking = async () => {
    if (!trackingInput.trim()) return;
    try {
      await updateTracking(order.id, trackingInput.trim(), carrierInput.trim());
      if (canEditOrders && (order.status === 'pending' || order.status === 'processing')) {
        await advanceStatus(order.id, 'shipped');
      }
      toast.success('Tracking updated');
    } catch (err) {
      toast.error(toApiError(err).message);
    }
  };

  return (
    <div className={variant === 'page' ? 'space-y-8' : 'space-y-6'}>
      {variant === 'modal' && onOpenFullPage && (
        <div className="flex justify-end">
          <Button variant="outline" size="sm" className="gap-2" onClick={onOpenFullPage}>
            <ExternalLink size={14} />
            Full details
          </Button>
        </div>
      )}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-body font-semibold letter-wide uppercase text-muted-foreground mb-2">
            Status
          </p>
          <StatusBadge status={order.status} />
        </div>
        <div>
          <p className="text-xs font-body font-semibold letter-wide uppercase text-muted-foreground mb-2">
            Payment
          </p>
          <PaymentBadge
            method={order.paymentMethod ?? 'cod'}
            status={order.paymentStatus ?? 'pending_collection'}
          />
        </div>
        {canEditOrders && statusFlow.indexOf(order.status) < statusFlow.length - 1 && (
          <button
            onClick={() => void handleAdvanceStatus()}
            disabled={isSaving}
            className="px-4 py-2 bg-primary text-primary-foreground text-xs font-medium letter-wide uppercase transition-smooth hover:opacity-90 disabled:opacity-50 sm:self-end"
          >
            Mark as {statusFlow[statusFlow.indexOf(order.status) + 1]}
          </button>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div>
          <p className="text-xs font-body font-semibold letter-wide uppercase text-muted-foreground mb-2">
            Customer
          </p>
          <p className="text-sm font-medium">{order.customerName}</p>
          <p className="text-xs text-muted-foreground">
            {order.customerEmail} · {order.phone}
          </p>
          <p className="text-xs text-muted-foreground mt-1">{order.shippingAddress}</p>
        </div>
        <div>
          <p className="text-xs font-body font-semibold letter-wide uppercase text-muted-foreground mb-2">
            Order info
          </p>
          <p className="text-xs text-muted-foreground">
            Placed {format(new Date(order.createdAt), 'PPpp')}
          </p>
          {order.updatedAt && (
            <p className="text-xs text-muted-foreground mt-1">
              Updated {format(new Date(order.updatedAt), 'PPpp')}
            </p>
          )}
          {variant === 'page' && (
            <p className="text-xs text-muted-foreground mt-2 font-mono">ID: {order.id}</p>
          )}
        </div>
      </div>

      <div>
        <p className="text-xs font-body font-semibold letter-wide uppercase text-muted-foreground mb-2">
          Items
        </p>
        <div className="space-y-2">
          {order.items.map((item, i) => (
            <div key={i} className="flex items-center gap-3 p-3 bg-secondary rounded-lg">
              <div className="w-12 h-14 bg-muted rounded overflow-hidden flex-shrink-0">
                <img src={item.image} alt={item.productName} className="w-full h-full object-cover" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{item.productName}</p>
                <p className="text-xs text-muted-foreground">
                  {item.color} · {item.size} · Qty {item.quantity}
                </p>
              </div>
              <span className="text-sm font-medium">${(item.price * item.quantity).toFixed(2)}</span>
            </div>
          ))}
        </div>
        <div className="mt-4 pt-4 border-t border-border space-y-1 text-sm max-w-md ml-auto">
          <div className="flex justify-between text-muted-foreground">
            <span>Subtotal</span>
            <span>${order.subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-muted-foreground">
            <span>Shipping</span>
            <span>${order.shipping.toFixed(2)}</span>
          </div>
          {(order.giftWrapAmount ?? 0) > 0 && (
            <div className="flex justify-between text-muted-foreground">
              <span>Gift Wrap</span>
              <span>${order.giftWrapAmount!.toFixed(2)}</span>
            </div>
          )}
          {(order.codFee ?? 0) > 0 && (
            <div className="flex justify-between text-muted-foreground">
              <span>COD Fee</span>
              <span>${order.codFee!.toFixed(2)}</span>
            </div>
          )}
          {(order.discountAmount ?? 0) > 0 && (
            <div className="flex justify-between text-gold">
              <span>Discount{order.promoCode ? ` (${order.promoCode})` : ''}</span>
              <span>-${order.discountAmount!.toFixed(2)}</span>
            </div>
          )}
          <div className="flex justify-between text-muted-foreground">
            <span>Tax</span>
            <span>${order.tax.toFixed(2)}</span>
          </div>
          <div className="flex justify-between font-medium pt-1 border-t border-border">
            <span>Total</span>
            <span>${order.total.toFixed(2)}</span>
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-border bg-secondary/30 p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between mb-4">
          <div>
            <p className="text-xs font-body font-semibold letter-wide uppercase text-muted-foreground mb-1 flex items-center gap-1.5">
              <Truck size={12} /> Shipment tracking
            </p>
            <p className="text-xs text-muted-foreground">
              Customers see this on the storefront track-order page.
            </p>
          </div>
          <a
            href={trackOrderUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-foreground underline underline-offset-4 hover:text-gold shrink-0"
          >
            Preview customer view
            <ExternalLink size={12} />
          </a>
        </div>

        {order.trackingNumber ? (
          <div className="mb-4 rounded border border-border bg-background px-4 py-3">
            <p className="text-[10px] font-semibold letter-wide uppercase text-muted-foreground mb-1">
              Current tracking
            </p>
            <p className="font-mono text-sm font-medium">{order.trackingNumber}</p>
            {order.carrier && (
              <p className="text-xs text-muted-foreground mt-1">Carrier: {order.carrier}</p>
            )}
          </div>
        ) : (
          <div className="mb-4 flex items-center gap-2 rounded border border-dashed border-border bg-background px-4 py-3 text-xs text-muted-foreground">
            <Package size={14} />
            No tracking number yet — add one below so customers can follow their shipment.
          </div>
        )}

        {canEditOrders && (
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                value={trackingInput}
                onChange={(e) => setTrackingInput(e.target.value.slice(0, 50))}
                placeholder="Tracking number"
                className="flex-1 px-3 py-2 border border-border text-sm bg-background focus:outline-none focus:border-foreground transition-smooth font-mono"
              />
              <input
                type="text"
                value={carrierInput}
                onChange={(e) => setCarrierInput(e.target.value.slice(0, 30))}
                placeholder="Carrier"
                list="carrier-options"
                className="sm:w-36 px-3 py-2 border border-border text-sm bg-background focus:outline-none focus:border-foreground transition-smooth"
              />
              <datalist id="carrier-options">
                {CARRIER_OPTIONS.map((carrier) => (
                  <option key={carrier} value={carrier} />
                ))}
              </datalist>
              <button
                onClick={() => void handleUpdateTracking()}
                disabled={isSaving || !trackingInput.trim()}
                className="px-4 py-2 bg-primary text-primary-foreground text-xs font-medium letter-wide uppercase transition-smooth hover:opacity-90 disabled:opacity-50"
              >
                {order.trackingNumber ? 'Update' : 'Add tracking'}
              </button>
            </div>
            {(order.status === 'pending' || order.status === 'processing') && (
              <p className="text-[10px] text-muted-foreground">
                Saving tracking will also mark this order as <strong className="text-foreground">shipped</strong>.
              </p>
            )}
          </div>
        )}
      </div>

      {canDeleteOrders && (
        <div>
          <p className="text-xs font-body font-semibold letter-wide uppercase text-muted-foreground mb-2 flex items-center gap-1.5">
            <MessageSquare size={12} /> Internal Notes
          </p>
          {order.notes.length > 0 && (
            <div className="space-y-2 mb-3">
              {order.notes.map((note, i) => (
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
              onKeyDown={(e) => e.key === 'Enter' && void handleAddNote()}
            />
            <button
              onClick={() => void handleAddNote()}
              disabled={isSaving}
              className="px-3 py-2 bg-foreground text-background text-xs font-medium transition-smooth hover:opacity-90 disabled:opacity-50"
            >
              Add
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
