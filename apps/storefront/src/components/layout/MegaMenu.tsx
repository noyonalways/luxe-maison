import Link from 'next/link';
import { motion } from 'framer-motion';
import { useProducts } from '@/context/ProductsContext';
import { categories } from '@/data/products';
import { ArrowRight } from 'lucide-react';

import categoryPunjabi from '@/assets/category-punjabi.jpg';
import categoryShirts from '@/assets/category-shirts.jpg';
import categoryTshirts from '@/assets/category-tshirts.jpg';
import categoryPants from '@/assets/category-pants.jpg';

import type { StaticImageData } from 'next/image';

const categoryImages: Record<string, StaticImageData> = {
  punjabi: categoryPunjabi,
  shirt: categoryShirts,
  tshirt: categoryTshirts,
  pants: categoryPants,
};

const sectionLabels: Record<string, string> = {
  men: 'Men',
  women: 'Women',
  kids: 'Kids',
};

const sectionImages: Record<string, StaticImageData> = {
  men: categoryShirts,
  women: categoryPunjabi,
  kids: categoryTshirts,
};

const filters = {
  fit: ['Slim', 'Regular', 'Relaxed'],
  fabric: ['Silk', 'Cotton', 'Linen', 'Blend'],
};

interface MegaMenuProps {
  section: string;
  onClose: () => void;
}

export default function MegaMenu({ section, onClose }: MegaMenuProps) {
  const { getProductsBySection } = useProducts();
  const products = getProductsBySection(section as 'men' | 'women' | 'kids').slice(0, 2);
  const label = sectionLabels[section] || section;
  const heroImage = sectionImages[section] || categoryShirts;

  return (
    <motion.div
      initial={{ opacity: 0, y: -4 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -4 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      className="absolute top-full left-0 right-0 bg-background border-b border-border shadow-lg z-50"
      onMouseLeave={onClose}
    >
      <div className="container mx-auto px-6 lg:px-12 py-8">
        <div className="grid grid-cols-12 gap-8">
          {/* Left: Categories + Filters */}
          <div className="col-span-3 space-y-6">
            <div>
              <h4 className="text-xs font-body font-semibold uppercase tracking-wider text-muted-foreground mb-3">Categories</h4>
              <ul className="space-y-2">
                {categories.map(cat => (
                  <li key={cat.id} className="flex items-center gap-3">
                    <img src={categoryImages[cat.id].src} alt={cat.name} className="w-8 h-8 rounded-sm object-cover" />
                    <Link
                      href={`/shop?section=${section}&category=${cat.id}`}
                      onClick={onClose}
                      className="text-sm font-body font-medium text-foreground hover:text-primary transition-colors duration-200"
                    >
                      {cat.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-xs font-body font-semibold uppercase tracking-wider text-muted-foreground mb-3">By Fit</h4>
              <ul className="space-y-2">
                {filters.fit.map(f => (
                  <li key={f}>
                    <Link
                      href={`/shop?section=${section}&fit=${f.toLowerCase()}`}
                      onClick={onClose}
                      className="text-sm font-body text-foreground hover:text-primary transition-colors duration-200"
                    >
                      {f}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-xs font-body font-semibold uppercase tracking-wider text-muted-foreground mb-3">By Fabric</h4>
              <ul className="space-y-2">
                {filters.fabric.map(f => (
                  <li key={f}>
                    <Link
                      href={`/shop?section=${section}&fabric=${f.toLowerCase()}`}
                      onClick={onClose}
                      className="text-sm font-body text-foreground hover:text-primary transition-colors duration-200"
                    >
                      {f}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Center: Featured Products */}
          <div className="col-span-5">
            <h4 className="text-xs font-body font-semibold uppercase tracking-wider text-muted-foreground mb-4">Featured in {label}</h4>
            <div className="grid grid-cols-2 gap-4">
              {products.map(product => (
                <Link
                  key={product.id}
                  href={`/product/${product.id}`}
                  onClick={onClose}
                  className="group"
                >
                  <div className="aspect-[3/4] overflow-hidden rounded-sm bg-secondary mb-2">
                    <img
                      src={product.images[0]}
                      alt={product.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                  <p className="text-sm font-body font-medium text-foreground group-hover:text-primary transition-colors">
                    {product.name}
                  </p>
                  <p className="text-sm font-body text-muted-foreground">
                    ${product.price}
                  </p>
                </Link>
              ))}
            </div>
          </div>

          {/* Right: Section Image + CTA */}
          <div className="col-span-4">
            <div className="relative h-full min-h-[280px] overflow-hidden rounded-sm">
              <img
                src={heroImage.src}
                alt={label}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-foreground/30 flex flex-col justify-end p-6">
                <h3 className="font-heading text-2xl font-semibold text-primary-foreground mb-2">
                  {label}'s Collection
                </h3>
                <Link
                  href={`/shop?section=${section}`}
                  onClick={onClose}
                  className="inline-flex items-center gap-2 text-sm font-body font-medium text-primary-foreground hover:text-primary transition-colors"
                >
                  Shop All {label} <ArrowRight size={14} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
