import type { ContentPage, ContentPageSlug } from '../entities/content-page.entity.js';

export interface ContentPageRepository {
  list(): Promise<ContentPage[]>;
  getBySlug(slug: ContentPageSlug): Promise<ContentPage | null>;
  update(slug: ContentPageSlug, updates: Partial<Omit<ContentPage, 'slug'>>): Promise<ContentPage>;
  reset(slug: ContentPageSlug): Promise<ContentPage>;
  resetAll(): Promise<ContentPage[]>;
}
