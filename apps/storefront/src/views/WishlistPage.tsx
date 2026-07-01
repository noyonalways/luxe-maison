"use client";

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Heart, ShoppingBag, ArrowRight } from 'lucide-react';
import { useWishlist } from '@/context/WishlistContext';
import { useCart } from '@/context/CartContext';
import type { Product } from '@/data/products';

export default function WishlistPage() {
  const { items, removeItem } = useWishlist();
  const { addItem: addToCart } = useCart();

  const handleAddToCart = (product: Product) => {
    addToCart(product, product.sizes[0], product.colors[0].name);
  };

  if (items.length === 0) {
    return (
      <main className="pt-20 lg:pt-24 min-h-screen flex items-center justify-center">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center px-6">
          <Heart size={48} className="mx-auto mb-6 text-muted-foreground/30" />
          <h1 className="font-heading text-2xl mb-3">Your Wishlist is Empty</h1>
          <p className="text-sm text-muted-foreground mb-8">Save pieces you love for later.</p>
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 px-8 py-3 bg-primary text-primary-foreground text-sm font-medium letter-wide uppercase transition-smooth hover:opacity-90"
          >
            Explore Collection <ArrowRight size={14} />
          </Link>
        </motion.div>
      </main>
    );
  }

  return (
    <main className="pt-20 lg:pt-24 min-h-screen">
      <div className="container mx-auto px-6 lg:px-12 py-8 lg:py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="font-heading text-3xl lg:text-4xl mb-2">Wishlist</h1>
          <p className="text-sm text-muted-foreground mb-10">
            {items.length} saved {items.length === 1 ? 'piece' : 'pieces'}
          </p>
        </motion.div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {items.map((product, i) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ delay: i * 0.05 }}
            >
              <div className="group">
                <Link href={`/product/${product.id}`} className="block">
                  <div className="relative aspect-[3/4] overflow-hidden bg-secondary mb-4">
                    <img
                      src={product.images[0]}
                      alt={product.name}
                      className="w-full h-full object-cover transition-smooth group-hover:scale-105"
                      loading="lazy"
                    />
                    {product.badge && (
                      <span className="absolute top-3 left-3 px-3 py-1 text-[10px] font-body font-semibold letter-wide uppercase bg-primary text-primary-foreground">
                        {product.badge}
                      </span>
                    )}
                  </div>
                </Link>
                <div className="space-y-1 mb-3">
                  <Link href={`/product/${product.id}`}>
                    <h3 className="text-sm font-body font-medium text-foreground group-hover:text-gold transition-smooth">
                      {product.name}
                    </h3>
                  </Link>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">${product.price}</span>
                    {product.originalPrice && (
                      <span className="text-xs text-muted-foreground line-through">${product.originalPrice}</span>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleAddToCart(product)}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 border border-foreground text-xs font-medium letter-wide uppercase transition-smooth hover:bg-foreground hover:text-background"
                  >
                    <ShoppingBag size={13} /> Add to Bag
                  </button>
                  <button
                    onClick={() => removeItem(product.id)}
                    className="w-10 h-10 flex items-center justify-center border border-border transition-smooth hover:border-destructive hover:text-destructive"
                    aria-label="Remove from wishlist"
                  >
                    <Heart size={14} className="fill-current" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </main>
  );
}
