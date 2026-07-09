"use client";

import { useRef, useState, useEffect } from 'react';
import Link from 'next/link';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowRight,
  Camera,
  Heart,
  LayoutGrid,
  Loader2,
  LogOut,
  MapPin,
  Package,
  Phone,
  Search,
  ShoppingBag,
  User,
} from 'lucide-react';
import { toast } from 'sonner';
import { useCustomer } from '@/context/CustomerContext';
import { useAuth } from '@/context/AuthContext';
import OrderCard from '@/components/account/OrderCard';
import OrderDetailView from '@/components/account/OrderDetailView';
import {
  type AccountSection,
  formatCurrency,
  getInitials,
} from '@/components/account/account-utils';
import { PageBody, PageHero, PageMain } from '@/components/layout/PageShell';

const NAV_ITEMS: { id: AccountSection; label: string; icon: typeof Package }[] = [
  { id: 'overview', label: 'Overview', icon: LayoutGrid },
  { id: 'orders', label: 'Orders', icon: Package },
  { id: 'profile', label: 'Profile', icon: User },
];

function ProfileField({
  label,
  value,
  onChange,
  type = 'text',
  readOnly = false,
}: {
  label: string;
  value: string;
  onChange?: (value: string) => void;
  type?: string;
  readOnly?: boolean;
}) {
  return (
    <div>
      <label className="block text-xs font-body font-medium letter-wide uppercase text-muted-foreground mb-1.5">
        {label}
      </label>
      {readOnly ? (
        <p className="text-sm py-3 border-b border-border text-muted-foreground">{value}</p>
      ) : (
        <input
          type={type}
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          className="w-full px-0 py-3 border-0 border-b border-border text-sm bg-transparent transition-smooth focus:outline-none focus:border-foreground"
        />
      )}
    </div>
  );
}

export default function AccountPage() {
  const { profile, orders, isLoadingOrders, updateProfile } = useCustomer();
  const { user, updateProfile: updateAuthProfile, logout } = useAuth();
  const avatarInputRef = useRef<HTMLInputElement>(null);

  const [activeSection, setActiveSection] = useState<AccountSection>('overview');
  const [selectedOrder, setSelectedOrder] = useState<typeof orders[number] | null>(null);

  const [name, setName] = useState(user?.name || profile.name);
  const [phone, setPhone] = useState(profile.phone);
  const [address, setAddress] = useState(profile.address);
  const [avatar, setAvatar] = useState(user?.avatar || '');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setName(user?.name || profile.name);
    setPhone(profile.phone);
    setAddress(profile.address);
    setAvatar(user?.avatar || '');
  }, [user, profile.name, profile.phone, profile.address, user?.avatar]);

  const displayName = user?.name || profile.name;
  const displayEmail = user?.email || profile.email;
  const firstName = displayName.split(' ')[0] || 'there';
  const totalSpent = orders.reduce((sum, order) => sum + order.total, 0);
  const pendingOrders = orders.filter((order) => order.status === 'pending').length;
  const recentOrders = orders.slice(0, 3);
  const memberSince =
    orders.length > 0
      ? [...orders].sort(
          (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
        )[0]!.createdAt
      : null;

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      toast.error('Please choose an image under 2MB.');
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => setAvatar(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleSaveProfile = async () => {
    setIsSaving(true);
    updateProfile({ name, phone, address, avatar });
    updateAuthProfile({ name, avatar });
    await new Promise((resolve) => setTimeout(resolve, 400));
    setIsSaving(false);
    toast.success('Your profile has been updated.');
  };

  if (selectedOrder) {
    return (
      <PageMain className="bg-cream/30">
        <PageBody offset wide>
          <OrderDetailView order={selectedOrder} onBack={() => setSelectedOrder(null)} />
        </PageBody>
      </PageMain>
    );
  }

  return (
    <PageMain>
      <PageHero>
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between"
        >
            <div className="flex items-center gap-5">
              <div className="relative group">
                <div className="w-20 h-20 lg:w-24 lg:h-24 rounded-full border-2 border-gold/30 bg-secondary overflow-hidden flex items-center justify-center">
                  {avatar ? (
                    <img src={avatar} alt={displayName} className="w-full h-full object-cover" />
                  ) : (
                    <span className="font-heading text-2xl text-gold">{getInitials(displayName)}</span>
                  )}
                </div>
                {activeSection === 'profile' && (
                  <button
                    type="button"
                    onClick={() => avatarInputRef.current?.click()}
                    className="absolute inset-0 rounded-full bg-foreground/0 group-hover:bg-foreground/40 flex items-center justify-center transition-smooth"
                  >
                    <Camera size={18} className="text-background opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>
                )}
                <input
                  ref={avatarInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  onChange={handleAvatarChange}
                  className="hidden"
                />
              </div>
              <div>
                <p className="text-xs font-body font-medium letter-wider uppercase text-gold mb-2">My account</p>
                <h1 className="font-heading text-3xl lg:text-4xl">Welcome, {firstName}</h1>
                <p className="text-sm text-muted-foreground mt-2">{displayEmail}</p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 lg:gap-8">
              {[
                { label: 'Orders', value: String(orders.length) },
                { label: 'Total spent', value: formatCurrency(totalSpent) },
                {
                  label: 'Member since',
                  value: memberSince ? format(new Date(memberSince), 'MMM yyyy') : '—',
                },
              ].map((stat) => (
                <div key={stat.label} className="border border-border/80 bg-background/70 px-4 py-3 lg:px-6 lg:py-4">
                  <p className="text-[10px] font-body font-semibold letter-wide uppercase text-muted-foreground">
                    {stat.label}
                  </p>
                  <p className="font-heading text-xl lg:text-2xl mt-1">{stat.value}</p>
                </div>
              ))}
            </div>
          </motion.div>
      </PageHero>

      <PageBody className="py-10 lg:py-14">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16">
          <aside className="lg:col-span-3">
            <nav className="flex lg:flex-col gap-2 overflow-x-auto pb-2 lg:pb-0">
              {NAV_ITEMS.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setActiveSection(id)}
                  className={`flex items-center gap-3 px-4 py-3 text-sm font-medium whitespace-nowrap transition-smooth border ${
                    activeSection === id
                      ? 'border-foreground bg-foreground text-background'
                      : 'border-border bg-background hover:border-foreground'
                  }`}
                >
                  <Icon size={16} />
                  {label}
                </button>
              ))}
            </nav>

            <div className="hidden lg:block mt-8 pt-8 border-t border-border space-y-2">
              <Link
                href="/wishlist"
                className="flex items-center gap-3 px-4 py-3 text-sm text-muted-foreground transition-smooth hover:text-foreground hover:bg-secondary"
              >
                <Heart size={16} /> Wishlist
              </Link>
              <Link
                href="/track-order"
                className="flex items-center gap-3 px-4 py-3 text-sm text-muted-foreground transition-smooth hover:text-foreground hover:bg-secondary"
              >
                <Search size={16} /> Track an order
              </Link>
              <Link
                href="/shop"
                className="flex items-center gap-3 px-4 py-3 text-sm text-muted-foreground transition-smooth hover:text-foreground hover:bg-secondary"
              >
                <ShoppingBag size={16} /> Continue shopping
              </Link>
              <button
                type="button"
                onClick={logout}
                className="w-full flex items-center gap-3 px-4 py-3 text-sm text-destructive transition-smooth hover:bg-destructive/5"
              >
                <LogOut size={16} /> Sign out
              </button>
            </div>
          </aside>

          <div className="lg:col-span-9">
            <AnimatePresence mode="wait">
              {activeSection === 'overview' && (
                <motion.div
                  key="overview"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className="space-y-8"
                >
                  {(pendingOrders > 0 || isLoadingOrders) && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {pendingOrders > 0 && (
                        <button
                          type="button"
                          onClick={() => setActiveSection('orders')}
                          className="text-left border border-gold/30 bg-cream px-5 py-4 transition-smooth hover:border-gold"
                        >
                          <p className="text-xs font-semibold letter-wide uppercase text-gold mb-1">Attention</p>
                          <p className="text-sm font-medium">
                            {pendingOrders} order{pendingOrders > 1 ? 's' : ''} awaiting processing
                          </p>
                        </button>
                      )}
                    </div>
                  )}

                  <section>
                    <div className="flex items-center justify-between mb-5">
                      <h2 className="font-heading text-2xl">Recent orders</h2>
                      {orders.length > 0 && (
                        <button
                          type="button"
                          onClick={() => setActiveSection('orders')}
                          className="text-xs font-medium text-muted-foreground transition-smooth hover-gold inline-flex items-center gap-1"
                        >
                          View all <ArrowRight size={14} />
                        </button>
                      )}
                    </div>

                    {isLoadingOrders ? (
                      <div className="flex items-center justify-center py-16 text-muted-foreground gap-2">
                        <Loader2 size={18} className="animate-spin" />
                        <span className="text-sm">Loading your orders…</span>
                      </div>
                    ) : recentOrders.length === 0 ? (
                      <div className="border border-border px-6 py-14 text-center">
                        <Package size={36} className="mx-auto mb-4 text-muted-foreground/30" />
                        <p className="font-heading text-xl mb-2">No orders yet</p>
                        <p className="text-sm text-muted-foreground mb-6">
                          When you place an order, it will appear here.
                        </p>
                        <Link
                          href="/shop"
                          className="inline-flex items-center gap-2 px-8 py-3 bg-primary text-primary-foreground text-sm font-medium letter-wide uppercase transition-smooth hover:opacity-90"
                        >
                          Shop collection <ArrowRight size={14} />
                        </Link>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {recentOrders.map((order) => (
                          <OrderCard key={order.id} order={order} onSelect={setSelectedOrder} />
                        ))}
                      </div>
                    )}
                  </section>

                  <section className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Link
                      href="/shop"
                      className="group border border-border p-6 transition-smooth hover:border-foreground"
                    >
                      <ShoppingBag size={20} className="text-gold mb-4" />
                      <p className="font-heading text-lg mb-1">Discover new arrivals</p>
                      <p className="text-sm text-muted-foreground mb-4">Explore the latest curated pieces.</p>
                      <span className="inline-flex items-center gap-1 text-xs font-medium transition-smooth group-hover:text-gold">
                        Browse shop <ArrowRight size={14} />
                      </span>
                    </Link>
                    <Link
                      href="/wishlist"
                      className="group border border-border p-6 transition-smooth hover:border-foreground"
                    >
                      <Heart size={20} className="text-gold mb-4" />
                      <p className="font-heading text-lg mb-1">Your wishlist</p>
                      <p className="text-sm text-muted-foreground mb-4">Return to pieces you have saved.</p>
                      <span className="inline-flex items-center gap-1 text-xs font-medium transition-smooth group-hover:text-gold">
                        View wishlist <ArrowRight size={14} />
                      </span>
                    </Link>
                  </section>
                </motion.div>
              )}

              {activeSection === 'orders' && (
                <motion.div
                  key="orders"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                >
                  <div className="mb-8">
                    <h2 className="font-heading text-2xl lg:text-3xl mb-2">Order history</h2>
                    <p className="text-sm text-muted-foreground">
                      {orders.length} {orders.length === 1 ? 'order' : 'orders'} placed with MAISON
                    </p>
                  </div>

                  {isLoadingOrders ? (
                    <div className="flex items-center justify-center py-20 text-muted-foreground gap-2">
                      <Loader2 size={18} className="animate-spin" />
                      <span className="text-sm">Loading your orders…</span>
                    </div>
                  ) : orders.length === 0 ? (
                    <div className="border border-border px-6 py-16 text-center">
                      <Package size={40} className="mx-auto mb-4 text-muted-foreground/30" />
                      <p className="font-heading text-xl mb-2">Your order history is empty</p>
                      <p className="text-sm text-muted-foreground mb-6">
                        Start with something timeless from our collection.
                      </p>
                      <Link
                        href="/shop"
                        className="inline-flex items-center gap-2 px-8 py-3 bg-primary text-primary-foreground text-sm font-medium letter-wide uppercase transition-smooth hover:opacity-90"
                      >
                        Explore collection <ArrowRight size={14} />
                      </Link>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {orders.map((order) => (
                        <OrderCard key={order.id} order={order} onSelect={setSelectedOrder} />
                      ))}
                    </div>
                  )}
                </motion.div>
              )}

              {activeSection === 'profile' && (
                <motion.div
                  key="profile"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className="space-y-8"
                >
                  <div>
                    <h2 className="font-heading text-2xl lg:text-3xl mb-2">Profile & preferences</h2>
                    <p className="text-sm text-muted-foreground">
                      Manage your details for a smoother checkout experience.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">
                    <section className="border border-border p-6 lg:p-8">
                      <h3 className="text-xs font-body font-semibold letter-wide uppercase text-muted-foreground mb-6">
                        Personal details
                      </h3>
                      <div className="space-y-6">
                        <ProfileField label="Full name" value={name} onChange={setName} />
                        <ProfileField label="Email address" value={displayEmail} readOnly />
                        <ProfileField label="Phone number" value={phone} onChange={setPhone} type="tel" />
                      </div>
                    </section>

                    <section className="border border-border p-6 lg:p-8">
                      <h3 className="text-xs font-body font-semibold letter-wide uppercase text-muted-foreground mb-6">
                        Default shipping
                      </h3>
                      <div className="space-y-6">
                        <div>
                          <label className="block text-xs font-body font-medium letter-wide uppercase text-muted-foreground mb-1.5">
                            Address
                          </label>
                          <textarea
                            value={address}
                            onChange={(e) => setAddress(e.target.value)}
                            rows={4}
                            placeholder="Street, city, postal code, country"
                            className="w-full px-4 py-3 border border-border text-sm bg-background transition-smooth focus:outline-none focus:border-foreground resize-none"
                          />
                        </div>
                        <div className="flex items-start gap-3 text-xs text-muted-foreground">
                          <MapPin size={14} className="text-gold mt-0.5 flex-shrink-0" />
                          <p>Used to pre-fill checkout. You can still change it per order.</p>
                        </div>
                      </div>
                    </section>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3">
                    <button
                      type="button"
                      onClick={() => void handleSaveProfile()}
                      disabled={isSaving}
                      className="px-8 py-3.5 bg-primary text-primary-foreground text-sm font-medium letter-wide uppercase transition-smooth hover:opacity-90 disabled:opacity-60"
                    >
                      {isSaving ? 'Saving…' : 'Save changes'}
                    </button>
                    <button
                      type="button"
                      onClick={() => avatarInputRef.current?.click()}
                      className="px-8 py-3.5 border border-foreground text-sm font-medium letter-wide uppercase transition-smooth hover:bg-foreground hover:text-background"
                    >
                      Update photo
                    </button>
                  </div>

                  <section className="border border-border p-6 lg:p-8">
                    <h3 className="text-xs font-body font-semibold letter-wide uppercase text-muted-foreground mb-6">
                      Account summary
                    </h3>
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 text-sm">
                      <div>
                        <p className="text-muted-foreground text-xs uppercase letter-wide mb-1">Orders</p>
                        <p className="font-heading text-2xl">{orders.length}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground text-xs uppercase letter-wide mb-1">Total spent</p>
                        <p className="font-heading text-2xl">{formatCurrency(totalSpent)}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground text-xs uppercase letter-wide mb-1">Phone</p>
                        <p className="font-medium flex items-center gap-2 mt-1">
                          <Phone size={14} className="text-gold" />
                          {phone || 'Not set'}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground text-xs uppercase letter-wide mb-1">Last order</p>
                        <p className="font-medium mt-1">
                          {orders[0]
                            ? format(new Date(orders[0].createdAt), 'MMM d, yyyy')
                            : '—'}
                        </p>
                      </div>
                    </div>
                  </section>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </PageBody>
    </PageMain>
  );
}
