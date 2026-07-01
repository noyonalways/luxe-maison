import type { AdminProduct, Product } from '@luxe-maison/core';
import type { ProductRepository } from '@luxe-maison/core';
import { adminProducts } from './seed.js';

export function createImpProductRepository(
  initial: AdminProduct[] = structuredClone(adminProducts),
): ProductRepository {
  const products = initial;

  return {
    async findAll() {
      return [...products];
    },

    async findAllActive() {
      return products.filter((p) => p.status === 'active') as Product[];
    },

    async findById(id: string) {
      return products.find((p) => p.id === id) ?? null;
    },

    async create(product: AdminProduct) {
      products.push(product);
      return product;
    },

    async update(id: string, updates: Partial<AdminProduct>) {
      const index = products.findIndex((p) => p.id === id);
      if (index === -1) return null;
      products[index] = { ...products[index]!, ...updates };
      return products[index]!;
    },

    async delete(id: string) {
      const index = products.findIndex((p) => p.id === id);
      if (index === -1) return false;
      products.splice(index, 1);
      return true;
    },
  };
}
