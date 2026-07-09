import type { Product } from '@luxe-maison/shared';

export const MAX_CART_ITEM_QUANTITY = 99;

export function getProductStock(product: { stock?: number }): number {
  return Math.max(0, Math.floor(product.stock ?? 0));
}

export interface CartLineRef {
  productId: string;
  size: string;
  color: string;
}

export function getCartProductQuantity(
  items: Array<{ product: Product; quantity: number }>,
  productId: string,
) {
  return items
    .filter((item) => item.product.id === productId)
    .reduce((sum, item) => sum + item.quantity, 0);
}

export function getRemainingStock(
  product: Product,
  items: Array<{ product: Product; quantity: number }>,
) {
  const stock = getProductStock(product);
  const inCart = getCartProductQuantity(items, product.id);
  return Math.max(0, stock - inCart);
}

export function getMaxLineQuantity(
  product: Product,
  items: Array<{ product: Product; quantity: number; selectedSize: string; selectedColor: string }>,
  line: CartLineRef,
) {
  const stock = getProductStock(product);
  const lineItem = items.find(
    (item) =>
      item.product.id === line.productId &&
      item.selectedSize === line.size &&
      item.selectedColor === line.color,
  );
  const lineQuantity = lineItem?.quantity ?? 0;
  const totalForProduct = getCartProductQuantity(items, line.productId);
  const otherLinesQuantity = totalForProduct - lineQuantity;
  const stockCap = Math.max(0, stock - otherLinesQuantity);
  return Math.min(MAX_CART_ITEM_QUANTITY, stockCap);
}

export function clampCartQuantity(
  product: Product,
  items: Array<{ product: Product; quantity: number; selectedSize: string; selectedColor: string }>,
  line: CartLineRef,
  quantity: number,
) {
  if (quantity <= 0) return 0;
  const max = getMaxLineQuantity(product, items, line);
  return Math.max(1, Math.min(quantity, max));
}
