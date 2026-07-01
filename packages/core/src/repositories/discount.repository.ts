import type { Discount } from '../entities/discount.entity.js';

export interface DiscountRepository {
  findAll(): Promise<Discount[]>;
  findById(id: string): Promise<Discount | null>;
  findByCode(code: string): Promise<Discount | null>;
  create(discount: Discount): Promise<Discount>;
  update(id: string, updates: Partial<Discount>): Promise<Discount | null>;
  delete(id: string): Promise<boolean>;
  incrementUsedCount(id: string): Promise<Discount | null>;
}
