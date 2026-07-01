export interface PromoCode {
  code: string;
  type: 'percentage' | 'fixed';
  value: number;
  minOrder: number;
  description: string;
}
