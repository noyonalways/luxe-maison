const HERO_IMAGE_BY_ID: Record<string, string> = {
  'hero-1': '/images/hero/hero-collection.jpg',
  'hero-2': '/images/hero/hero-slide-2.jpg',
  'hero-3': '/images/hero/hero-slide-3.jpg',
};

export function resolveHeroImageUrl(slide: { id: string; imageUrl: string }): string {
  if (slide.imageUrl.startsWith('/images/hero/')) {
    return slide.imageUrl;
  }

  if (slide.imageUrl.includes('unsplash.com')) {
    return HERO_IMAGE_BY_ID[slide.id] ?? slide.imageUrl;
  }

  return slide.imageUrl;
}
