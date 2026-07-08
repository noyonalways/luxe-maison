"use client";

import { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { ArrowRight, Star, Sparkles, Crown, TrendingUp } from 'lucide-react';
import useEmblaCarousel from 'embla-carousel-react';
import { useProducts } from '@/context/ProductsContext';
import { useRecentlyViewed } from '@/hooks/useRecentlyViewed';
import { CampaignCards } from '@/components/CampaignBanner';
import ProductCard from '@/components/ProductCard';
import heroImg1 from '@/assets/hero-collection.jpg';
import heroImg2 from '@/assets/hero-slide-2.jpg';
import heroImg3 from '@/assets/hero-slide-3.jpg';
import catPunjabi from '@/assets/category-punjabi.jpg';
import catShirts from '@/assets/category-shirts.jpg';
import catTshirts from '@/assets/category-tshirts.jpg';
import catPants from '@/assets/category-pants.jpg';

import type { StaticImageData } from 'next/image';

const heroSlides = [
  {
    image: heroImg1.src,
    season: 'Spring / Summer 2026',
    title: <>The Art of<br />Refined Dressing</>,
    description: 'Discover our curated collection of premium traditional and contemporary menswear, crafted with exceptional fabrics.',
    cta: 'Explore Collection',
  },
  {
    image: heroImg2.src,
    season: 'Exclusive Collection',
    title: <>Elegance in<br />Every Detail</>,
    description: 'Handcrafted silhouettes that embody sophistication — from the finest silk kurtas to perfectly tailored ensembles.',
    cta: 'Shop New Arrivals',
  },
  {
    image: heroImg3.src,
    season: 'The Gentleman\'s Edit',
    title: <>Crafted for the<br />Modern Connoisseur</>,
    description: 'Premium fabrics, meticulous stitching, and timeless accessories — curated for those who appreciate the finer things.',
    cta: 'Discover More',
  },
];

const SLIDE_DURATION = 6000;

const categoryImages: Record<string, string> = {
  punjabi: catPunjabi.src,
  shirt: catShirts.src,
  tshirt: catTshirts.src,
  pants: catPants.src,
};

const categoryData = [
  { id: 'punjabi', name: 'Punjabi', desc: 'Traditional elegance' },
  { id: 'shirt', name: 'Shirts', desc: 'Refined essentials' },
  { id: 'tshirt', name: 'T-Shirts', desc: 'Luxury basics' },
  { id: 'pants', name: 'Pants', desc: 'Tailored perfection' },
];

/* ── New Arrivals Carousel ── */
function NewArrivalsSection() {
  const { products } = useProducts();
  const newArrivals = products.filter(p => p.badge === 'New Arrival');
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, align: 'start', slidesToScroll: 1 });
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(false);

  useEffect(() => {
    if (!emblaApi) return;
    const onSelect = () => {
      setCanPrev(emblaApi.canScrollPrev());
      setCanNext(emblaApi.canScrollNext());
    };
    onSelect();
    emblaApi.on('select', onSelect);
    emblaApi.on('reInit', onSelect);

    // Auto-scroll
    const interval = setInterval(() => emblaApi.scrollNext(), 4000);
    return () => { clearInterval(interval); emblaApi.off('select', onSelect); };
  }, [emblaApi]);

  if (newArrivals.length === 0) return null;

  return (
    <section className="py-20 lg:py-28 bg-gradient-to-b from-cream to-background relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-12 right-12 opacity-[0.04]">
        <Sparkles className="w-64 h-64 text-gold" />
      </div>
      <div className="container mx-auto px-6 lg:px-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex flex-col md:flex-row items-end justify-between mb-12 gap-4"
        >
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Sparkles size={14} className="text-gold" />
              <p className="text-xs font-body font-medium letter-wider uppercase text-gold">Just Dropped</p>
            </div>
            <h2 className="font-heading text-3xl lg:text-4xl">New Arrivals</h2>
            <p className="text-sm text-muted-foreground mt-2 max-w-md">Fresh additions to elevate your wardrobe — curated with intention.</p>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/shop?badge=New+Arrival" className="text-sm font-medium text-foreground underline underline-offset-4 transition-smooth hover-gold hidden sm:flex items-center gap-1">
              View All <ArrowRight size={14} />
            </Link>
            <button
              onClick={() => emblaApi?.scrollPrev()}
              disabled={!canPrev}
              className="w-10 h-10 flex items-center justify-center border border-border text-foreground disabled:opacity-30 transition-smooth hover:bg-foreground hover:text-background"
              aria-label="Previous"
            >
              <ArrowRight size={16} className="rotate-180" />
            </button>
            <button
              onClick={() => emblaApi?.scrollNext()}
              disabled={!canNext}
              className="w-10 h-10 flex items-center justify-center border border-border text-foreground disabled:opacity-30 transition-smooth hover:bg-foreground hover:text-background"
              aria-label="Next"
            >
              <ArrowRight size={16} />
            </button>
          </div>
        </motion.div>

        <div ref={emblaRef} className="overflow-hidden">
          <div className="flex -ml-6">
            {newArrivals.map((product, i) => (
              <div key={product.id} className="flex-none w-[70%] sm:w-[45%] lg:w-[28%] pl-6">
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                >
                  <Link href={`/product/${product.id}`} className="group block">
                    <div className="relative aspect-[3/4] overflow-hidden bg-secondary mb-4">
                      <img
                        src={product.images[0]}
                        alt={product.name}
                        className="w-full h-full object-cover transition-smooth group-hover:scale-105"
                        loading="lazy"
                      />
                      <div className="absolute top-3 left-3 px-3 py-1 text-[10px] font-body font-semibold letter-wide uppercase bg-gold text-primary-foreground flex items-center gap-1">
                        <Sparkles size={10} /> New
                      </div>
                      <div className="absolute bottom-3 left-3 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-smooth">
                        {product.colors.map(c => (
                          <span key={c.name} className="w-4 h-4 rounded-full border border-background/50 shadow-sm" style={{ backgroundColor: c.hex }} />
                        ))}
                      </div>
                    </div>
                    <h3 className="text-sm font-body font-medium text-foreground group-hover:text-gold transition-smooth">{product.name}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-sm font-medium">${product.price}</span>
                      {product.originalPrice && <span className="text-xs text-muted-foreground line-through">${product.originalPrice}</span>}
                    </div>
                  </Link>
                </motion.div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ── Top Selling Section ── */
function TopSellingSection() {
  const { products } = useProducts();
  const topSelling = [...products].sort((a, b) => b.reviews - a.reviews).slice(0, 4);
  const rankColors = ['from-gold to-gold-dark', 'from-muted-foreground to-charcoal', 'from-gold-light to-gold', 'from-muted-foreground to-charcoal-light'];

  return (
    <section className="py-20 lg:py-28">
      <div className="container mx-auto px-6 lg:px-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="flex items-center justify-center gap-2 mb-3">
            <TrendingUp size={14} className="text-gold" />
            <p className="text-xs font-body font-medium letter-wider uppercase text-gold">Most Popular</p>
          </div>
          <h2 className="font-heading text-3xl lg:text-4xl">Top Selling</h2>
          <p className="text-sm text-muted-foreground mt-2 max-w-md mx-auto">Our most loved pieces — chosen by hundreds of customers.</p>
          <Link href="/shop?sort=popular" className="inline-flex items-center gap-1 text-sm font-medium text-foreground underline underline-offset-4 transition-smooth hover-gold mt-4">
            View All <ArrowRight size={14} />
          </Link>
        </motion.div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {topSelling.map((product, i) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="relative"
            >
              <Link href={`/product/${product.id}`} className="group block">
                <div className="relative aspect-[3/4] overflow-hidden bg-secondary mb-4">
                  <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover transition-smooth group-hover:scale-105" loading="lazy" />
                  {/* Rank badge */}
                  <div className="absolute top-3 right-3 w-9 h-9 flex items-center justify-center bg-foreground text-background rounded-full shadow-lg">
                    <span className="text-xs font-bold">#{i + 1}</span>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-foreground/30 to-transparent" />
                </div>
                <div className="flex items-center gap-1 mb-1">
                  {Array.from({ length: 5 }).map((_, s) => (
                    <Star key={s} size={11} className={s < Math.round(product.rating) ? 'fill-gold text-gold' : 'text-border'} />
                  ))}
                  <span className="text-[10px] text-muted-foreground ml-1">({product.reviews})</span>
                </div>
                <h3 className="text-sm font-body font-medium text-foreground group-hover:text-gold transition-smooth">{product.name}</h3>
                <span className="text-sm font-medium mt-0.5 block">${product.price}</span>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── Premium Collection Section ── */
function PremiumSection() {
  const { products } = useProducts();
  const premiumProducts = products.filter(p => p.badge === 'Premium' || p.price >= 150).slice(0, 3);
  const heroProduct = premiumProducts[0];
  const sideProducts = premiumProducts.slice(1, 3);

  if (!heroProduct) return null;

  return (
    <section className="py-20 lg:py-28 bg-foreground text-background overflow-hidden">
      <div className="container mx-auto px-6 lg:px-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-12"
        >
          <div className="flex items-center gap-2 mb-3">
            <Crown size={14} className="text-gold" />
            <p className="text-xs font-body font-medium letter-wider uppercase text-gold">Exclusive Edit</p>
          </div>
          <h2 className="font-heading text-3xl lg:text-4xl text-background">Premium Collection</h2>
          <p className="text-sm text-background/50 mt-2 max-w-lg">Elevated pieces for those who demand nothing less than exceptional.</p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-6 lg:gap-8">
          {/* Hero product - large */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <Link href={`/product/${heroProduct.id}`} className="group block relative aspect-[3/4] overflow-hidden">
              <img src={heroProduct.images[0]} alt={heroProduct.name} className="w-full h-full object-cover transition-smooth group-hover:scale-105" loading="lazy" />
              <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 via-foreground/20 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-8">
                <span className="text-[10px] font-body font-semibold letter-wide uppercase text-gold mb-2 block">Premium</span>
                <h3 className="font-heading text-2xl lg:text-3xl text-background mb-2">{heroProduct.name}</h3>
                <p className="text-sm text-background/60 mb-4 line-clamp-2">{heroProduct.description}</p>
                <div className="flex items-center gap-4">
                  <span className="text-lg font-medium text-background">${heroProduct.price}</span>
                  {heroProduct.originalPrice && <span className="text-sm text-background/40 line-through">${heroProduct.originalPrice}</span>}
                  <span className="ml-auto inline-flex items-center gap-1 text-xs text-gold">
                    Shop Now <ArrowRight size={12} />
                  </span>
                </div>
              </div>
            </Link>
          </motion.div>

          {/* Side products */}
          <div className="grid gap-6">
            {sideProducts.map((product, i) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15, duration: 0.6 }}
              >
                <Link href={`/product/${product.id}`} className="group flex gap-6 items-center">
                  <div className="w-40 h-48 flex-none overflow-hidden bg-background/10">
                    <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover transition-smooth group-hover:scale-105" loading="lazy" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-[10px] font-body font-semibold letter-wide uppercase text-gold block mb-1">Premium</span>
                    <h3 className="text-base font-body font-medium text-background group-hover:text-gold transition-smooth mb-1">{product.name}</h3>
                    <p className="text-xs text-background/40 line-clamp-2 mb-3">{product.description}</p>
                    <div className="flex items-center gap-1 mb-2">
                      {Array.from({ length: 5 }).map((_, s) => (
                        <Star key={s} size={10} className={s < Math.round(product.rating) ? 'fill-gold text-gold' : 'text-background/20'} />
                      ))}
                    </div>
                    <span className="text-sm font-medium text-background">${product.price}</span>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ── Luxury Showcase Section ── */
function LuxuryShowcase() {
  const { products } = useProducts();
  const luxuryProduct = [...products].sort((a, b) => b.price - a.price)[0];
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  const y = useTransform(scrollYProgress, [0, 1], [60, -60]);
  const opacity = useTransform(scrollYProgress, [0, 0.3, 0.7, 1], [0, 1, 1, 0]);

  if (!luxuryProduct) return null;

  return (
    <section ref={ref} className="py-24 lg:py-36 relative overflow-hidden">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-cream to-background" />
      
      <div className="container mx-auto px-6 lg:px-12 relative">
        <motion.div style={{ opacity }} className="text-center mb-12">
          <div className="flex items-center justify-center gap-2 mb-3">
            <Crown size={14} className="text-gold" />
            <p className="text-xs font-body font-medium letter-wider uppercase text-gold">The Pinnacle</p>
          </div>
          <h2 className="font-heading text-3xl lg:text-5xl italic">Luxury Showcase</h2>
        </motion.div>

        <motion.div style={{ y }} className="max-w-4xl mx-auto">
          <Link href={`/product/${luxuryProduct.id}`} className="group block">
            <div className="relative overflow-hidden">
              {/* Large image with parallax */}
              <div className="aspect-[16/9] lg:aspect-[2/1] overflow-hidden">
                <img
                  src={luxuryProduct.images[0]}
                  alt={luxuryProduct.name}
                  className="w-full h-full object-cover transition-smooth group-hover:scale-[1.03]"
                  loading="lazy"
                />
              </div>
              {/* Overlay content */}
              <div className="absolute inset-0 bg-gradient-to-r from-foreground/70 via-foreground/30 to-transparent flex items-center">
                <div className="p-8 lg:p-14 max-w-md">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.7, delay: 0.2 }}
                  >
                    <span className="text-[10px] font-body font-semibold letter-wide uppercase text-gold mb-3 block">Signature Piece</span>
                    <h3 className="font-heading text-2xl lg:text-4xl text-background mb-3">{luxuryProduct.name}</h3>
                    <div className="flex items-center gap-1 mb-3">
                      {Array.from({ length: 5 }).map((_, s) => (
                        <Star key={s} size={13} className={s < Math.round(luxuryProduct.rating) ? 'fill-gold text-gold' : 'text-background/30'} />
                      ))}
                      <span className="text-xs text-background/50 ml-2">{luxuryProduct.reviews} reviews</span>
                    </div>
                    <p className="text-sm text-background/60 leading-relaxed mb-6 line-clamp-2">{luxuryProduct.description}</p>
                    <div className="flex items-center gap-6">
                      <span className="font-heading text-2xl text-background">${luxuryProduct.price}</span>
                      <span className="inline-flex items-center gap-2 px-6 py-2.5 bg-gold text-primary-foreground text-xs font-medium letter-wide uppercase transition-smooth group-hover:opacity-90">
                        Discover <ArrowRight size={12} />
                      </span>
                    </div>
                  </motion.div>
                </div>
              </div>
            </div>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}

export default function HomePage() {
  const { products, getProductById } = useProducts();
  const featuredProducts = products.filter(p => p.badge).slice(0, 4);
  const { viewedIds } = useRecentlyViewed();
  const recentlyViewed = viewedIds.map(id => getProductById(id)).filter(Boolean).slice(0, 4);

  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const nextSlide = useCallback(() => {
    setCurrentSlide(prev => (prev + 1) % heroSlides.length);
  }, []);

  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(nextSlide, SLIDE_DURATION);
    return () => clearInterval(timer);
  }, [isPaused, nextSlide]);

  const slide = heroSlides[currentSlide];

  return (
    <main>
      {/* Hero — Auto-fading Slideshow */}
      <section
        className="relative h-[90vh] lg:h-screen flex items-center overflow-hidden"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        <AnimatePresence mode="sync">
          <motion.img
            key={currentSlide}
            src={slide.image}
            alt={typeof slide.title === 'string' ? slide.title : 'Hero'}
            className="absolute inset-0 w-full h-full object-cover"
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.2, ease: 'easeInOut' }}
          />
        </AnimatePresence>
        <div className="absolute inset-0 bg-gradient-to-r from-foreground/65 via-foreground/35 to-transparent" />
        <div className="relative container mx-auto px-6 lg:px-12">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentSlide}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.6 }}
              className="max-w-lg"
            >
              <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.3 }} className="text-xs font-body font-medium letter-wider uppercase text-background/70 mb-4">{slide.season}</motion.p>
              <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.4 }} className="font-heading text-4xl lg:text-6xl font-semibold text-background leading-tight mb-6">{slide.title}</motion.h1>
              <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.55 }} className="text-sm lg:text-base text-background/80 leading-relaxed mb-8 max-w-sm">{slide.description}</motion.p>
              <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.7 }}>
                <Link href="/shop" className="inline-flex items-center gap-3 px-8 py-3.5 bg-primary text-primary-foreground text-sm font-medium letter-wide uppercase transition-smooth hover:opacity-90">
                  {slide.cta} <ArrowRight size={16} />
                </Link>
              </motion.div>
            </motion.div>
          </AnimatePresence>
        </div>
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-3">
          {heroSlides.map((_, i) => (
            <button key={i} onClick={() => setCurrentSlide(i)} className="group relative h-6 flex items-center" aria-label={`Go to slide ${i + 1}`}>
              <span className="block w-8 h-[2px] bg-background/30 rounded-full overflow-hidden">
                <motion.span className="block h-full bg-background rounded-full" initial={{ width: '0%' }} animate={{ width: currentSlide === i ? '100%' : '0%' }} transition={{ duration: currentSlide === i ? SLIDE_DURATION / 1000 : 0.3, ease: 'linear' }} />
              </span>
            </button>
          ))}
        </div>
      </section>

      {/* Active Campaigns */}
      <CampaignCards />

      {/* New Arrivals */}
      <NewArrivalsSection />

      {/* Categories */}
      <section className="py-20 lg:py-32">
        <div className="container mx-auto px-6 lg:px-12">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
            <p className="text-xs font-body font-medium letter-wider uppercase text-muted-foreground mb-3">Collections</p>
            <h2 className="font-heading text-3xl lg:text-4xl">Shop by Category</h2>
          </motion.div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
            {categoryData.map((cat, i) => (
              <motion.div key={cat.id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}>
                <Link href={`/shop?category=${cat.id}`} className="group block relative aspect-[3/4] overflow-hidden">
                  <img src={categoryImages[cat.id]} alt={cat.name} className="w-full h-full object-cover transition-smooth group-hover:scale-105" loading="lazy" />
                  <div className="absolute inset-0 bg-gradient-to-t from-foreground/50 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-5">
                    <h3 className="font-heading text-lg text-background">{cat.name}</h3>
                    <p className="text-xs text-background/70 mt-1">{cat.desc}</p>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Top Selling */}
      <TopSellingSection />

      {/* Featured */}
      <section className="py-20 lg:py-32 bg-secondary">
        <div className="container mx-auto px-6 lg:px-12">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="flex flex-col md:flex-row items-end justify-between mb-16 gap-4">
            <div>
              <p className="text-xs font-body font-medium letter-wider uppercase text-muted-foreground mb-3">Curated for You</p>
              <h2 className="font-heading text-3xl lg:text-4xl">Featured Pieces</h2>
            </div>
            <Link href="/shop" className="text-sm font-medium text-foreground underline underline-offset-4 transition-smooth hover-gold flex items-center gap-1">
              View All <ArrowRight size={14} />
            </Link>
          </motion.div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
            {featuredProducts.map((product, i) => (
              <ProductCard key={product.id} product={product} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* Premium Collection */}
      <PremiumSection />

      {/* Luxury Showcase */}
      <LuxuryShowcase />

      {/* Recently Viewed */}
      {recentlyViewed.length > 0 && (
        <section className="py-20 lg:py-32">
          <div className="container mx-auto px-6 lg:px-12">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mb-12">
              <p className="text-xs font-body font-medium letter-wider uppercase text-muted-foreground mb-3">Your Browsing History</p>
              <h2 className="font-heading text-3xl lg:text-4xl">Recently Viewed</h2>
            </motion.div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
              {recentlyViewed.map((product, i) => (
                <ProductCard key={product!.id} product={product!} index={i} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Story banner */}
      <section className="py-20 lg:py-32">
        <div className="container mx-auto px-6 lg:px-12">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center max-w-2xl mx-auto">
            <p className="text-xs font-body font-medium letter-wider uppercase text-muted-foreground mb-4">Our Philosophy</p>
            <h2 className="font-heading text-3xl lg:text-4xl italic mb-6">"Where tradition meets contemporary craft"</h2>
            <p className="text-sm text-muted-foreground leading-relaxed mb-8">
              Every piece in our collection is crafted with intention — premium fabrics, thoughtful construction, and timeless design that transcends seasons.
            </p>
            <Link href="/shop" className="inline-flex items-center gap-2 text-sm font-medium text-foreground underline underline-offset-4 transition-smooth hover-gold">
              Discover Our Story <ArrowRight size={14} />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="py-20 lg:py-24 bg-foreground">
        <div className="container mx-auto px-6 lg:px-12 text-center">
          <h2 className="font-heading text-2xl lg:text-3xl text-background mb-3">Join the Inner Circle</h2>
          <p className="text-sm text-background/60 mb-8 max-w-md mx-auto">
            Be the first to access new collections, exclusive offers, and styling insights.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <input
              type="email"
              placeholder="Your email address"
              className="flex-1 px-5 py-3 bg-background/10 border border-background/20 text-background placeholder:text-background/40 text-sm focus:outline-none focus:border-primary"
            />
            <button className="px-8 py-3 bg-primary text-primary-foreground text-sm font-medium letter-wide uppercase transition-smooth hover:opacity-90">
              Subscribe
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}
