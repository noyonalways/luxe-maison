"use client";

import { useState, useMemo, useCallback } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { SlidersHorizontal, X } from 'lucide-react';
import { useProducts } from '@/context/ProductsContext';
import ProductCard from '@/components/ProductCard';
import { Loader2 } from 'lucide-react';

const fits = ['slim', 'regular', 'relaxed'] as const;
const fabrics = ['silk', 'cotton', 'linen', 'blend'] as const;
const priceRanges = [
  { label: 'Under $100', min: 0, max: 100 },
  { label: '$100 – $150', min: 100, max: 150 },
  { label: '$150+', min: 150, max: Infinity },
];

export default function ShopPage() {
  const { products, categories, sections, isLoading } = useProducts();
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const setSearchParams = useCallback((params: URLSearchParams | Record<string, never>) => {
    const next = params instanceof URLSearchParams ? params.toString() : '';
    router.push(next ? `${pathname}?${next}` : pathname);
  }, [router, pathname]);

  const activeSection = searchParams.get('section') || '';
  const activeCategory = searchParams.get('category') || '';
  const activeBadge = searchParams.get('badge') || '';
  const activeSort = searchParams.get('sort') || '';
  const [activeFit, setActiveFit] = useState('');
  const [activeFabric, setActiveFabric] = useState('');
  const [activePrice, setActivePrice] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [visibleCount, setVisibleCount] = useState(8);

  const filtered = useMemo(() => {
    let result = products.filter(p => {
      if (activeSection && p.section !== activeSection) return false;
      if (activeCategory && p.category !== activeCategory) return false;
      if (activeBadge && p.badge !== activeBadge) return false;
      if (activeFit && p.fit !== activeFit) return false;
      if (activeFabric && p.fabric !== activeFabric) return false;
      if (activePrice) {
        const range = priceRanges.find(r => r.label === activePrice);
        if (range && (p.price < range.min || p.price >= range.max)) return false;
      }
      return true;
    });
    if (activeSort === 'popular') {
      result = [...result].sort((a, b) => b.reviews - a.reviews);
    }
    return result;
  }, [products, activeSection, activeCategory, activeBadge, activeSort, activeFit, activeFabric, activePrice]);

  if (isLoading) {
    return (
      <main className="pt-20 lg:pt-24 min-h-screen flex items-center justify-center text-muted-foreground gap-2">
        <Loader2 size={20} className="animate-spin" />
        <span className="text-sm">Loading collection…</span>
      </main>
    );
  }

  const hasFilters = activeSection || activeCategory || activeBadge || activeFit || activeFabric || activePrice;

  const clearAll = () => {
    setSearchParams({});
    setActiveFit('');
    setActiveFabric('');
    setActivePrice('');
  };

  const FilterChip = ({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) => (
    <button
      onClick={onClick}
      className={`px-4 py-2 text-xs font-body font-medium letter-wide uppercase border transition-smooth ${
        active
          ? 'bg-foreground text-background border-foreground'
          : 'bg-transparent text-foreground border-border hover:border-foreground'
      }`}
    >
      {label}
    </button>
  );

  return (
    <main className="pt-20 lg:pt-24 min-h-screen">
      <div className="container mx-auto px-6 lg:px-12 py-8 lg:py-16">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10"
        >
          <h1 className="font-heading text-3xl lg:text-4xl mb-2">
            {activeBadge
              ? activeBadge === 'New Arrival' ? 'New Arrivals' : activeBadge
              : activeSort === 'popular'
                ? 'Top Selling'
                : activeSection
                  ? `${sections.find(s => s.id === activeSection)?.name || 'Shop'}${activeCategory ? ' — ' + (categories.find(c => c.id === activeCategory)?.name || '') : ''}`
                  : activeCategory
                    ? categories.find(c => c.id === activeCategory)?.name || 'Shop'
                    : 'All Collections'}
          </h1>
          <p className="text-sm text-muted-foreground">
            {filtered.length} {filtered.length === 1 ? 'piece' : 'pieces'}
          </p>
        </motion.div>

        {/* Filter toggle (mobile) */}
        <div className="flex items-center justify-between mb-6 lg:mb-10">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 text-sm font-medium text-foreground transition-smooth hover-gold"
          >
            <SlidersHorizontal size={16} />
            Filters
          </button>
          {hasFilters && (
            <button onClick={clearAll} className="flex items-center gap-1 text-xs text-muted-foreground transition-smooth hover-gold">
              Clear all <X size={12} />
            </button>
          )}
        </div>

        {/* Filters */}
        <motion.div
          initial={false}
          animate={{ height: showFilters || window.innerWidth >= 1024 ? 'auto' : 0, opacity: showFilters || window.innerWidth >= 1024 ? 1 : 0 }}
          className="overflow-hidden lg:!h-auto lg:!opacity-100 mb-8 lg:mb-12"
        >
          <div className="space-y-6 pb-6 border-b border-border">
            {/* Section */}
            <div>
              <p className="text-xs font-body font-semibold letter-wide uppercase text-muted-foreground mb-3">Section</p>
              <div className="flex flex-wrap gap-2">
                {sections.map(s => (
                  <FilterChip
                    key={s.id}
                    label={s.name}
                    active={activeSection === s.id}
                    onClick={() => {
                      const params = new URLSearchParams(searchParams.toString());
                      if (activeSection === s.id) params.delete('section');
                      else params.set('section', s.id);
                      setSearchParams(params);
                    }}
                  />
                ))}
              </div>
            </div>
            {/* Category */}
            <div>
              <p className="text-xs font-body font-semibold letter-wide uppercase text-muted-foreground mb-3">Category</p>
              <div className="flex flex-wrap gap-2">
                {categories.map(c => (
                  <FilterChip
                    key={c.id}
                    label={c.name}
                    active={activeCategory === c.id}
                    onClick={() => {
                      const params = new URLSearchParams(searchParams.toString());
                      if (activeCategory === c.id) params.delete('category');
                      else params.set('category', c.id);
                      setSearchParams(params);
                    }}
                  />
                ))}
              </div>
            </div>
            {/* Fit */}
            <div>
              <p className="text-xs font-body font-semibold letter-wide uppercase text-muted-foreground mb-3">Fit</p>
              <div className="flex flex-wrap gap-2">
                {fits.map(f => (
                  <FilterChip key={f} label={f} active={activeFit === f} onClick={() => setActiveFit(activeFit === f ? '' : f)} />
                ))}
              </div>
            </div>
            {/* Fabric */}
            <div>
              <p className="text-xs font-body font-semibold letter-wide uppercase text-muted-foreground mb-3">Fabric</p>
              <div className="flex flex-wrap gap-2">
                {fabrics.map(f => (
                  <FilterChip key={f} label={f} active={activeFabric === f} onClick={() => setActiveFabric(activeFabric === f ? '' : f)} />
                ))}
              </div>
            </div>
            {/* Price */}
            <div>
              <p className="text-xs font-body font-semibold letter-wide uppercase text-muted-foreground mb-3">Price</p>
              <div className="flex flex-wrap gap-2">
                {priceRanges.map(r => (
                  <FilterChip key={r.label} label={r.label} active={activePrice === r.label} onClick={() => setActivePrice(activePrice === r.label ? '' : r.label)} />
                ))}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Grid */}
        {filtered.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-muted-foreground text-sm">No products match your filters.</p>
            <button onClick={clearAll} className="mt-3 text-sm font-medium text-gold underline underline-offset-4">
              Clear filters
            </button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
              {filtered.slice(0, visibleCount).map((product, i) => (
                <ProductCard key={product.id} product={product} index={i} />
              ))}
            </div>
            {visibleCount < filtered.length && (
              <div className="text-center mt-12">
                <button
                  onClick={() => setVisibleCount(v => v + 8)}
                  className="px-10 py-3 border border-foreground text-sm font-medium letter-wide uppercase transition-smooth hover:bg-foreground hover:text-background"
                >
                  Load More
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
}
