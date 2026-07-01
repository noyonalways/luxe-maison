export interface ProductColor {
  name: string;
  hex: string;
}

export type ProductSection = 'men' | 'women' | 'kids';

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
}

export interface AdminProduct extends Product {
  sku: string;
  stock: number;
  tags: string[];
  seoTitle: string;
  seoDescription: string;
  status: 'active' | 'draft' | 'archived';
  createdAt: string;
}
