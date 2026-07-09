import type { HomepageContent, HeroSlide } from '@luxe-maison/core';

export const defaultHomepageContent: HomepageContent = {
  heroSlides: [
    {
      id: 'hero-1',
      imageUrl: '/images/hero/hero-collection.jpg',
      eyebrow: 'Spring / Summer 2026',
      title: 'The Art of',
      titleHighlight: 'Refined Dressing',
      description:
        'Discover curated premium fashion for men, women, and kids — traditional and contemporary pieces crafted with exceptional fabrics.',
      ctaText: 'Explore Collection',
      ctaLink: '/shop',
      enabled: true,
      sortOrder: 0,
    },
    {
      id: 'hero-2',
      imageUrl: '/images/hero/hero-slide-2.jpg',
      eyebrow: 'Exclusive Collection',
      title: 'Elegance in',
      titleHighlight: 'Every Detail',
      description:
        'Handcrafted silhouettes that embody sophistication — from elegant Punjabi to perfectly tailored everyday essentials.',
      ctaText: 'Shop New Arrivals',
      ctaLink: '/shop?badge=New+Arrival',
      enabled: true,
      sortOrder: 1,
    },
    {
      id: 'hero-3',
      imageUrl: '/images/hero/hero-slide-3.jpg',
      eyebrow: 'All Collections',
      title: 'Crafted for',
      titleHighlight: 'Men, Women & Kids',
      description:
        'Premium fabrics, meticulous stitching, and timeless design — curated for every member of the family.',
      ctaText: 'Discover More',
      ctaLink: '/shop',
      enabled: true,
      sortOrder: 2,
    },
  ],
  categoriesSection: {
    eyebrow: 'Collections',
    title: 'Shop by Category',
  },
  categoryTiles: [
    {
      id: 'punjabi',
      name: 'Punjabi',
      description: 'Traditional elegance',
      imageUrl:
        'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=800&q=80',
      link: '/shop?category=punjabi',
      enabled: true,
      sortOrder: 0,
    },
    {
      id: 'shirt',
      name: 'Shirts',
      description: 'Refined essentials',
      imageUrl:
        'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=800&q=80',
      link: '/shop?category=shirt',
      enabled: true,
      sortOrder: 1,
    },
    {
      id: 'tshirt',
      name: 'T-Shirts',
      description: 'Luxury basics',
      imageUrl:
        'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&q=80',
      link: '/shop?category=tshirt',
      enabled: true,
      sortOrder: 2,
    },
    {
      id: 'pants',
      name: 'Pants',
      description: 'Tailored perfection',
      imageUrl:
        'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=800&q=80',
      link: '/shop?category=pants',
      enabled: true,
      sortOrder: 3,
    },
  ],
  storySection: {
    eyebrow: 'Our Philosophy',
    title: '"Where tradition meets contemporary craft"',
    description:
      'Every piece in our collection is crafted with intention — premium fabrics, thoughtful construction, and timeless design that transcends seasons.',
    ctaText: 'Discover Our Story',
    ctaLink: '/shop',
  },
  newsletterSection: {
    title: 'Join the Inner Circle',
    description:
      'Be the first to access new collections, exclusive offers, and styling insights.',
    placeholder: 'Your email address',
    buttonText: 'Subscribe',
  },
};

const SEED_HERO_BY_ID = Object.fromEntries(
  defaultHomepageContent.heroSlides.map((slide) => [slide.id, slide]),
) as Record<string, (typeof defaultHomepageContent.heroSlides)[number]>;

const LEGACY_HERO_TEXT: Record<string, Partial<HeroSlide>> = {
  'hero-1': {
    description:
      'Discover our curated collection of premium traditional and contemporary menswear, crafted with exceptional fabrics.',
  },
  'hero-2': {
    description:
      'Handcrafted silhouettes that embody sophistication — from the finest silk kurtas to perfectly tailored ensembles.',
  },
  'hero-3': {
    eyebrow: "The Gentleman's Edit",
    title: 'Crafted for the',
    titleHighlight: 'Modern Connoisseur',
    description:
      'Premium fabrics, meticulous stitching, and timeless accessories — curated for those who appreciate the finer things.',
    ctaLink: '/shop/men',
  },
};

function migrateHeroSlide(slide: HeroSlide): { slide: HeroSlide; changed: boolean } {
  const seedSlide = SEED_HERO_BY_ID[slide.id];
  let next = { ...slide };
  let changed = false;

  if (seedSlide) {
    const usesLegacyRemoteImage =
      slide.imageUrl.includes('unsplash.com') || slide.imageUrl.includes('images.unsplash.com');
    if (usesLegacyRemoteImage && slide.imageUrl !== seedSlide.imageUrl) {
      next.imageUrl = seedSlide.imageUrl;
      changed = true;
    }

    const legacy = LEGACY_HERO_TEXT[slide.id];
    if (legacy) {
      for (const key of Object.keys(legacy) as (keyof HeroSlide)[]) {
        if (legacy[key] !== undefined && slide[key] === legacy[key] && slide[key] !== seedSlide[key]) {
          next = { ...next, [key]: seedSlide[key] };
          changed = true;
        }
      }
    }
  }

  return { slide: next, changed };
}

export function migrateHomepageContent(content: HomepageContent): HomepageContent {
  let changed = false;

  const heroSlides = content.heroSlides.map((slide) => {
    const result = migrateHeroSlide(slide);
    if (result.changed) changed = true;
    return result.slide;
  });

  if (!changed) return content;
  return { ...content, heroSlides };
}

