import type { AdminProduct } from '../entities/product.entity.js';
import type { Product } from '../entities/product.entity.js';

export interface ProductRepository {
  findAll(): Promise<AdminProduct[]>;
  findAllActive(): Promise<Product[]>;
  findById(id: string): Promise<AdminProduct | null>;
  create(product: AdminProduct): Promise<AdminProduct>;
  update(id: string, product: Partial<AdminProduct>): Promise<AdminProduct | null>;
  delete(id: string): Promise<boolean>;
}
