import type { HomepageContent } from '../entities/homepage.entity.js';

export interface HomepageRepository {
  get(): Promise<HomepageContent>;
  update(updates: Partial<HomepageContent>): Promise<HomepageContent>;
  reset(): Promise<HomepageContent>;
}
