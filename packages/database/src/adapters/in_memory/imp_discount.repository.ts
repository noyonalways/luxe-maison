import type { Discount } from '@luxe-maison/core';
import type { DiscountRepository } from '@luxe-maison/core';
import { mockDiscounts } from './seed.js';

export function createImpDiscountRepository(
  initial: Discount[] = structuredClone(mockDiscounts),
): DiscountRepository {
  const discounts = initial;

  return {
    async findAll() {
      return [...discounts];
    },

    async findById(id: string) {
      return discounts.find((d) => d.id === id) ?? null;
    },

    async findByCode(code: string) {
      const normalized = code.toUpperCase().trim();
      return discounts.find((d) => d.code.toUpperCase() === normalized) ?? null;
    },

    async create(discount: Discount) {
      discounts.push(discount);
      return discount;
    },

    async update(id: string, updates: Partial<Discount>) {
      const index = discounts.findIndex((d) => d.id === id);
      if (index === -1) return null;
      discounts[index] = { ...discounts[index]!, ...updates };
      return discounts[index]!;
    },

    async delete(id: string) {
      const index = discounts.findIndex((d) => d.id === id);
      if (index === -1) return false;
      discounts.splice(index, 1);
      return true;
    },

    async incrementUsedCount(id: string) {
      const index = discounts.findIndex((d) => d.id === id);
      if (index === -1) return null;
      discounts[index] = {
        ...discounts[index]!,
        usedCount: discounts[index]!.usedCount + 1,
      };
      return discounts[index]!;
    },
  };
}
