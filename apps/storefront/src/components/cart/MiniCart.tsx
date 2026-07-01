import { X, Minus, Plus, ShoppingBag } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

export default function MiniCart() {
  const { items, isOpen, closeCart, updateQuantity, removeItem, totalPrice, totalItems } = useCart();

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeCart}
            className="fixed inset-0 bg-foreground/30 z-50"
          />
          {/* Panel */}
          <motion.aside
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'tween', duration: 0.3 }}
            className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-background z-50 flex flex-col shadow-elevated"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-border">
              <div className="flex items-center gap-2">
                <ShoppingBag size={18} />
                <h2 className="font-heading text-lg">Bag ({totalItems})</h2>
              </div>
              <button onClick={closeCart} className="p-2 transition-smooth hover-gold" aria-label="Close cart">
                <X size={18} />
              </button>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto px-6 py-4">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center gap-4">
                  <ShoppingBag size={48} className="text-muted-foreground/30" />
                  <p className="text-muted-foreground text-sm">Your bag is empty</p>
                  <button onClick={closeCart} className="text-sm font-medium text-gold underline underline-offset-4">
                    Continue Shopping
                  </button>
                </div>
              ) : (
                <div className="flex flex-col gap-6">
                  {items.map((item) => (
                    <div key={`${item.product.id}-${item.selectedSize}-${item.selectedColor}`} className="flex gap-4">
                      <div className="w-20 h-24 bg-secondary rounded overflow-hidden flex-shrink-0">
                        <img src={item.product.images[0]} alt={item.product.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-medium truncate">{item.product.name}</h3>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {item.selectedColor} · {item.selectedSize}
                        </p>
                        <p className="text-sm font-medium mt-1">${item.product.price}</p>
                        <div className="flex items-center gap-3 mt-2">
                          <button
                            onClick={() => updateQuantity(item.product.id, item.selectedSize, item.selectedColor, item.quantity - 1)}
                            className="w-7 h-7 flex items-center justify-center border border-border rounded-sm transition-smooth hover:border-foreground"
                          >
                            <Minus size={12} />
                          </button>
                          <span className="text-xs font-medium w-4 text-center">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.product.id, item.selectedSize, item.selectedColor, item.quantity + 1)}
                            className="w-7 h-7 flex items-center justify-center border border-border rounded-sm transition-smooth hover:border-foreground"
                          >
                            <Plus size={12} />
                          </button>
                          <button
                            onClick={() => removeItem(item.product.id, item.selectedSize, item.selectedColor)}
                            className="ml-auto text-xs text-muted-foreground underline underline-offset-2 transition-smooth hover-gold"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="border-t border-border px-6 py-5">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm text-muted-foreground">Subtotal</span>
                  <span className="text-lg font-heading font-semibold">${totalPrice.toFixed(2)}</span>
                </div>
                <p className="text-xs text-muted-foreground mb-4">Shipping & taxes calculated at checkout</p>
                <Link href="/checkout" onClick={closeCart} className="block w-full py-3.5 bg-primary text-primary-foreground text-sm font-medium letter-wide uppercase transition-smooth hover:opacity-90 text-center">
                  Checkout
                </Link>
                <button
                  onClick={closeCart}
                  className="w-full py-3 mt-2 text-sm font-medium text-muted-foreground transition-smooth hover-gold text-center"
                >
                  Continue Shopping
                </button>
              </div>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
