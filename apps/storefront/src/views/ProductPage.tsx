"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowLeft, Star, Heart, Truck, RotateCcw, Shield } from 'lucide-react';
import { getProductById, getRelatedProducts } from '@/data/products';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import { useReviews } from '@/context/ReviewsContext';
import { useRecentlyViewed } from '@/hooks/useRecentlyViewed';
import ProductCard from '@/components/ProductCard';
import ReviewsSection from '@/components/product/ReviewsSection';

export default function ProductPage({ id }: { id: string }) {
  const product = getProductById(id || '');
  const { addItem } = useCart();
  const { toggleItem, isInWishlist } = useWishlist();
  const { getAverageRating } = useReviews();
  const { addViewed } = useRecentlyViewed();
  const wishlisted = product ? isInWishlist(product.id) : false;

  const [selectedColor, setSelectedColor] = useState(product?.colors[0]?.name || '');
  const [selectedSize, setSelectedSize] = useState('');
  const [activeImage, setActiveImage] = useState(0);
  const [sizeError, setSizeError] = useState(false);

  // Track recently viewed
  useEffect(() => {
    if (product) addViewed(product.id);
  }, [product?.id]);

  if (!product) {
    return (
      <main className="pt-20 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="font-heading text-2xl mb-4">Product Not Found</h1>
          <Link href="/shop" className="text-sm text-gold underline underline-offset-4">Back to Shop</Link>
        </div>
      </main>
    );
  }

  const related = getRelatedProducts(product.id, 4);
  const dynamicRating = getAverageRating(product.id);
  const displayRating = dynamicRating ? dynamicRating.avg : product.rating;
  const displayReviewCount = dynamicRating ? dynamicRating.count + product.reviews : product.reviews;

  const handleAddToCart = () => {
    if (!selectedSize) {
      setSizeError(true);
      return;
    }
    setSizeError(false);
    addItem(product, selectedSize, selectedColor);
  };

  return (
    <main className="pt-20 lg:pt-24 min-h-screen">
      <div className="container mx-auto px-6 lg:px-12 py-8">
        <Link href="/shop" className="inline-flex items-center gap-2 text-xs text-muted-foreground transition-smooth hover-gold mb-8">
          <ArrowLeft size={14} /> Back to Shop
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">
          {/* Images */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
            <div className="aspect-[3/4] overflow-hidden bg-secondary mb-3">
              <img src={product.images[activeImage]} alt={product.name} className="w-full h-full object-cover" />
            </div>
            {product.images.length > 1 && (
              <div className="flex gap-3">
                {product.images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImage(i)}
                    className={`w-16 h-20 overflow-hidden border-2 transition-smooth ${i === activeImage ? 'border-foreground' : 'border-transparent'}`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </motion.div>

          {/* Details */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}>
            {product.badge && (
              <span className="inline-block px-3 py-1 text-[10px] font-body font-semibold letter-wide uppercase bg-primary text-primary-foreground mb-4">
                {product.badge}
              </span>
            )}
            <h1 className="font-heading text-2xl lg:text-3xl mb-2">{product.name}</h1>

            {/* Rating */}
            <div className="flex items-center gap-2 mb-4">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={12} className={i < Math.floor(displayRating) ? 'fill-primary text-primary' : 'text-border'} />
                ))}
              </div>
              <span className="text-xs text-muted-foreground">{displayRating} ({displayReviewCount} reviews)</span>
            </div>

            {/* Price */}
            <div className="flex items-center gap-3 mb-6">
              <span className="text-2xl font-heading font-semibold">${product.price}</span>
              {product.originalPrice && <span className="text-lg text-muted-foreground line-through">${product.originalPrice}</span>}
            </div>

            <p className="text-sm text-muted-foreground leading-relaxed mb-8">{product.description}</p>

            {/* Color selector */}
            <div className="mb-6">
              <p className="text-xs font-body font-semibold letter-wide uppercase text-muted-foreground mb-3">Color — {selectedColor}</p>
              <div className="flex gap-2">
                {product.colors.map(c => (
                  <button
                    key={c.name}
                    onClick={() => setSelectedColor(c.name)}
                    className={`w-8 h-8 rounded-full border-2 transition-smooth ${selectedColor === c.name ? 'border-foreground scale-110' : 'border-border'}`}
                    style={{ backgroundColor: c.hex }}
                    title={c.name}
                  />
                ))}
              </div>
            </div>

            {/* Size selector */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-body font-semibold letter-wide uppercase text-muted-foreground">Size {selectedSize && `— ${selectedSize}`}</p>
                <button className="text-xs text-gold underline underline-offset-2">Size Guide</button>
              </div>
              <div className="flex flex-wrap gap-2">
                {product.sizes.map(s => (
                  <button
                    key={s}
                    onClick={() => { setSelectedSize(s); setSizeError(false); }}
                    className={`min-w-[44px] h-11 px-4 border text-sm font-medium transition-smooth ${
                      selectedSize === s ? 'bg-foreground text-background border-foreground' : 'border-border hover:border-foreground'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
              {sizeError && <p className="text-xs text-destructive mt-2">Please select a size</p>}
            </div>

            {/* Add to cart */}
            <div className="flex gap-3 mb-8">
              <button onClick={handleAddToCart} className="flex-1 py-3.5 bg-primary text-primary-foreground text-sm font-medium letter-wide uppercase transition-smooth hover:opacity-90">
                Add to Bag
              </button>
              <button
                onClick={() => toggleItem(product)}
                className={`w-12 h-12 flex items-center justify-center border transition-smooth ${wishlisted ? 'border-primary text-primary' : 'border-border hover:border-foreground hover-gold'}`}
                aria-label={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
              >
                <Heart size={18} className={wishlisted ? 'fill-current' : ''} />
              </button>
            </div>

            {/* Perks */}
            <div className="space-y-3 pt-6 border-t border-border">
              {[
                { icon: Truck, text: 'Complimentary shipping on orders over $200' },
                { icon: RotateCcw, text: '30-day hassle-free returns' },
                { icon: Shield, text: 'Authenticity guaranteed' },
              ].map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-center gap-3">
                  <Icon size={14} className="text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">{text}</span>
                </div>
              ))}
            </div>

            {/* Details */}
            <div className="mt-8 pt-6 border-t border-border">
              <p className="text-xs font-body font-semibold letter-wide uppercase text-muted-foreground mb-3">Details</p>
              <ul className="space-y-1.5">
                {product.details.map(d => (
                  <li key={d} className="text-sm text-muted-foreground flex items-center gap-2">
                    <span className="w-1 h-1 rounded-full bg-primary" />
                    {d}
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>
        </div>

        {/* Reviews Section */}
        <ReviewsSection productId={product.id} />

        {/* Related */}
        {related.length > 0 && (
          <section className="mt-20 lg:mt-32 pb-16">
            <h2 className="font-heading text-2xl lg:text-3xl mb-10">You May Also Like</h2>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
              {related.map((p, i) => (
                <ProductCard key={p.id} product={p} index={i} />
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
