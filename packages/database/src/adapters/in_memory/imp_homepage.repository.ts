import type { HomepageContent } from '@luxe-maison/core';
import type { HomepageRepository } from '@luxe-maison/core';
import { defaultHomepageContent, migrateHomepageContent } from './homepage.seed.js';

export function createImpHomepageRepository(
  initial: HomepageContent = structuredClone(defaultHomepageContent),
): HomepageRepository {
  let content = migrateHomepageContent(initial);

  return {
    async get() {
      content = migrateHomepageContent(content);
      return structuredClone(content);
    },

    async update(updates: Partial<HomepageContent>) {
      content = {
        ...content,
        ...updates,
        categoriesSection: updates.categoriesSection
          ? { ...content.categoriesSection, ...updates.categoriesSection }
          : content.categoriesSection,
        storySection: updates.storySection
          ? { ...content.storySection, ...updates.storySection }
          : content.storySection,
        newsletterSection: updates.newsletterSection
          ? { ...content.newsletterSection, ...updates.newsletterSection }
          : content.newsletterSection,
        heroSlides: updates.heroSlides ?? content.heroSlides,
        categoryTiles: updates.categoryTiles ?? content.categoryTiles,
      };
      return structuredClone(content);
    },

    async reset() {
      content = structuredClone(defaultHomepageContent);
      return structuredClone(content);
    },
  };
}
