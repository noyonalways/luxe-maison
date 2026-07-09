import type { ContentPage, ContentPageRepository, ContentPageSlug } from '@luxe-maison/core';
import { CONTENT_PAGE_SLUGS } from '@luxe-maison/core';
import { defaultContentPages, getDefaultContentPage } from './content-page.seed.js';

export function createImpContentPageRepository(
  initial: ContentPage[] = structuredClone(defaultContentPages),
): ContentPageRepository {
  const pages = new Map<ContentPageSlug, ContentPage>(
    initial.map((page) => [page.slug, structuredClone(page)]),
  );

  for (const slug of CONTENT_PAGE_SLUGS) {
    if (!pages.has(slug)) {
      pages.set(slug, getDefaultContentPage(slug));
    }
  }

  return {
    async list() {
      return CONTENT_PAGE_SLUGS.map((slug) => structuredClone(pages.get(slug)!));
    },

    async getBySlug(slug: ContentPageSlug) {
      const page = pages.get(slug);
      return page ? structuredClone(page) : null;
    },

    async update(slug: ContentPageSlug, updates: Partial<Omit<ContentPage, 'slug'>>) {
      const current = pages.get(slug) ?? getDefaultContentPage(slug);
      const next: ContentPage = {
        ...current,
        ...updates,
        slug,
        updatedAt: updates.updatedAt ?? new Date().toISOString(),
      };
      pages.set(slug, next);
      return structuredClone(next);
    },

    async reset(slug: ContentPageSlug) {
      const restored = getDefaultContentPage(slug);
      pages.set(slug, restored);
      return structuredClone(restored);
    },

    async resetAll() {
      for (const slug of CONTENT_PAGE_SLUGS) {
        pages.set(slug, getDefaultContentPage(slug));
      }
      return this.list();
    },
  };
}
