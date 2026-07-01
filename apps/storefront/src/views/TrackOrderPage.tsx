"use client";

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Search, Package, Truck, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import { mockOrders } from '@/data/admin-mock';
import OrderTimeline from '@/components/account/OrderTimeline';
import type { Order, OrderStatus } from '@/data/admin-types';

const statusColor: Record<OrderStatus, string> = {
  pending: 'bg-yellow-500/15 text-yellow-700 border-yellow-200',
  processing: 'bg-blue-500/15 text-blue-700 border-blue-200',
  shipped: 'bg-purple-500/15 text-purple-700 border-purple-200',
  delivered: 'bg-green-500/15 text-green-700 border-green-200',
  returned: 'bg-destructive/15 text-destructive border-destructive/20',
};

export default function TrackOrderPage() {
  const [orderId, setOrderId] = useState('');
  const [email, setEmail] = useState('');
  const [result, setResult] = useState<Order | null>(null);
  const [error, setError] = useState('');
  const [searched, setSearched] = useState(false);

  const handleTrack = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setResult(null);
    setSearched(true);

    const order = mockOrders.find(
      o => o.id.toLowerCase() === orderId.trim().toLowerCase() &&
           o.customerEmail.toLowerCase() === email.trim().toLowerCase()
    );

    if (order) {
      setResult(order);
    } else {
      setError('No order found. Please check your Order ID and email address.');
    }
  };

  return (
    <main className="min-h-screen pt-24 pb-16">
      <div className="container mx-auto px-6 lg:px-12 max-w-2xl">
        <div className="text-center mb-10">
          <h1 className="font-heading text-3xl font-semibold mb-2">Track Your Order</h1>
          <p className="text-muted-foreground text-sm">
            Enter your order ID and email to check the status of your order.
          </p>
        </div>

        <Card className="p-6 mb-8">
          <form onSubmit={handleTrack} className="space-y-4">
            <div>
              <Label htmlFor="orderId">Order ID</Label>
              <Input
                id="orderId"
                placeholder="e.g. ORD-1001"
                value={orderId}
                onChange={e => setOrderId(e.target.value)}
                className="mt-1.5"
                required
              />
            </div>
            <div>
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="Email used for the order"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="mt-1.5"
                required
              />
            </div>
            <Button type="submit" className="w-full">
              <Search size={16} className="mr-2" /> Track Order
            </Button>
          </form>
        </Card>

        <AnimatePresence mode="wait">
          {error && searched && (
            <motion.div
              key="error"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-3 p-4 rounded-lg border border-destructive/20 bg-destructive/5 text-sm text-destructive"
            >
              <AlertCircle size={18} />
              {error}
            </motion.div>
          )}

          {result && (
            <motion.div
              key="result"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="space-y-6"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-heading text-xl font-semibold">{result.id}</h2>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    Placed {format(new Date(result.createdAt), 'MMM d, yyyy · h:mm a')}
                  </p>
                </div>
                <Badge className={statusColor[result.status]} variant="outline">
                  {result.status}
                </Badge>
              </div>

              <Card className="p-6">
                <h3 className="text-sm font-medium mb-4">Order Status</h3>
                <OrderTimeline status={result.status} />
                {result.trackingNumber && (
                  <div className="mt-4 pt-4 border-t border-border flex items-center gap-2 text-sm text-muted-foreground">
                    <Truck size={14} />
                    <span>{result.carrier} — {result.trackingNumber}</span>
                  </div>
                )}
              </Card>

              <Card className="p-6">
                <h3 className="text-sm font-medium mb-4">Items ({result.items.length})</h3>
                <div className="space-y-4">
                  {result.items.map((item, i) => (
                    <div key={i} className="flex gap-4">
                      <img src={item.image} alt={item.productName} className="w-16 h-20 object-cover rounded-md bg-muted" />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{item.productName}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {item.color} · {item.size} · Qty {item.quantity}
                        </p>
                      </div>
                      <p className="text-sm font-medium">${(item.price * item.quantity).toFixed(2)}</p>
                    </div>
                  ))}
                </div>
              </Card>

              <Card className="p-6">
                <h3 className="text-sm font-medium mb-4">Order Summary</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span>${result.subtotal.toFixed(2)}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Shipping</span><span>{result.shipping === 0 ? 'Free' : `$${result.shipping.toFixed(2)}`}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Tax</span><span>${result.tax.toFixed(2)}</span></div>
                  <Separator />
                  <div className="flex justify-between font-semibold text-base"><span>Total</span><span>${result.total.toFixed(2)}</span></div>
                </div>
              </Card>

              <Card className="p-6">
                <h3 className="text-sm font-medium mb-3">Shipping Address</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{result.shippingAddress}</p>
              </Card>
            </motion.div>
          )}

          {!result && !error && searched && (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12"
            >
              <Package size={40} className="mx-auto text-muted-foreground/40 mb-4" />
              <p className="text-muted-foreground">Enter your details above to track an order</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}
