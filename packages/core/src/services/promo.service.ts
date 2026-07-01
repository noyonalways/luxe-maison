import type { PromoCode } from '../entities/promo-code.entity.js';

export const promoCodes: PromoCode[] = [
  { code: 'WELCOME10', type: 'percentage', value: 10, minOrder: 50, description: '10% off your first order' },
  { code: 'FLAT20', type: 'fixed', value: 20, minOrder: 100, description: '$20 off orders over $100' },
  { code: 'SUMMER15', type: 'percentage', value: 15, minOrder: 150, description: '15% off orders over $150' },
  { code: 'VIP25', type: 'fixed', value: 25, minOrder: 200, description: '$25 off orders over $200' },
];

export function validatePromoCode(
  code: string,
  orderTotal: number,
): { valid: boolean; promo?: PromoCode; error?: string } {
  const promo = promoCodes.find((p) => p.code === code.toUpperCase().trim());
  if (!promo) return { valid: false, error: 'Invalid promo code' };
  if (orderTotal < promo.minOrder) {
    return { valid: false, error: `Minimum order of $${promo.minOrder} required` };
  }
  return { valid: true, promo };
}

export function calculateDiscount(promo: PromoCode, orderTotal: number): number {
  if (promo.type === 'percentage') {
    return Math.round(orderTotal * (promo.value / 100) * 100) / 100;
  }
  return promo.value;
}
