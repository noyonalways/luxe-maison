import type { HeroSlide } from '@luxe-maison/shared';

export function generateHeroSlideId(): string {
  return `hero-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

export function createHeroSlide(sortOrder: number): HeroSlide {
  return {
    id: generateHeroSlideId(),
    imageUrl: '',
    eyebrow: 'New Collection',
    title: 'Your Headline',
    titleHighlight: 'Goes Here',
    description: 'Describe this slide for the storefront hero.',
    ctaText: 'Shop Now',
    ctaLink: '/shop',
    enabled: true,
    sortOrder,
  };
}
