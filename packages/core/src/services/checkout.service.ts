import type { OrderItem } from '../entities/order.entity.js';
import type { PaymentMethod } from '../entities/order.entity.js';
import type { Product } from '../entities/product.entity.js';
import { getProductStock } from '../entities/product.entity.js';
import type { PromoCode } from '../entities/promo-code.entity.js';
import { calculateDiscount } from './promo.service.js';

export const CHECKOUT_CONFIG = {
  SHIPPING_RATE: 12,
  FREE_SHIPPING_THRESHOLD: 200,
  TAX_RATE: 0.08,
  GIFT_WRAP_COST: 8,
  COD_FEE: 5,
} as const;

export type CheckoutLineItemInput = {
  productId: string;
  size: string;
  color: string;
  quantity: number;
};

export type CheckoutQuoteInput = {
  items: CheckoutLineItemInput[];
  promoCode?: string;
  giftWrap?: boolean;
  paymentMethod: PaymentMethod;
};

export type CheckoutTotals = {
  items: OrderItem[];
  subtotal: number;
  shipping: number;
  giftWrapAmount: number;
  codFee: number;
  discountAmount: number;
  tax: number;
  total: number;
  promoCode?: string;
};

export type ProductLookup = (productId: string) => Promise<Product | null>;

function roundMoney(value: number): number {
  return Math.round(value * 100) / 100;
}

export async function buildCheckoutQuote(
  input: CheckoutQuoteInput,
  lookupProduct: ProductLookup,
  resolvePromo?: (code: string, subtotal: number) => Promise<PromoCode | null>,
): Promise<CheckoutTotals> {
  if (!input.items.length) {
    throw new Error('Cart is empty');
  }

  const resolvedItems: OrderItem[] = [];
  const requestedByProduct = new Map<string, number>();

  for (const item of input.items) {
    const quantity = Math.max(1, Math.floor(item.quantity));
    requestedByProduct.set(
      item.productId,
      (requestedByProduct.get(item.productId) ?? 0) + quantity,
    );
  }

  const productCache = new Map<string, Product>();

  for (const item of input.items) {
    const quantity = Math.max(1, Math.floor(item.quantity));
    let product = productCache.get(item.productId);
    if (!product) {
      product = (await lookupProduct(item.productId)) ?? undefined;
      if (!product) {
        throw new Error(`Product not found: ${item.productId}`);
      }
      productCache.set(item.productId, product);

      const requestedTotal = requestedByProduct.get(item.productId) ?? quantity;
      if (requestedTotal > getProductStock(product)) {
        throw new Error(`Insufficient stock for ${product.name}`);
      }
    }

    const size = item.size?.trim() || product.sizes[0] || 'One Size';
    if (!product.sizes.includes(size)) {
      throw new Error(`Invalid size "${size}" for ${product.name}`);
    }

    const color = item.color?.trim() || product.colors[0]?.name || 'Default';
    const hasColor = product.colors.some((c) => c.name === color);
    if (!hasColor) {
      throw new Error(`Invalid color "${color}" for ${product.name}`);
    }

    resolvedItems.push({
      productId: product.id,
      productName: product.name,
      size,
      color,
      quantity,
      price: product.price,
      image: product.images[0] ?? '',
    });
  }

  const subtotal = roundMoney(
    resolvedItems.reduce((sum, item) => sum + item.price * item.quantity, 0),
  );

  const shipping =
    subtotal >= CHECKOUT_CONFIG.FREE_SHIPPING_THRESHOLD ? 0 : CHECKOUT_CONFIG.SHIPPING_RATE;
  const giftWrapAmount = input.giftWrap ? CHECKOUT_CONFIG.GIFT_WRAP_COST : 0;
  const codFee = input.paymentMethod === 'cod' ? CHECKOUT_CONFIG.COD_FEE : 0;

  let discountAmount = 0;
  let promoCode: string | undefined;

  if (input.promoCode?.trim()) {
    const promo = await resolvePromo?.(input.promoCode.trim(), subtotal);
    if (!promo) {
      throw new Error('Invalid promo code');
    }
    discountAmount = calculateDiscount(promo, subtotal);
    promoCode = promo.code;
  }

  const taxableBase = Math.max(0, subtotal + shipping + giftWrapAmount + codFee - discountAmount);
  const tax = roundMoney(taxableBase * CHECKOUT_CONFIG.TAX_RATE);
  const total = roundMoney(taxableBase + tax);

  return {
    items: resolvedItems,
    subtotal,
    shipping,
    giftWrapAmount,
    codFee,
    discountAmount,
    tax,
    total,
    promoCode,
  };
}

export function totalsToCents(total: number): number {
  return Math.round(total * 100);
}
