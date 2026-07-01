import Link from 'next/link';
import { motion } from 'framer-motion';
import type { Product } from '@/data/products';

interface ProductCardProps {
  product: Product;
  index?: number;
}

export default function ProductCard({ product, index = 0 }: ProductCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
    >
      <Link href={`/product/${product.id}`} className="group block">
        {/* Image */}
        <div className="relative aspect-[3/4] overflow-hidden bg-secondary mb-4">
          <img
            src={product.images[0]}
            alt={product.name}
            className="w-full h-full object-cover transition-smooth group-hover:scale-105"
            loading="lazy"
          />
          {product.badge && (
            <span className="absolute top-3 left-3 px-3 py-1 text-[10px] font-body font-semibold letter-wide uppercase bg-primary text-primary-foreground">
              {product.badge}
            </span>
          )}
          {/* Quick color swatches on hover */}
          <div className="absolute bottom-3 left-3 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-smooth">
            {product.colors.map(color => (
              <span
                key={color.name}
                className="w-4 h-4 rounded-full border border-background/50 shadow-sm"
                style={{ backgroundColor: color.hex }}
                title={color.name}
              />
            ))}
          </div>
        </div>
        {/* Info */}
        <div className="space-y-1">
          <h3 className="text-sm font-body font-medium text-foreground group-hover:text-gold transition-smooth">
            {product.name}
          </h3>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">${product.price}</span>
            {product.originalPrice && (
              <span className="text-xs text-muted-foreground line-through">${product.originalPrice}</span>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
