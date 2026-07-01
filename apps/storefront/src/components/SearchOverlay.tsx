"use client";

import { useState, useMemo, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Search, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { products } from '@/data/products';

interface SearchOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SearchOverlay({ isOpen, onClose }: SearchOverlayProps) {
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    } else {
      setQuery('');
    }
  }, [isOpen]);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (q.length < 2) return [];
    return products.filter(p =>
      p.name.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q) ||
      p.fabric.toLowerCase().includes(q) ||
      p.fit.toLowerCase().includes(q) ||
      p.colors.some(c => c.name.toLowerCase().includes(q))
    ).slice(0, 6);
  }, [query]);

  const handleSelect = (productId: string) => {
    router.push(`/product/${productId}`);
    onClose();
  };

  const categoryLabel = (cat: string) => {
    const map: Record<string, string> = { punjabi: 'Punjabi', shirt: 'Shirt', tshirt: 'T-Shirt', pants: 'Pants' };
    return map[cat] || cat;
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-foreground/40 backdrop-blur-sm z-50"
          />
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.25 }}
            className="fixed top-0 left-0 right-0 z-50 bg-background shadow-elevated"
          >
            <div className="container mx-auto px-6 lg:px-12 py-5">
              <div className="flex items-center gap-4">
                <Search size={18} className="text-muted-foreground flex-shrink-0" />
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={e => setQuery(e.target.value.slice(0, 100))}
                  placeholder="Search by name, category, fabric..."
                  className="flex-1 text-base lg:text-lg font-body bg-transparent outline-none placeholder:text-muted-foreground/50"
                />
                <button onClick={onClose} className="p-2 text-muted-foreground transition-smooth hover-gold" aria-label="Close search">
                  <X size={18} />
                </button>
              </div>

              {query.trim().length >= 2 && (
                <div className="mt-6 pb-2">
                  {results.length === 0 ? (
                    <p className="text-sm text-muted-foreground py-4">No results for "{query}"</p>
                  ) : (
                    <div className="space-y-1">
                      <p className="text-xs font-body font-medium letter-wide uppercase text-muted-foreground mb-3">
                        {results.length} result{results.length !== 1 ? 's' : ''}
                      </p>
                      {results.map(product => (
                        <button
                          key={product.id}
                          onClick={() => handleSelect(product.id)}
                          className="w-full flex items-center gap-4 p-3 rounded transition-smooth hover:bg-secondary text-left"
                        >
                          <div className="w-12 h-16 bg-secondary rounded overflow-hidden flex-shrink-0">
                            <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{product.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {categoryLabel(product.category)} · {product.fabric} · {product.fit} fit
                            </p>
                          </div>
                          <span className="text-sm font-medium flex-shrink-0">${product.price}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
