import Link from 'next/link';
import { ShoppingBag, Search, Menu, X, Heart, UserCircle, MapPin, LogOut } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import { useAuth } from '@/context/AuthContext';
import { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import SearchOverlay from '@/components/SearchOverlay';
import MegaMenu from '@/components/layout/MegaMenu';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export default function Navbar() {
  const { totalItems, openCart } = useCart();
  const { totalItems: wishlistCount } = useWishlist();
  const { user, isAuthenticated, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleMenuEnter = useCallback((category: string) => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setActiveMenu(category);
  }, []);

  const handleMenuLeave = useCallback(() => {
    closeTimer.current = setTimeout(() => setActiveMenu(null), 150);
  }, []);

  const navLinks = [
    { to: '/shop?section=men', label: 'Men', section: 'men' },
    { to: '/shop?section=women', label: 'Women', section: 'women' },
    { to: '/shop?section=kids', label: 'Kids', section: 'kids' },
    { to: '/shop', label: 'All' },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
      <nav className="container mx-auto px-6 lg:px-12">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Mobile menu */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="lg:hidden p-2 text-foreground transition-smooth hover-gold"
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>

          {/* Logo */}
          <Link href="/" className="font-heading text-xl lg:text-2xl font-semibold tracking-wide text-foreground">
            MAISON
          </Link>

          {/* Desktop nav */}
          <div className="hidden lg:flex items-center gap-10">
            {navLinks.map(link => {
              if (link.section) {
                return (
                  <div
                    key={link.label}
                    onMouseEnter={() => handleMenuEnter(link.section!)}
                    onMouseLeave={handleMenuLeave}
                  >
                    <Link
                      href={link.to}
                      className={`text-xs font-body font-medium letter-wide uppercase transition-smooth hover-gold ${
                        activeMenu === link.section ? 'text-foreground' : 'text-muted-foreground'
                      }`}
                    >
                      {link.label}
                    </Link>
                  </div>
                );
              }
              return (
                <Link
                  key={link.label}
                  href={link.to}
                  className="text-xs font-body font-medium letter-wide uppercase text-muted-foreground transition-smooth hover-gold"
                >
                  {link.label}
                </Link>
              );
            })}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-4">
            <button onClick={() => setSearchOpen(true)} className="p-2 text-foreground transition-smooth hover-gold" aria-label="Search">
              <Search size={18} />
            </button>
            <Link href="/track-order" className="hidden sm:block p-2 text-foreground transition-smooth hover-gold" aria-label="Track Order">
              <MapPin size={18} />
            </Link>

            {/* Account / Login */}
            {isAuthenticated && user ? (
              <DropdownMenu>
                <DropdownMenuTrigger className="p-2 text-foreground transition-smooth hover-gold" aria-label="My Account">
                  <UserCircle size={18} />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <div className="px-3 py-2">
                    <p className="text-sm font-medium">{user.name}</p>
                    <p className="text-[10px] text-muted-foreground">{user.email}</p>
                  </div>
                  <DropdownMenuSeparator />
                  {user.role === 'customer' && (
                    <DropdownMenuItem asChild>
                      <Link href="/account">My Account</Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem onClick={logout} className="text-destructive">
                    <LogOut size={14} className="mr-2" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link href="/login" className="p-2 text-foreground transition-smooth hover-gold" aria-label="Sign In">
                <UserCircle size={18} />
              </Link>
            )}

            <Link href="/wishlist" className="relative p-2 text-foreground transition-smooth hover-gold" aria-label="Wishlist">
              <Heart size={18} />
              {wishlistCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 flex items-center justify-center text-[10px] font-medium bg-primary text-primary-foreground rounded-full min-w-[18px] h-[18px]">
                  {wishlistCount}
                </span>
              )}
            </Link>
            <button
              onClick={openCart}
              className="relative p-2 text-foreground transition-smooth hover-gold"
              aria-label="Cart"
            >
              <ShoppingBag size={18} />
              {totalItems > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4.5 h-4.5 flex items-center justify-center text-[10px] font-medium bg-primary text-primary-foreground rounded-full min-w-[18px] h-[18px]">
                  {totalItems}
                </span>
              )}
            </button>
          </div>
        </div>
      </nav>

      {/* Mega Menu */}
      <AnimatePresence>
        {activeMenu && (
          <div
            onMouseEnter={() => handleMenuEnter(activeMenu)}
            onMouseLeave={handleMenuLeave}
          >
            <MegaMenu section={activeMenu} onClose={() => setActiveMenu(null)} />
          </div>
        )}
      </AnimatePresence>

      {/* Mobile menu panel */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="lg:hidden overflow-hidden bg-background border-b border-border"
          >
            <div className="px-6 py-6 flex flex-col gap-4">
              {navLinks.map(link => (
                <Link
                  key={link.label}
                  href={link.to}
                  onClick={() => setMobileOpen(false)}
                  className="text-sm font-body font-medium letter-wide uppercase text-foreground transition-smooth hover-gold"
                >
                  {link.label}
                </Link>
              ))}
              <Link
                href="/track-order"
                onClick={() => setMobileOpen(false)}
                className="text-sm font-body font-medium letter-wide uppercase text-foreground transition-smooth hover-gold"
              >
                Track Order
              </Link>
              {!isAuthenticated && (
                <Link
                  href="/login"
                  onClick={() => setMobileOpen(false)}
                  className="text-sm font-body font-medium letter-wide uppercase text-foreground transition-smooth hover-gold"
                >
                  Sign In
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <SearchOverlay isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
    </header>
  );
}
