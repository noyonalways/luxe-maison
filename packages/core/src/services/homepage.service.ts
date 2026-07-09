import type { HomepageContent } from '../entities/homepage.entity.js';
import { DEFAULT_HOMEPAGE_CONTENT } from '../entities/homepage.entity.js';
import type { HomepageRepository } from '../repositories/homepage.repository.js';

export function createHomepageService(repository: HomepageRepository) {
  return {
    get(): Promise<HomepageContent> {
      return repository.get();
    },

    update(updates: Partial<HomepageContent>): Promise<HomepageContent> {
      return repository.update(updates);
    },

    reset(): Promise<HomepageContent> {
      return repository.reset();
    },
  };
}

export type HomepageService = ReturnType<typeof createHomepageService>;
export { DEFAULT_HOMEPAGE_CONTENT };
