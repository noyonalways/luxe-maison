import type { AdminProduct } from '../entities/product.entity.js';
import type { Product } from '../entities/product.entity.js';
import type { ProductRepository } from '../repositories/product.repository.js';

export function createProductService(repository: ProductRepository) {
  return {
    listStorefrontProducts(): Promise<Product[]> {
      return repository.findAllActive();
    },

    listAdminProducts(): Promise<AdminProduct[]> {
      return repository.findAll();
    },

    getById(id: string): Promise<Product | AdminProduct | null> {
      return repository.findById(id);
    },

    getStorefrontProductById(id: string): Promise<Product | null> {
      return repository.findActiveById(id);
    },

    create(product: AdminProduct): Promise<AdminProduct> {
      return repository.create(product);
    },

    update(id: string, product: Partial<AdminProduct>): Promise<AdminProduct | null> {
      return repository.update(id, product);
    },

    delete(id: string): Promise<boolean> {
      return repository.delete(id);
    },
  };
}

export type ProductService = ReturnType<typeof createProductService>;
