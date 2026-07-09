import Link from 'next/link';
import { motion } from 'framer-motion';
import { Star } from 'lucide-react';
import type { Product } from '@/data/products';

interface ProductCardProps {
  product: Product;
  index?: number;
  rank?: number;
  showRating?: boolean;
  animate?: boolean;
}

export default function ProductCard({
  product,
  index = 0,
  rank,
  showRating = false,
  animate = true,
}: ProductCardProps) {
  const card = (
    <Link href={`/product/${product.id}`} className="group block">
      <div className="relative aspect-[3/4] overflow-hidden bg-secondary mb-4">
        <img
          src={product.images[0]}
          alt={product.name}
          className="w-full h-full object-cover transition-smooth group-hover:scale-105"
          loading="lazy"
        />
        {product.badge && !rank && (
          <span className="absolute top-3 left-3 px-3 py-1 text-[10px] font-body font-semibold letter-wide uppercase bg-primary text-primary-foreground">
            {product.badge}
          </span>
        )}
        {rank != null && (
          <div className="absolute top-3 right-3 w-9 h-9 flex items-center justify-center bg-foreground text-background rounded-full shadow-lg">
            <span className="text-xs font-bold">#{rank}</span>
          </div>
        )}
        <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/5 transition-smooth" />
        <span className="absolute bottom-3 right-3 px-3 py-1.5 text-[10px] font-medium letter-wide uppercase bg-background/90 text-foreground opacity-0 translate-y-1 group-hover:opacity-100 group-hover:translate-y-0 transition-smooth">
          View
        </span>
        <div className="absolute bottom-3 left-3 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-smooth">
          {product.colors.map((color) => (
            <span
              key={color.name}
              className="w-4 h-4 rounded-full border border-background/50 shadow-sm"
              style={{ backgroundColor: color.hex }}
              title={color.name}
            />
          ))}
        </div>
      </div>
      <div className="space-y-1">
        {showRating && (
          <div className="flex items-center gap-1">
            {Array.from({ length: 5 }).map((_, s) => (
              <Star
                key={s}
                size={11}
                className={s < Math.round(product.rating) ? 'fill-gold text-gold' : 'text-border'}
              />
            ))}
            <span className="text-[10px] text-muted-foreground ml-1">({product.reviews})</span>
          </div>
        )}
        <h3 className="text-sm font-body font-medium text-foreground group-hover:text-gold transition-smooth line-clamp-2">
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
  );

  if (!animate) return card;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
    >
      {card}
    </motion.div>
  );
}
