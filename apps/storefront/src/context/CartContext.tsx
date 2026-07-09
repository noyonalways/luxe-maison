import React, { createContext, useContext, useState, useCallback } from 'react';
import type { Product } from '@luxe-maison/shared';
import {
  clampCartQuantity,
  getCartProductQuantity,
  getMaxLineQuantity,
  getRemainingStock,
  MAX_CART_ITEM_QUANTITY,
} from '@/lib/cart-stock';

function matchesLine(
  item: CartItem,
  productId: string,
  size: string,
  color: string,
) {
  return (
    item.product.id === productId &&
    item.selectedSize === size &&
    item.selectedColor === color
  );
}

export interface CartItem {
  product: Product;
  quantity: number;
  selectedSize: string;
  selectedColor: string;
}

interface CartContextType {
  items: CartItem[];
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  addItem: (product: Product, size: string, color: string, quantity?: number) => void;
  removeItem: (productId: string, size: string, color: string) => void;
  updateQuantity: (productId: string, size: string, color: string, quantity: number) => void;
  getItemQuantity: (productId: string, size: string, color: string) => number;
  getRemainingStock: (product: Product) => number;
  getMaxLineQuantity: (product: Product, size: string, color: string) => number;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export { MAX_CART_ITEM_QUANTITY };

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  const openCart = useCallback(() => setIsOpen(true), []);
  const closeCart = useCallback(() => setIsOpen(false), []);

  const addItem = useCallback((product: Product, size: string, color: string, quantity = 1) => {
    setItems((prev) => {
      const remaining = getRemainingStock(product, prev);
      if (remaining <= 0) return prev;

      const amount = Math.min(quantity, remaining);
      const existing = prev.find((item) => matchesLine(item, product.id, size, color));

      if (existing) {
        const nextQuantity = clampCartQuantity(product, prev, { productId: product.id, size, color }, existing.quantity + amount);
        return prev.map((item) =>
          matchesLine(item, product.id, size, color)
            ? { ...item, product, quantity: nextQuantity }
            : item,
        );
      }

      return [
        ...prev,
        {
          product,
          quantity: clampCartQuantity(product, prev, { productId: product.id, size, color }, amount),
          selectedSize: size,
          selectedColor: color,
        },
      ];
    });
    setIsOpen(true);
  }, []);

  const removeItem = useCallback((productId: string, size: string, color: string) => {
    setItems((prev) => prev.filter((item) => !matchesLine(item, productId, size, color)));
  }, []);

  const updateQuantity = useCallback((productId: string, size: string, color: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(productId, size, color);
      return;
    }

    setItems((prev) => {
      const line = prev.find((item) => matchesLine(item, productId, size, color));
      if (!line) return prev;

      const nextQuantity = clampCartQuantity(
        line.product,
        prev,
        { productId, size, color },
        quantity,
      );

      return prev.map((item) =>
        matchesLine(item, productId, size, color)
          ? { ...item, quantity: nextQuantity }
          : item,
      );
    });
  }, [removeItem]);

  const getItemQuantity = useCallback((productId: string, size: string, color: string) => {
    return items.find((item) => matchesLine(item, productId, size, color))?.quantity ?? 0;
  }, [items]);

  const getRemainingStockForProduct = useCallback((product: Product) => {
    return getRemainingStock(product, items);
  }, [items]);

  const getMaxLineQuantityForProduct = useCallback((product: Product, size: string, color: string) => {
    return getMaxLineQuantity(product, items, { productId: product.id, size, color });
  }, [items]);

  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        isOpen,
        openCart,
        closeCart,
        addItem,
        removeItem,
        updateQuantity,
        getItemQuantity,
        getRemainingStock: getRemainingStockForProduct,
        getMaxLineQuantity: getMaxLineQuantityForProduct,
        clearCart,
        totalItems,
        totalPrice,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
