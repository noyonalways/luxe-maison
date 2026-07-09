import type { ContentPage, ContentPageSlug } from '../entities/content-page.entity.js';
import { isContentPageSlug } from '../entities/content-page.entity.js';
import type { ContentPageRepository } from '../repositories/content-page.repository.js';

export function createContentPageService(repository: ContentPageRepository) {
  return {
    list(): Promise<ContentPage[]> {
      return repository.list();
    },

    getBySlug(slug: string): Promise<ContentPage | null> {
      if (!isContentPageSlug(slug)) {
        throw new Error(`Unknown page slug: ${slug}`);
      }
      return repository.getBySlug(slug);
    },

    getPublishedBySlug(slug: string): Promise<ContentPage | null> {
      if (!isContentPageSlug(slug)) return Promise.resolve(null);
      return repository.getBySlug(slug).then((page) => (page?.published ? page : null));
    },

    update(slug: string, updates: Partial<Omit<ContentPage, 'slug'>>): Promise<ContentPage> {
      if (!isContentPageSlug(slug)) {
        throw new Error(`Unknown page slug: ${slug}`);
      }
      return repository.update(slug, {
        ...updates,
        updatedAt: new Date().toISOString(),
      });
    },

    reset(slug: string): Promise<ContentPage> {
      if (!isContentPageSlug(slug)) {
        throw new Error(`Unknown page slug: ${slug}`);
      }
      return repository.reset(slug);
    },

    resetAll(): Promise<ContentPage[]> {
      return repository.resetAll();
    },
  };
}

export type ContentPageService = ReturnType<typeof createContentPageService>;
