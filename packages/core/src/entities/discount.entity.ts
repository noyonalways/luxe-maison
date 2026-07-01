export interface Discount {
  id: string;
  code: string;
  type: 'percentage' | 'fixed';
  value: number;
  minOrder: number;
  maxUses: number;
  usedCount: number;
  status: 'active' | 'expired' | 'disabled';
  expiresAt: string;
  categories: string[];
  description: string;
  createdAt: string;
}
