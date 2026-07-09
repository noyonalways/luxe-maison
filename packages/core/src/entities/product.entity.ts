export interface ProductColor {
  name: string;
  hex: string;
}

export type ProductSection = 'men' | 'women' | 'kids';

export interface StorefrontProductFilters {
  section?: ProductSection;
  category?: Product['category'];
  fit?: Product['fit'];
  fabric?: Product['fabric'];
}

export function matchesStorefrontProductFilters(
  product: Product,
  filters?: StorefrontProductFilters,
): boolean {
  if (!filters) return true;
  if (filters.section && product.section !== filters.section) return false;
  if (filters.category && product.category !== filters.category) return false;
  if (filters.fit && product.fit !== filters.fit) return false;
  if (filters.fabric && product.fabric !== filters.fabric) return false;
  return true;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  section: ProductSection;
  category: 'punjabi' | 'shirt' | 'tshirt' | 'pants';
  fit: 'slim' | 'regular' | 'relaxed';
  fabric: 'silk' | 'cotton' | 'linen' | 'blend';
  season: 'summer' | 'winter' | 'all-season';
  colors: ProductColor[];
  sizes: string[];
  images: string[];
  description: string;
  details: string[];
  badge?: string;
  rating: number;
  reviews: number;
  stock: number;
}

export interface AdminProduct extends Product {
  sku: string;
  tags: string[];
  seoTitle: string;
  seoDescription: string;
  status: 'active' | 'draft' | 'archived';
  createdAt: string;
}

export function toStorefrontProduct(product: AdminProduct): Product | null {
  if (product.status !== 'active') return null;
  const {
    sku: _sku,
    tags: _tags,
    seoTitle: _seoTitle,
    seoDescription: _seoDescription,
    status: _status,
    createdAt: _createdAt,
    ...storefront
  } = product;
  return storefront;
}

export function getProductStock(product: Pick<Product, 'stock'>): number {
  return Math.max(0, Math.floor(product.stock ?? 0));
}

export function isProductInStock(product: Pick<Product, 'stock'>): boolean {
  return getProductStock(product) > 0;
}
