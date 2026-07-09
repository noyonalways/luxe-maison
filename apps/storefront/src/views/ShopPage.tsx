"use client";

import { useState, useMemo, useCallback } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { SlidersHorizontal, X, Loader2 } from 'lucide-react';
import type { ProductSection } from '@luxe-maison/shared';
import { useProducts } from '@/context/ProductsContext';
import ProductCard from '@/components/ProductCard';

const fits = ['slim', 'regular', 'relaxed'] as const;
const fabrics = ['silk', 'cotton', 'linen', 'blend'] as const;
const priceRanges = [
  { label: 'Under $100', min: 0, max: 100 },
  { label: '$100 – $150', min: 100, max: 150 },
  { label: '$150+', min: 150, max: Infinity },
];

const SECTION_PATH_PATTERN = /^\/shop\/(men|women|kids)$/;

interface ShopPageProps {
  defaultSection?: ProductSection;
}

export default function ShopPage({ defaultSection }: ShopPageProps = {}) {
  const { products, categories, sections, isLoading } = useProducts();
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const sectionFromPath = pathname.match(SECTION_PATH_PATTERN)?.[1] as ProductSection | undefined;
  const activeSection = sectionFromPath || searchParams.get('section') || defaultSection || '';
  const activeCategory = searchParams.get('category') || '';
  const activeBadge = searchParams.get('badge') || '';
  const activeSort = searchParams.get('sort') || '';
  const activeFit = searchParams.get('fit') || '';
  const activeFabric = searchParams.get('fabric') || '';
  const [activePrice, setActivePrice] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [visibleCount, setVisibleCount] = useState(8);

  const pushShopUrl = useCallback(
    (params: URLSearchParams, section?: string) => {
      const qs = params.toString();
      const base = section ? `/shop/${section}` : '/shop';
      router.push(qs ? `${base}?${qs}` : base);
    },
    [router],
  );

  const updateQueryParam = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      const current = params.get(key) || '';
      if (current === value || !value) {
        params.delete(key);
      } else {
        params.set(key, value);
      }
      params.delete('section');
      pushShopUrl(params, activeSection || undefined);
    },
    [searchParams, pushShopUrl, activeSection],
  );

  const navigateToSection = useCallback(
    (sectionId: string) => {
      const params = new URLSearchParams(searchParams.toString());
      params.delete('section');
      if (activeSection === sectionId) {
        pushShopUrl(params);
        return;
      }
      pushShopUrl(params, sectionId);
    },
    [searchParams, pushShopUrl, activeSection],
  );

  const visibleCategories = useMemo(() => {
    if (!activeSection) return categories;
    const sectionProducts = products.filter((product) => product.section === activeSection);
    return categories.filter((category) =>
      sectionProducts.some((product) => product.category === category.id),
    );
  }, [products, categories, activeSection]);

  const filtered = useMemo(() => {
    let result = products.filter((product) => {
      if (activeSection && product.section !== activeSection) return false;
      if (activeCategory && product.category !== activeCategory) return false;
      if (activeBadge && product.badge !== activeBadge) return false;
      if (activeFit && product.fit !== activeFit) return false;
      if (activeFabric && product.fabric !== activeFabric) return false;
      if (activePrice) {
        const range = priceRanges.find((item) => item.label === activePrice);
        if (range && (product.price < range.min || product.price >= range.max)) return false;
      }
      return true;
    });

    if (activeSort === 'popular') {
      result = [...result].sort((a, b) => b.reviews - a.reviews);
    }

    return result;
  }, [
    products,
    activeSection,
    activeCategory,
    activeBadge,
    activeSort,
    activeFit,
    activeFabric,
    activePrice,
  ]);

  if (isLoading) {
    return (
      <main className="pt-20 lg:pt-24 min-h-screen flex items-center justify-center text-muted-foreground gap-2">
        <Loader2 size={20} className="animate-spin" />
        <span className="text-sm">Loading collection…</span>
      </main>
    );
  }

  const hasFilters =
    activeSection || activeCategory || activeBadge || activeFit || activeFabric || activePrice;

  const clearAll = () => {
    setActivePrice('');
    if (activeSection) {
      router.push(`/shop/${activeSection}`);
      return;
    }
    router.push('/shop');
  };

  const FilterChip = ({
    label,
    active,
    onClick,
  }: {
    label: string;
    active: boolean;
    onClick: () => void;
  }) => (
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
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10"
        >
          <h1 className="font-heading text-3xl lg:text-4xl mb-2">
            {activeBadge
              ? activeBadge === 'New Arrival'
                ? 'New Arrivals'
                : activeBadge
              : activeSort === 'popular'
                ? 'Top Selling'
                : activeSection
                  ? `${sections.find((section) => section.id === activeSection)?.name || 'Shop'}${
                      activeCategory
                        ? ` — ${categories.find((category) => category.id === activeCategory)?.name || ''}`
                        : ''
                    }`
                  : activeCategory
                    ? categories.find((category) => category.id === activeCategory)?.name || 'Shop'
                    : 'All Collections'}
          </h1>
          <p className="text-sm text-muted-foreground">
            {filtered.length} {filtered.length === 1 ? 'piece' : 'pieces'}
          </p>
        </motion.div>

        <div className="flex items-center justify-between mb-6 lg:mb-10">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 text-sm font-medium text-foreground transition-smooth hover-gold lg:hidden"
          >
            <SlidersHorizontal size={16} />
            Filters
          </button>
          {hasFilters && (
            <button
              onClick={clearAll}
              className="flex items-center gap-1 text-xs text-muted-foreground transition-smooth hover-gold"
            >
              Clear all <X size={12} />
            </button>
          )}
        </div>

        <motion.div
          initial={false}
          animate={{
            height: showFilters ? 'auto' : 0,
            opacity: showFilters ? 1 : 0,
          }}
          className="overflow-hidden lg:!h-auto lg:!opacity-100 mb-8 lg:mb-12"
        >
          <div className="space-y-6 pb-6 border-b border-border">
            <div>
              <p className="text-xs font-body font-semibold letter-wide uppercase text-muted-foreground mb-3">
                Section
              </p>
              <div className="flex flex-wrap gap-2">
                {sections.map((section) => (
                  <FilterChip
                    key={section.id}
                    label={section.name}
                    active={activeSection === section.id}
                    onClick={() => navigateToSection(section.id)}
                  />
                ))}
              </div>
            </div>

            <div>
              <p className="text-xs font-body font-semibold letter-wide uppercase text-muted-foreground mb-3">
                Category
              </p>
              <div className="flex flex-wrap gap-2">
                {visibleCategories.map((category) => (
                  <FilterChip
                    key={category.id}
                    label={category.name}
                    active={activeCategory === category.id}
                    onClick={() => updateQueryParam('category', category.id)}
                  />
                ))}
              </div>
            </div>

            <div>
              <p className="text-xs font-body font-semibold letter-wide uppercase text-muted-foreground mb-3">
                Fit
              </p>
              <div className="flex flex-wrap gap-2">
                {fits.map((fit) => (
                  <FilterChip
                    key={fit}
                    label={fit}
                    active={activeFit === fit}
                    onClick={() => updateQueryParam('fit', fit)}
                  />
                ))}
              </div>
            </div>

            <div>
              <p className="text-xs font-body font-semibold letter-wide uppercase text-muted-foreground mb-3">
                Fabric
              </p>
              <div className="flex flex-wrap gap-2">
                {fabrics.map((fabric) => (
                  <FilterChip
                    key={fabric}
                    label={fabric}
                    active={activeFabric === fabric}
                    onClick={() => updateQueryParam('fabric', fabric)}
                  />
                ))}
              </div>
            </div>

            <div>
              <p className="text-xs font-body font-semibold letter-wide uppercase text-muted-foreground mb-3">
                Price
              </p>
              <div className="flex flex-wrap gap-2">
                {priceRanges.map((range) => (
                  <FilterChip
                    key={range.label}
                    label={range.label}
                    active={activePrice === range.label}
                    onClick={() => setActivePrice(activePrice === range.label ? '' : range.label)}
                  />
                ))}
              </div>
            </div>
          </div>
        </motion.div>

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
              {filtered.slice(0, visibleCount).map((product, index) => (
                <ProductCard key={product.id} product={product} index={index} />
              ))}
            </div>
            {visibleCount < filtered.length && (
              <div className="text-center mt-12">
                <button
                  onClick={() => setVisibleCount((count) => count + 8)}
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
