import type { PopupConfig } from '../entities/popup.entity.js';

export interface PopupRepository {
  findAll(): Promise<PopupConfig[]>;
  findActive(): Promise<PopupConfig[]>;
  findById(id: string): Promise<PopupConfig | null>;
  create(popup: PopupConfig): Promise<PopupConfig>;
  update(id: string, updates: Partial<PopupConfig>): Promise<PopupConfig | null>;
  delete(id: string): Promise<boolean>;
}
