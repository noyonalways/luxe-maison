export interface HeroSlide {
  id: string;
  imageUrl: string;
  eyebrow: string;
  title: string;
  titleHighlight?: string;
  description: string;
  ctaText: string;
  ctaLink: string;
  enabled: boolean;
  sortOrder: number;
}

export interface HomepageCategoryTile {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  link: string;
  enabled: boolean;
  sortOrder: number;
}

export interface HomepageStorySection {
  eyebrow: string;
  title: string;
  description: string;
  ctaText: string;
  ctaLink: string;
}

export interface HomepageNewsletterSection {
  title: string;
  description: string;
  placeholder: string;
  buttonText: string;
}

export interface HomepageContent {
  heroSlides: HeroSlide[];
  categoriesSection: {
    eyebrow: string;
    title: string;
  };
  categoryTiles: HomepageCategoryTile[];
  storySection: HomepageStorySection;
  newsletterSection: HomepageNewsletterSection;
}

export const DEFAULT_HOMEPAGE_CONTENT: HomepageContent = {
  heroSlides: [],
  categoriesSection: {
    eyebrow: 'Collections',
    title: 'Shop by Category',
  },
  categoryTiles: [],
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
