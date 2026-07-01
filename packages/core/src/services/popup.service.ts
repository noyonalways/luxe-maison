import type { PopupConfig } from '../entities/popup.entity.js';
import type { PopupRepository } from '../repositories/popup.repository.js';

export function createPopupService(repository: PopupRepository) {
  return {
    list(): Promise<PopupConfig[]> {
      return repository.findAll();
    },

    listActive(): Promise<PopupConfig[]> {
      return repository.findActive();
    },

    getById(id: string): Promise<PopupConfig | null> {
      return repository.findById(id);
    },

    create(popup: PopupConfig): Promise<PopupConfig> {
      return repository.create(popup);
    },

    update(id: string, updates: Partial<PopupConfig>): Promise<PopupConfig | null> {
      return repository.update(id, updates);
    },

    delete(id: string): Promise<boolean> {
      return repository.delete(id);
    },
  };
}

export type PopupService = ReturnType<typeof createPopupService>;
