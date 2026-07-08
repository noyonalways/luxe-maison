import { apiFetch } from '@/lib/api/client';
import type { PromoCode } from '@luxe-maison/shared';

interface ValidateDiscountResponse {
  valid: true;
  promo: PromoCode;
  discountAmount: number;
}

export const discountsApi = {
  validate(code: string, orderTotal: number) {
    return apiFetch<ValidateDiscountResponse>('/api/discounts/validate', {
      method: 'POST',
      body: JSON.stringify({ code, orderTotal }),
    });
  },
};
