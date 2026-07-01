import type { Discount } from '../entities/discount.entity.js';
import type { PromoCode } from '../entities/promo-code.entity.js';
import type { DiscountRepository } from '../repositories/discount.repository.js';

function toPromoCode(discount: Discount): PromoCode {
  return {
    code: discount.code,
    type: discount.type,
    value: discount.value,
    minOrder: discount.minOrder,
    description: discount.description,
  };
}

export function createDiscountService(repository: DiscountRepository) {
  return {
    list(): Promise<Discount[]> {
      return repository.findAll();
    },

    getById(id: string): Promise<Discount | null> {
      return repository.findById(id);
    },

    getByCode(code: string): Promise<Discount | null> {
      return repository.findByCode(code);
    },

    create(discount: Discount): Promise<Discount> {
      return repository.create(discount);
    },

    update(id: string, updates: Partial<Discount>): Promise<Discount | null> {
      return repository.update(id, updates);
    },

    delete(id: string): Promise<boolean> {
      return repository.delete(id);
    },

    async validateCode(
      code: string,
      orderTotal: number,
    ): Promise<{ valid: boolean; promo?: PromoCode; error?: string }> {
      const discount = await repository.findByCode(code);
      if (!discount) return { valid: false, error: 'Invalid promo code' };
      if (discount.status !== 'active') {
        return { valid: false, error: 'This promo code is no longer active' };
      }
      if (new Date(discount.expiresAt) < new Date()) {
        return { valid: false, error: 'This promo code has expired' };
      }
      if (discount.usedCount >= discount.maxUses) {
        return { valid: false, error: 'This promo code has reached its usage limit' };
      }
      if (orderTotal < discount.minOrder) {
        return { valid: false, error: `Minimum order of $${discount.minOrder} required` };
      }
      return { valid: true, promo: toPromoCode(discount) };
    },

    incrementUsedCount(id: string): Promise<Discount | null> {
      return repository.incrementUsedCount(id);
    },
  };
}

export type DiscountService = ReturnType<typeof createDiscountService>;
