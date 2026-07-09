"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowLeft, Star, Heart, Truck, RotateCcw, Shield, Loader2 } from 'lucide-react';
import { useProducts } from '@/context/ProductsContext';
import { useProduct } from '@/hooks/products/use-product';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import { useReviewsForProduct } from '@/context/ReviewsContext';
import { useRecentlyViewed } from '@/hooks/useRecentlyViewed';
import ProductCard from '@/components/ProductCard';
import ReviewsSection from '@/components/product/ReviewsSection';
import { QuantityStepper } from '@/components/cart/QuantityStepper';
import { PageBody, PageCenter, PageMain } from '@/components/layout/PageShell';
import { getProductStock } from '@/lib/cart-stock';

export default function ProductPage({ id }: { id: string }) {
  const { getRelatedProducts } = useProducts();
  const { data: product, isLoading, isError } = useProduct(id || '');
  const { addItem, getItemQuantity, getRemainingStock } = useCart();
  const { toggleItem, isInWishlist } = useWishlist();
  const { average } = useReviewsForProduct(id);
  const { addViewed } = useRecentlyViewed();
  const wishlisted = product ? isInWishlist(product.id) : false;

  const [selectedColor, setSelectedColor] = useState(product?.colors[0]?.name || '');
  const [selectedSize, setSelectedSize] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);
  const [sizeError, setSizeError] = useState(false);

  useEffect(() => {
    if (product) {
      setSelectedColor(product.colors[0]?.name || '');
      addViewed(product.id);
    }
  }, [product?.id, addViewed, product]);

  useEffect(() => {
    setQuantity(1);
  }, [selectedSize, selectedColor, product?.id]);

  const inCartQuantity =
    product && selectedSize
      ? getItemQuantity(product.id, selectedSize, selectedColor)
      : 0;
  const stock = product ? getProductStock(product) : 0;
  const remainingStock = product ? getRemainingStock(product) : 0;
  const maxAddQuantity = remainingStock;
  const isOutOfStock = stock === 0;
  const isLowStock = stock > 0 && stock <= 5;

  useEffect(() => {
    if (maxAddQuantity > 0) {
      setQuantity((current) => Math.min(current, maxAddQuantity));
    }
  }, [maxAddQuantity]);

  if (isLoading) {
    return (
      <PageCenter>
        <div className="flex items-center gap-2 text-muted-foreground">
          <Loader2 size={20} className="animate-spin" />
          <span className="text-sm">Loading product…</span>
        </div>
      </PageCenter>
    );
  }

  if (isError || !product) {
    return (
      <PageCenter>
        <div className="text-center">
          <h1 className="font-heading text-2xl mb-4">Product Not Found</h1>
          <Link href="/shop" className="text-sm text-gold underline underline-offset-4">
            Back to Shop
          </Link>
        </div>
      </PageCenter>
    );
  }

  const related = getRelatedProducts(product.id, 4);
  const displayRating = average?.avg ?? product.rating;
  const displayReviewCount = average?.count ?? product.reviews;

  const handleAddToCart = () => {
    if (!selectedSize) {
      setSizeError(true);
      return;
    }
    setSizeError(false);
    addItem(product, selectedSize, selectedColor, quantity);
    setQuantity(1);
  };

  return (
    <PageMain className="bg-cream/30">
      <PageBody offset className="py-8">
        <Link
          href="/shop"
          className="inline-flex items-center gap-2 text-xs text-muted-foreground transition-smooth hover-gold mb-8"
        >
          <ArrowLeft size={14} /> Back to Shop
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
            <div className="aspect-[3/4] overflow-hidden bg-secondary mb-3">
              <img
                src={product.images[activeImage]}
                alt={product.name}
                className="w-full h-full object-cover"
              />
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

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            {product.badge && (
              <span className="inline-block px-3 py-1 bg-gold/10 text-gold text-xs font-medium letter-wide uppercase mb-4">
                {product.badge}
              </span>
            )}
            <h1 className="font-heading text-3xl lg:text-4xl mb-3">{product.name}</h1>
            <div className="flex items-center gap-2 mb-6">
              <div className="flex items-center gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    size={14}
                    className={i < Math.round(displayRating) ? 'fill-gold text-gold' : 'text-muted-foreground/30'}
                  />
                ))}
              </div>
              <span className="text-sm text-muted-foreground">
                {displayRating} ({displayReviewCount} reviews)
              </span>
            </div>

            <div className="flex items-baseline gap-3 mb-3">
              <span className="font-heading text-2xl">${product.price}</span>
              {product.originalPrice && (
                <span className="text-lg text-muted-foreground line-through">
                  ${product.originalPrice}
                </span>
              )}
            </div>

            <p
              className={`text-sm mb-8 ${
                isOutOfStock
                  ? 'text-destructive font-medium'
                  : isLowStock
                    ? 'text-amber-700'
                    : 'text-muted-foreground'
              }`}
            >
              {isOutOfStock
                ? 'Out of stock'
                : remainingStock <= 5
                  ? `Only ${remainingStock} left${inCartQuantity > 0 ? ` (${inCartQuantity} in your bag)` : ''}`
                  : `${stock} in stock${inCartQuantity > 0 ? ` · ${inCartQuantity} in your bag` : ''}`}
            </p>

            <p className="text-sm text-muted-foreground leading-relaxed mb-8">{product.description}</p>

            <div className="mb-6">
              <p className="text-xs font-body font-medium letter-wide uppercase text-muted-foreground mb-3">
                Color — {selectedColor}
              </p>
              <div className="flex gap-3">
                {product.colors.map((color) => (
                  <button
                    key={color.name}
                    onClick={() => setSelectedColor(color.name)}
                    className={`w-8 h-8 rounded-full border-2 transition-smooth ${selectedColor === color.name ? 'border-foreground scale-110' : 'border-transparent'}`}
                    style={{ backgroundColor: color.hex }}
                    title={color.name}
                  />
                ))}
              </div>
            </div>

            <div className="mb-8">
              <p className="text-xs font-body font-medium letter-wide uppercase text-muted-foreground mb-3">
                Size
              </p>
              <div className="flex flex-wrap gap-2">
                {product.sizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => {
                      setSelectedSize(size);
                      setSizeError(false);
                    }}
                    className={`min-w-[3rem] px-4 py-2.5 text-sm border transition-smooth ${
                      selectedSize === size
                        ? 'bg-foreground text-background border-foreground'
                        : 'border-border hover:border-foreground'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
              {sizeError && (
                <p className="text-xs text-destructive mt-2">Please select a size</p>
              )}
            </div>

            <div className="mb-8">
              <p className="text-xs font-body font-medium letter-wide uppercase text-muted-foreground mb-3">
                Quantity
              </p>
              {isOutOfStock ? (
                <p className="text-sm text-muted-foreground">This item is currently unavailable.</p>
              ) : (
                <>
                  <QuantityStepper
                    value={maxAddQuantity > 0 ? Math.min(quantity, maxAddQuantity) : 1}
                    max={Math.max(maxAddQuantity, 1)}
                    onChange={setQuantity}
                  />
                  {maxAddQuantity <= 0 && (
                    <p className="text-xs text-muted-foreground mt-2">
                      All available units are already in your bag.
                    </p>
                  )}
                </>
              )}
            </div>

            <div className="flex gap-3 mb-10">
              <button
                onClick={handleAddToCart}
                disabled={!selectedSize || isOutOfStock || maxAddQuantity < 1}
                className="flex-1 py-4 bg-primary text-primary-foreground text-sm font-medium letter-wide uppercase transition-smooth hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isOutOfStock ? 'Out of Stock' : 'Add to Bag'}
              </button>
              <button
                onClick={() => toggleItem(product)}
                className={`px-5 border transition-smooth ${wishlisted ? 'bg-foreground text-background border-foreground' : 'border-border hover:border-foreground'}`}
                aria-label={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
              >
                <Heart size={18} className={wishlisted ? 'fill-current' : ''} />
              </button>
            </div>

            <div className="space-y-4 pt-6 border-t border-border">
              {[
                { icon: Truck, text: 'Free shipping on orders over $200' },
                { icon: RotateCcw, text: '30-day hassle-free returns' },
                { icon: Shield, text: 'Authentic craftsmanship guarantee' },
              ].map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-center gap-3 text-sm text-muted-foreground">
                  <Icon size={16} className="text-gold flex-shrink-0" />
                  {text}
                </div>
              ))}
            </div>

            <div className="mt-8 pt-8 border-t border-border">
              <h3 className="text-xs font-body font-medium letter-wide uppercase text-muted-foreground mb-4">
                Details
              </h3>
              <ul className="space-y-2">
                {product.details.map((detail, i) => (
                  <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                    <span className="text-gold mt-1">•</span>
                    {detail}
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>
        </div>

        <ReviewsSection productId={product.id} />

        {related.length > 0 && (
          <section className="mt-20 lg:mt-28">
            <h2 className="font-heading text-2xl lg:text-3xl mb-8">You May Also Like</h2>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
              {related.map((item) => (
                <ProductCard key={item.id} product={item} />
              ))}
            </div>
          </section>
        )}
      </PageBody>
    </PageMain>
  );
}
