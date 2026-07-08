"use client";

import { useState, useRef } from 'react';
import { useCustomer } from '@/context/CustomerContext';
import { useAuth } from '@/context/AuthContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { User, Package, MapPin, Phone, Mail, ChevronRight, ArrowLeft, Truck, Search, Camera } from 'lucide-react';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import OrderTimeline from '@/components/account/OrderTimeline';
import type { Order, OrderStatus } from '@luxe-maison/shared';
import { useToast } from '@/hooks/use-toast';

const statusColor: Record<OrderStatus, string> = {
  pending: 'bg-yellow-500/15 text-yellow-700 border-yellow-200',
  processing: 'bg-blue-500/15 text-blue-700 border-blue-200',
  shipped: 'bg-purple-500/15 text-purple-700 border-purple-200',
  delivered: 'bg-green-500/15 text-green-700 border-green-200',
  returned: 'bg-destructive/15 text-destructive border-destructive/20',
};

export default function AccountPage() {
  const { profile, orders, updateProfile } = useCustomer();
  const { user, updateProfile: updateAuthProfile } = useAuth();
  const { toast } = useToast();
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [trackId, setTrackId] = useState('');
  const [trackResult, setTrackResult] = useState<Order | null>(null);
  const [trackError, setTrackError] = useState('');
  const avatarInputRef = useRef<HTMLInputElement>(null);

  // Profile form state
  const [name, setName] = useState(user?.name || profile.name);
  const [phone, setPhone] = useState(profile.phone);
  const [address, setAddress] = useState(profile.address);
  const [avatar, setAvatar] = useState(user?.avatar || '');

  const handleTrackOrder = (e: React.FormEvent) => {
    e.preventDefault();
    setTrackError('');
    setTrackResult(null);
    const order = orders.find((o) => o.id.toLowerCase() === trackId.trim().toLowerCase());
    if (order) {
      setTrackResult(order);
    } else {
      setTrackError('Order not found. Please check the Order ID.');
    }
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      toast({ title: 'File too large', description: 'Please choose an image under 2MB.', variant: 'destructive' });
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      const dataUrl = reader.result as string;
      setAvatar(dataUrl);
    };
    reader.readAsDataURL(file);
  };

  const totalSpent = orders.reduce((sum, order) => sum + order.total, 0);
  const lastOrderAt = orders[0]?.createdAt;
  const memberSince = orders.length > 0 ? orders[orders.length - 1]!.createdAt : null;

  const handleSaveProfile = () => {
    updateProfile({ name, phone, address });
    updateAuthProfile({ name, avatar });
    toast({ title: 'Profile updated', description: 'Your changes have been saved.' });
  };

  if (selectedOrder) {
    return (
      <main className="min-h-screen pt-24 pb-16">
        <div className="container mx-auto px-6 lg:px-12 max-w-3xl">
          <button
            onClick={() => setSelectedOrder(null)}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
          >
            <ArrowLeft size={16} /> Back to Orders
          </button>

          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="font-heading text-2xl font-semibold">{selectedOrder.id}</h1>
                <p className="text-sm text-muted-foreground mt-1">
                  Placed {format(new Date(selectedOrder.createdAt), 'MMM d, yyyy · h:mm a')}
                </p>
              </div>
              <Badge className={statusColor[selectedOrder.status]} variant="outline">
                {selectedOrder.status}
              </Badge>
            </div>

            {/* Timeline */}
            <Card className="p-6 mb-6">
              <h3 className="text-sm font-medium mb-4">Order Status</h3>
              <OrderTimeline status={selectedOrder.status} />
              {selectedOrder.trackingNumber && (
                <div className="mt-4 pt-4 border-t border-border flex items-center gap-2 text-sm text-muted-foreground">
                  <Truck size={14} />
                  <span>{selectedOrder.carrier} — {selectedOrder.trackingNumber}</span>
                </div>
              )}
            </Card>

            {/* Items */}
            <Card className="p-6 mb-6">
              <h3 className="text-sm font-medium mb-4">Items ({selectedOrder.items.length})</h3>
              <div className="space-y-4">
                {selectedOrder.items.map((item, i) => (
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

            {/* Summary */}
            <Card className="p-6 mb-6">
              <h3 className="text-sm font-medium mb-4">Order Summary</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span>${selectedOrder.subtotal.toFixed(2)}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Shipping</span><span>{selectedOrder.shipping === 0 ? 'Free' : `$${selectedOrder.shipping.toFixed(2)}`}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Tax</span><span>${selectedOrder.tax.toFixed(2)}</span></div>
                <Separator />
                <div className="flex justify-between font-semibold text-base"><span>Total</span><span>${selectedOrder.total.toFixed(2)}</span></div>
              </div>
            </Card>

            {/* Shipping */}
            <Card className="p-6">
              <h3 className="text-sm font-medium mb-3">Shipping Address</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{selectedOrder.shippingAddress}</p>
            </Card>
          </motion.div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen pt-24 pb-16">
      <div className="container mx-auto px-6 lg:px-12 max-w-3xl">
        <h1 className="font-heading text-3xl font-semibold mb-2">My Account</h1>
        <p className="text-muted-foreground text-sm mb-8">
          Welcome back, {profile.name.split(' ')[0]}
        </p>

        <Tabs defaultValue="orders" className="w-full">
          <TabsList className="w-full justify-start bg-transparent border-b border-border rounded-none p-0 h-auto gap-6">
            <TabsTrigger value="orders" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-0 pb-3 text-sm">
              <Package size={15} className="mr-2" /> Orders
            </TabsTrigger>
             <TabsTrigger value="profile" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-0 pb-3 text-sm">
              <User size={15} className="mr-2" /> Profile
            </TabsTrigger>
            <TabsTrigger value="track" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-0 pb-3 text-sm">
              <Search size={15} className="mr-2" /> Track Order
            </TabsTrigger>
          </TabsList>

          <TabsContent value="orders" className="mt-8">
            <AnimatePresence mode="wait">
              {orders.length === 0 ? (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-16">
                  <Package size={40} className="mx-auto text-muted-foreground/40 mb-4" />
                  <p className="text-muted-foreground">No orders yet</p>
                </motion.div>
              ) : (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
                  {orders.map(order => (
                    <Card
                      key={order.id}
                      onClick={() => setSelectedOrder(order)}
                      className="p-4 cursor-pointer hover:border-primary/30 transition-colors group"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-1">
                            <span className="font-medium text-sm">{order.id}</span>
                            <Badge className={statusColor[order.status]} variant="outline">
                              {order.status}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {format(new Date(order.createdAt), 'MMM d, yyyy')} · {order.items.length} item{order.items.length > 1 ? 's' : ''} · ${order.total.toFixed(2)}
                          </p>
                        </div>
                        <ChevronRight size={16} className="text-muted-foreground group-hover:text-foreground transition-colors" />
                      </div>
                    </Card>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </TabsContent>

          <TabsContent value="profile" className="mt-8">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
              <Card className="p-6">
                {/* Avatar section */}
                <div className="flex items-center gap-5 mb-6 pb-6 border-b border-border">
                  <div className="relative group">
                    <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center overflow-hidden border-2 border-border">
                      {avatar ? (
                        <img src={avatar} alt="Avatar" className="w-full h-full object-cover" />
                      ) : (
                        <User size={32} className="text-muted-foreground" />
                      )}
                    </div>
                    <button
                      onClick={() => avatarInputRef.current?.click()}
                      className="absolute inset-0 rounded-full bg-foreground/0 group-hover:bg-foreground/40 flex items-center justify-center transition-all"
                    >
                      <Camera size={18} className="text-background opacity-0 group-hover:opacity-100 transition-opacity" />
                    </button>
                    <input
                      ref={avatarInputRef}
                      type="file"
                      accept="image/png,image/jpeg,image/webp"
                      onChange={handleAvatarChange}
                      className="hidden"
                    />
                  </div>
                  <div>
                    <p className="font-medium">{user?.name || profile.name}</p>
                    <p className="text-xs text-muted-foreground">{user?.email || profile.email}</p>
                    <button
                      onClick={() => avatarInputRef.current?.click()}
                      className="text-xs text-primary hover:underline mt-1 transition-smooth"
                    >
                      Change photo
                    </button>
                  </div>
                </div>

                <div className="grid gap-5">
                  <div>
                    <Label htmlFor="name">Full Name</Label>
                    <Input id="name" value={name} onChange={e => setName(e.target.value)} className="mt-1.5" maxLength={100} />
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <div className="flex items-center gap-2 mt-1.5">
                      <Mail size={14} className="text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">{user?.email || profile.email}</span>
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone</Label>
                    <Input id="phone" value={phone} onChange={e => setPhone(e.target.value)} className="mt-1.5" />
                  </div>
                  <div>
                    <Label htmlFor="address">Shipping Address</Label>
                    <Input id="address" value={address} onChange={e => setAddress(e.target.value)} className="mt-1.5" />
                  </div>
                </div>
                <Button onClick={handleSaveProfile} className="mt-6">
                  Save Changes
                </Button>
              </Card>

              <Card className="p-6">
                <h3 className="text-sm font-medium mb-3">Account Info</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Member Since</span>
                    <p className="font-medium mt-0.5">
                      {memberSince ? format(new Date(memberSince), 'MMM yyyy') : '—'}
                    </p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Total Orders</span>
                    <p className="font-medium mt-0.5">{orders.length}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Total Spent</span>
                    <p className="font-medium mt-0.5">${totalSpent.toLocaleString()}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Last Order</span>
                    <p className="font-medium mt-0.5">
                      {lastOrderAt ? format(new Date(lastOrderAt), 'MMM d, yyyy') : '—'}
                    </p>
                  </div>
                </div>
              </Card>
            </motion.div>
          </TabsContent>

          <TabsContent value="track" className="mt-8">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
              <Card className="p-6">
                <h3 className="text-sm font-medium mb-4">Quick Order Lookup</h3>
                <form onSubmit={handleTrackOrder} className="flex gap-3">
                  <Input
                    placeholder="Enter Order ID (e.g. ORD-1001)"
                    value={trackId}
                    onChange={e => setTrackId(e.target.value)}
                    required
                  />
                  <Button type="submit">
                    <Search size={16} className="mr-2" /> Track
                  </Button>
                </form>
              </Card>

              <AnimatePresence mode="wait">
                {trackError && (
                  <motion.div
                    key="track-error"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center gap-3 p-4 rounded-lg border border-destructive/20 bg-destructive/5 text-sm text-destructive"
                  >
                    {trackError}
                  </motion.div>
                )}

                {trackResult && (
                  <motion.div
                    key="track-result"
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                  >
                    <Card
                      onClick={() => { setSelectedOrder(trackResult); }}
                      className="p-4 cursor-pointer hover:border-primary/30 transition-colors group"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-1">
                            <span className="font-medium text-sm">{trackResult.id}</span>
                            <Badge className={statusColor[trackResult.status]} variant="outline">
                              {trackResult.status}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {format(new Date(trackResult.createdAt), 'MMM d, yyyy')} · {trackResult.items.length} item{trackResult.items.length > 1 ? 's' : ''} · ${trackResult.total.toFixed(2)}
                          </p>
                        </div>
                        <ChevronRight size={16} className="text-muted-foreground group-hover:text-foreground transition-colors" />
                      </div>
                    </Card>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </TabsContent>

        </Tabs>
      </div>
    </main>
  );
}
