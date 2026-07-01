import type { PopupConfig } from '@luxe-maison/core';
import type { PopupRepository } from '@luxe-maison/core';
import { defaultPopups } from './seed.js';

export function createImpPopupRepository(
  initial: PopupConfig[] = structuredClone(defaultPopups),
): PopupRepository {
  const popups = initial;

  return {
    async findAll() {
      return [...popups];
    },

    async findActive() {
      return popups
        .filter((p) => p.enabled)
        .sort((a, b) => b.priority - a.priority);
    },

    async findById(id: string) {
      return popups.find((p) => p.id === id) ?? null;
    },

    async create(popup: PopupConfig) {
      popups.push(popup);
      return popup;
    },

    async update(id: string, updates: Partial<PopupConfig>) {
      const index = popups.findIndex((p) => p.id === id);
      if (index === -1) return null;
      popups[index] = { ...popups[index]!, ...updates };
      return popups[index]!;
    },

    async delete(id: string) {
      const index = popups.findIndex((p) => p.id === id);
      if (index === -1) return false;
      popups.splice(index, 1);
      return true;
    },
  };
}
