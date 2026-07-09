"use client";

import { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Sparkles, Crown, TrendingUp, ChevronDown, Mail } from 'lucide-react';
import useEmblaCarousel from 'embla-carousel-react';
import { toast } from 'sonner';
import { useProducts } from '@/context/ProductsContext';
import { useHomepage } from '@/context/HomepageContext';
import { useRecentlyViewed } from '@/hooks/useRecentlyViewed';
import { newsletterApi } from '@/lib/api/newsletter.api';
import { resolveHeroImageUrl } from '@/lib/homepage-images';
import { NAV_OFFSET } from '@/components/layout/PageShell';
import { CampaignCards } from '@/components/CampaignBanner';
import ProductCard from '@/components/ProductCard';
import { SectionHeader } from '@/components/home/SectionHeader';
import { HomePageSkeleton } from '@/components/home/HomePageSkeleton';
import { TrustBar } from '@/components/home/TrustBar';
import { QuickShopLinks } from '@/components/home/QuickShopLinks';

const SLIDE_DURATION = 6000;

function CarouselNav({
  onPrev,
  onNext,
  canPrev,
  canNext,
}: {
  onPrev: () => void;
  onNext: () => void;
  canPrev: boolean;
  canNext: boolean;
}) {
  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={onPrev}
        disabled={!canPrev}
        className="w-10 h-10 flex items-center justify-center border border-border text-foreground disabled:opacity-30 transition-smooth hover:bg-foreground hover:text-background"
        aria-label="Previous"
      >
        <ArrowRight size={16} className="rotate-180" />
      </button>
      <button
        type="button"
        onClick={onNext}
        disabled={!canNext}
        className="w-10 h-10 flex items-center justify-center border border-border text-foreground disabled:opacity-30 transition-smooth hover:bg-foreground hover:text-background"
        aria-label="Next"
      >
        <ArrowRight size={16} />
      </button>
    </div>
  );
}

function NewArrivalsSection() {
  const { products } = useProducts();
  const newArrivals = products.filter((p) => p.badge === 'New Arrival');
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, align: 'start', slidesToScroll: 1 });
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    if (!emblaApi) return;
    const onSelect = () => {
      setCanPrev(emblaApi.canScrollPrev());
      setCanNext(emblaApi.canScrollNext());
    };
    onSelect();
    emblaApi.on('select', onSelect);
    emblaApi.on('reInit', onSelect);
    return () => {
      emblaApi.off('select', onSelect);
    };
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi || isHovered) return;
    const interval = setInterval(() => emblaApi.scrollNext(), 4500);
    return () => clearInterval(interval);
  }, [emblaApi, isHovered]);

  if (newArrivals.length === 0) return null;

  return (
    <section className="py-16 lg:py-24 bg-gradient-to-b from-cream to-background relative overflow-hidden">
      <div className="absolute top-12 right-12 opacity-[0.04] pointer-events-none">
        <Sparkles className="w-64 h-64 text-gold" />
      </div>
      <div className="container mx-auto px-6 lg:px-12">
        <SectionHeader
          eyebrow="Just Dropped"
          icon={Sparkles}
          title="New Arrivals"
          description="Fresh additions to elevate your wardrobe — curated with intention."
          viewAllHref="/shop?badge=New+Arrival"
          actions={
            <CarouselNav
              onPrev={() => emblaApi?.scrollPrev()}
              onNext={() => emblaApi?.scrollNext()}
              canPrev={canPrev}
              canNext={canNext}
            />
          }
        />

        <div
          ref={emblaRef}
          className="overflow-hidden"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          onFocus={() => setIsHovered(true)}
          onBlur={() => setIsHovered(false)}
        >
          <div className="flex -ml-6">
            {newArrivals.map((product) => (
              <div key={product.id} className="flex-none w-[72%] sm:w-[46%] lg:w-[28%] pl-6">
                <ProductCard product={product} animate={false} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function TopSellingSection() {
  const { products } = useProducts();
  const topSelling = [...products].sort((a, b) => b.reviews - a.reviews).slice(0, 4);

  if (topSelling.length === 0) return null;

  return (
    <section className="py-16 lg:py-24">
      <div className="container mx-auto px-6 lg:px-12">
        <SectionHeader
          eyebrow="Most Popular"
          icon={TrendingUp}
          title="Top Selling"
          description="Our most loved pieces — chosen by hundreds of customers."
          align="center"
          viewAllHref="/shop?sort=popular"
        />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {topSelling.map((product, i) => (
            <ProductCard
              key={product.id}
              product={product}
              index={i}
              rank={i + 1}
              showRating
            />
          ))}
        </div>
      </div>
    </section>
  );
}

function PremiumSection() {
  const { products } = useProducts();
  const premiumProducts = products.filter((p) => p.badge === 'Premium' || p.price >= 150).slice(0, 3);
  const heroProduct = premiumProducts[0];
  const sideProducts = premiumProducts.slice(1, 3);

  if (!heroProduct) return null;

  return (
    <section className="py-16 lg:py-24 bg-foreground text-background overflow-hidden">
      <div className="container mx-auto px-6 lg:px-12">
        <SectionHeader
          eyebrow="Exclusive Edit"
          icon={Crown}
          title="Premium Collection"
          description="Elevated pieces for those who demand nothing less than exceptional."
          variant="inverted"
        />

        <div className="grid lg:grid-cols-2 gap-6 lg:gap-8">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <Link href={`/product/${heroProduct.id}`} className="group block relative aspect-[3/4] overflow-hidden">
              <img
                src={heroProduct.images[0]}
                alt={heroProduct.name}
                className="w-full h-full object-cover transition-smooth group-hover:scale-105"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 via-foreground/20 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-6 lg:p-8">
                <span className="text-[10px] font-body font-semibold letter-wide uppercase text-gold mb-2 block">
                  Premium
                </span>
                <h3 className="font-heading text-2xl lg:text-3xl text-background mb-2">{heroProduct.name}</h3>
                <p className="text-sm text-background/60 mb-4 line-clamp-2">{heroProduct.description}</p>
                <div className="flex items-center gap-4">
                  <span className="text-lg font-medium text-background">${heroProduct.price}</span>
                  {heroProduct.originalPrice && (
                    <span className="text-sm text-background/40 line-through">${heroProduct.originalPrice}</span>
                  )}
                  <span className="ml-auto inline-flex items-center gap-1 text-xs text-gold">
                    Shop Now <ArrowRight size={12} />
                  </span>
                </div>
              </div>
            </Link>
          </motion.div>

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
                  <div className="w-36 sm:w-40 h-44 sm:h-48 flex-none overflow-hidden bg-background/10">
                    <img
                      src={product.images[0]}
                      alt={product.name}
                      className="w-full h-full object-cover transition-smooth group-hover:scale-105"
                      loading="lazy"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-[10px] font-body font-semibold letter-wide uppercase text-gold block mb-1">
                      Premium
                    </span>
                    <h3 className="text-base font-body font-medium text-background group-hover:text-gold transition-smooth mb-1">
                      {product.name}
                    </h3>
                    <p className="text-xs text-background/40 line-clamp-2 mb-3">{product.description}</p>
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

function HeroFallback() {
  return (
    <section className="relative min-h-[100svh] flex items-center bg-secondary">
      <div className="absolute inset-0 bg-gradient-to-br from-foreground/10 to-transparent" />
      <div className={`relative container mx-auto px-6 lg:px-12 py-12 ${NAV_OFFSET}`}>
        <p className="text-xs font-body font-medium letter-wider uppercase text-muted-foreground mb-4">
          Luxe Maison
        </p>
        <h1 className="font-heading text-4xl lg:text-6xl font-semibold leading-tight mb-6 max-w-xl">
          Timeless style, thoughtfully curated
        </h1>
        <p className="text-sm lg:text-base text-muted-foreground leading-relaxed mb-8 max-w-md">
          Discover premium essentials and statement pieces for every occasion.
        </p>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/shop"
            className="inline-flex items-center gap-3 px-8 py-3.5 bg-primary text-primary-foreground text-sm font-medium letter-wide uppercase transition-smooth hover:opacity-90"
          >
            Shop Collection <ArrowRight size={16} />
          </Link>
          <Link
            href="/shop?badge=New+Arrival"
            className="inline-flex items-center gap-2 px-8 py-3.5 border border-border text-sm font-medium letter-wide uppercase transition-smooth hover:border-gold hover:text-gold"
          >
            New Arrivals
          </Link>
        </div>
      </div>
    </section>
  );
}

export default function HomePage() {
  const { products, getProductById, isLoading: productsLoading } = useProducts();
  const { content: homepage, isLoading: homepageLoading } = useHomepage();
  const featuredProducts = products.filter((product) => product.badge).slice(0, 4);
  const { viewedIds } = useRecentlyViewed();
  const recentlyViewed = viewedIds.map((id) => getProductById(id)).filter(Boolean).slice(0, 4);

  const heroSlides = useMemo(
    () =>
      (homepage?.heroSlides ?? [])
        .filter((slide) => slide.enabled)
        .sort((a, b) => a.sortOrder - b.sortOrder),
    [homepage],
  );

  const categoryTiles = useMemo(
    () =>
      (homepage?.categoryTiles ?? [])
        .filter((tile) => tile.enabled)
        .sort((a, b) => a.sortOrder - b.sortOrder),
    [homepage],
  );

  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [isSubscribing, setIsSubscribing] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduceMotion(mq.matches);
    const handler = (e: MediaQueryListEvent) => setReduceMotion(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  const nextSlide = useCallback(() => {
    if (heroSlides.length === 0) return;
    setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
  }, [heroSlides.length]);

  useEffect(() => {
    setCurrentSlide(0);
  }, [heroSlides.length]);

  useEffect(() => {
    if (isPaused || heroSlides.length <= 1 || reduceMotion) return;
    const timer = setInterval(nextSlide, SLIDE_DURATION);
    return () => clearInterval(timer);
  }, [isPaused, nextSlide, heroSlides.length, reduceMotion]);

  const handleNewsletterSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const email = newsletterEmail.trim();
    if (!email) return;

    setIsSubscribing(true);
    try {
      const result = await newsletterApi.subscribe({ email });
      if ('message' in result) {
        toast.success(result.message);
      } else {
        toast.success('Welcome to the inner circle.');
      }
      setNewsletterEmail('');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Unable to subscribe right now.');
    } finally {
      setIsSubscribing(false);
    }
  };

  if (homepageLoading || productsLoading) {
    return <HomePageSkeleton />;
  }

  const slide = heroSlides[currentSlide];
  const slideDuration = reduceMotion ? 0.3 : 1.2;

  return (
    <main>
      {slide ? (
        <section
          className="relative min-h-[100svh] flex items-center overflow-hidden"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          onFocus={() => setIsPaused(true)}
          onBlur={() => setIsPaused(false)}
          aria-roledescription="carousel"
          aria-label="Featured collections"
        >
          <AnimatePresence mode="sync">
            <motion.img
              key={currentSlide}
              src={resolveHeroImageUrl(slide)}
              alt={slide.title}
              className="absolute inset-0 w-full h-full object-cover object-top sm:object-[center_20%] lg:object-[center_30%]"
              initial={reduceMotion ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={reduceMotion ? undefined : { opacity: 0 }}
              transition={{ duration: slideDuration, ease: 'easeInOut' }}
            />
          </AnimatePresence>
          <div className="absolute inset-0 bg-gradient-to-r from-foreground/70 via-foreground/40 to-transparent" />
          <div className={`relative container mx-auto px-6 lg:px-12 py-8 ${NAV_OFFSET}`}>
            <AnimatePresence mode="wait">
              <motion.div
                key={currentSlide}
                initial={reduceMotion ? false : { opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={reduceMotion ? undefined : { opacity: 0 }}
                transition={{ duration: 0.5 }}
                className="max-w-xl"
              >
                <p className="text-xs font-body font-medium letter-wider uppercase text-background/70 mb-4">
                  {slide.eyebrow}
                </p>
                <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-semibold text-background leading-tight mb-5 text-balance">
                  {slide.title}
                  {slide.titleHighlight && (
                    <>
                      <br />
                      <span className="italic">{slide.titleHighlight}</span>
                    </>
                  )}
                </h1>
                <p className="text-sm lg:text-base text-background/85 leading-relaxed mb-8 max-w-md">
                  {slide.description}
                </p>
                <div className="flex flex-wrap gap-3">
                  <Link
                    href={slide.ctaLink}
                    className="inline-flex items-center gap-3 px-8 py-3.5 bg-primary text-primary-foreground text-sm font-medium letter-wide uppercase transition-smooth hover:opacity-90"
                  >
                    {slide.ctaText} <ArrowRight size={16} />
                  </Link>
                  <Link
                    href="/shop"
                    className="inline-flex items-center gap-2 px-8 py-3.5 border border-background/40 text-background text-sm font-medium letter-wide uppercase transition-smooth hover:bg-background/10"
                  >
                    Shop All
                  </Link>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {heroSlides.length > 1 && (
            <div className="absolute bottom-20 lg:bottom-24 left-1/2 -translate-x-1/2 flex items-center gap-3">
              {heroSlides.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setCurrentSlide(i)}
                  className="group relative h-6 flex items-center"
                  aria-label={`Go to slide ${i + 1}`}
                  aria-current={currentSlide === i ? 'true' : undefined}
                >
                  <span className="block w-8 h-[2px] bg-background/30 rounded-full overflow-hidden">
                    <motion.span
                      className="block h-full bg-background rounded-full"
                      initial={{ width: '0%' }}
                      animate={{ width: currentSlide === i ? '100%' : '0%' }}
                      transition={{
                        duration: currentSlide === i && !reduceMotion ? SLIDE_DURATION / 1000 : 0.3,
                        ease: 'linear',
                      }}
                    />
                  </span>
                </button>
              ))}
            </div>
          )}

          <a
            href="#shop-categories"
            className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 text-background/60 hover:text-background transition-smooth"
            aria-label="Scroll to shop categories"
          >
            <span className="text-[10px] letter-wider uppercase">Explore</span>
            <ChevronDown size={18} className="animate-bounce" />
          </a>
        </section>
      ) : (
        <HeroFallback />
      )}

      <TrustBar />
      <QuickShopLinks />

      <CampaignCards />
      <NewArrivalsSection />

      {categoryTiles.length > 0 && (
        <section id="shop-categories" className="py-16 lg:py-24 scroll-mt-24">
          <div className="container mx-auto px-6 lg:px-12">
            <SectionHeader
              eyebrow={homepage?.categoriesSection.eyebrow}
              title={homepage?.categoriesSection.title ?? 'Shop by Category'}
              align="center"
            />
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
              {categoryTiles.map((cat, i) => (
                <motion.div
                  key={cat.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08 }}
                >
                  <Link href={cat.link} className="group block relative aspect-[3/4] overflow-hidden">
                    <img
                      src={cat.imageUrl}
                      alt={cat.name}
                      className="w-full h-full object-cover transition-smooth group-hover:scale-105"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 via-foreground/10 to-transparent group-hover:from-foreground/70 transition-smooth" />
                    <div className="absolute bottom-0 left-0 right-0 p-5">
                      <h3 className="font-heading text-lg text-background">{cat.name}</h3>
                      <p className="text-xs text-background/75 mt-1 line-clamp-2">{cat.description}</p>
                      <span className="inline-flex items-center gap-1 mt-3 text-[11px] font-medium letter-wide uppercase text-gold opacity-0 translate-y-1 group-hover:opacity-100 group-hover:translate-y-0 transition-smooth">
                        Shop now <ArrowRight size={12} />
                      </span>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      <TopSellingSection />

      {featuredProducts.length > 0 && (
        <section className="py-16 lg:py-24 bg-secondary">
          <div className="container mx-auto px-6 lg:px-12">
            <SectionHeader
              eyebrow="Curated for You"
              title="Featured Pieces"
              viewAllHref="/shop"
            />
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
              {featuredProducts.map((product, i) => (
                <ProductCard key={product.id} product={product} index={i} />
              ))}
            </div>
          </div>
        </section>
      )}

      <PremiumSection />

      {recentlyViewed.length > 0 && (
        <section className="py-16 lg:py-24">
          <div className="container mx-auto px-6 lg:px-12">
            <SectionHeader
              eyebrow="Your Browsing History"
              title="Recently Viewed"
            />
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
              {recentlyViewed.map((product, i) => (
                <ProductCard key={product!.id} product={product!} index={i} />
              ))}
            </div>
          </div>
        </section>
      )}

      {homepage?.storySection && (
        <section className="py-16 lg:py-24 border-t border-border">
          <div className="container mx-auto px-6 lg:px-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center max-w-2xl mx-auto"
            >
              <p className="text-xs font-body font-medium letter-wider uppercase text-muted-foreground mb-4">
                {homepage.storySection.eyebrow}
              </p>
              <h2 className="font-heading text-3xl lg:text-4xl italic mb-6 text-balance">
                {homepage.storySection.title}
              </h2>
              <p className="text-sm text-muted-foreground leading-relaxed mb-8">
                {homepage.storySection.description}
              </p>
              <Link
                href={homepage.storySection.ctaLink}
                className="inline-flex items-center gap-2 text-sm font-medium text-foreground underline underline-offset-4 transition-smooth hover-gold"
              >
                {homepage.storySection.ctaText} <ArrowRight size={14} />
              </Link>
            </motion.div>
          </div>
        </section>
      )}

      {homepage?.newsletterSection && (
        <section className="py-16 lg:py-20 bg-foreground" aria-labelledby="newsletter-heading">
          <div className="container mx-auto px-6 lg:px-12 text-center">
            <div className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-background/10 text-gold mb-4">
              <Mail size={18} aria-hidden />
            </div>
            <h2 id="newsletter-heading" className="font-heading text-2xl lg:text-3xl text-background mb-3">
              {homepage.newsletterSection.title}
            </h2>
            <p className="text-sm text-background/60 mb-8 max-w-md mx-auto">
              {homepage.newsletterSection.description}
            </p>
            <form
              onSubmit={handleNewsletterSubmit}
              className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto"
              aria-live="polite"
            >
              <label htmlFor="newsletter-email" className="sr-only">
                Email address
              </label>
              <input
                id="newsletter-email"
                type="email"
                value={newsletterEmail}
                onChange={(event) => setNewsletterEmail(event.target.value)}
                placeholder={homepage.newsletterSection.placeholder}
                required
                autoComplete="email"
                className="flex-1 px-5 py-3 bg-background/10 border border-background/20 text-background placeholder:text-background/40 text-sm focus:outline-none focus:border-primary rounded-sm"
              />
              <button
                type="submit"
                disabled={isSubscribing}
                className="px-8 py-3 bg-primary text-primary-foreground text-sm font-medium letter-wide uppercase transition-smooth hover:opacity-90 disabled:opacity-60 rounded-sm"
              >
                {isSubscribing ? 'Subscribing…' : homepage.newsletterSection.buttonText}
              </button>
            </form>
          </div>
        </section>
      )}
    </main>
  );
}
