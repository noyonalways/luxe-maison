import Link from 'next/link';
import { motion } from 'framer-motion';
import type { ProductSection } from '@luxe-maison/shared';
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

const fitOptions = ['slim', 'regular', 'relaxed'] as const;
const fabricOptions = ['silk', 'cotton', 'linen', 'blend'] as const;

interface MegaMenuProps {
  section: string;
  onClose: () => void;
}

export default function MegaMenu({ section, onClose }: MegaMenuProps) {
  const { getProductsBySection } = useProducts();
  const sectionKey = section as ProductSection;
  const sectionProducts = getProductsBySection(sectionKey);
  const products = sectionProducts.slice(0, 2);
  const label = sectionLabels[section] || section;
  const heroImage = sectionImages[section] || categoryShirts;

  const availableCategories = categories.filter((category) =>
    sectionProducts.some((product) => product.category === category.id),
  );

  const availableFits = fitOptions.filter((fit) =>
    sectionProducts.some((product) => product.fit === fit),
  );

  const availableFabrics = fabricOptions.filter((fabric) =>
    sectionProducts.some((product) => product.fabric === fabric),
  );

  const shopBase = `/shop/${section}`;

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
          <div className="col-span-3 space-y-6">
            <div>
              <h4 className="text-xs font-body font-semibold uppercase tracking-wider text-muted-foreground mb-3">
                Categories
              </h4>
              <ul className="space-y-2">
                {availableCategories.map((category) => (
                  <li key={category.id} className="flex items-center gap-3">
                    <img
                      src={categoryImages[category.id].src}
                      alt={category.name}
                      className="w-8 h-8 rounded-sm object-cover"
                    />
                    <Link
                      href={`${shopBase}?category=${category.id}`}
                      onClick={onClose}
                      className="text-sm font-body font-medium text-foreground hover:text-primary transition-colors duration-200"
                    >
                      {category.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {availableFits.length > 0 && (
              <div>
                <h4 className="text-xs font-body font-semibold uppercase tracking-wider text-muted-foreground mb-3">
                  By Fit
                </h4>
                <ul className="space-y-2">
                  {availableFits.map((fit) => (
                    <li key={fit}>
                      <Link
                        href={`${shopBase}?fit=${fit}`}
                        onClick={onClose}
                        className="text-sm font-body text-foreground hover:text-primary transition-colors duration-200 capitalize"
                      >
                        {fit}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {availableFabrics.length > 0 && (
              <div>
                <h4 className="text-xs font-body font-semibold uppercase tracking-wider text-muted-foreground mb-3">
                  By Fabric
                </h4>
                <ul className="space-y-2">
                  {availableFabrics.map((fabric) => (
                    <li key={fabric}>
                      <Link
                        href={`${shopBase}?fabric=${fabric}`}
                        onClick={onClose}
                        className="text-sm font-body text-foreground hover:text-primary transition-colors duration-200 capitalize"
                      >
                        {fabric}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <div className="col-span-5">
            <h4 className="text-xs font-body font-semibold uppercase tracking-wider text-muted-foreground mb-4">
              Featured in {label}
            </h4>
            {products.length > 0 ? (
              <div className="grid grid-cols-2 gap-4">
                {products.map((product) => (
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
                    <p className="text-sm font-body text-muted-foreground">${product.price}</p>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">New pieces arriving soon.</p>
            )}
          </div>

          <div className="col-span-4">
            <div className="relative h-full min-h-[280px] overflow-hidden rounded-sm">
              <img src={heroImage.src} alt={label} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-foreground/30 flex flex-col justify-end p-6">
                <h3 className="font-heading text-2xl font-semibold text-primary-foreground mb-2">
                  {label}&apos;s Collection
                </h3>
                <Link
                  href={shopBase}
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
