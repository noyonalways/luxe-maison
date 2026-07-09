import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { Star } from 'lucide-react';
import { z } from 'zod';
import { useAuth } from '@/context/AuthContext';
import { useReviews, useReviewsForProduct, useMyProductReview } from '@/context/ReviewsContext';

const reviewSchema = z.object({
  rating: z.number().min(1, 'Please select a rating').max(5),
  text: z.string().trim().min(10, 'Review must be at least 10 characters').max(500, 'Max 500 characters'),
});

export default function ReviewsSection({ productId }: { productId: string }) {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const { addReview } = useReviews();
  const { reviews, isLoading } = useReviewsForProduct(productId);
  const { data: myReview, isLoading: myReviewLoading } = useMyProductReview(
    productId,
    isAuthenticated,
  );
  const pathname = usePathname();

  const [showForm, setShowForm] = useState(false);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [text, setText] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loginHref = `/login?redirect=${encodeURIComponent(pathname)}`;
  const hasReviewed = Boolean(myReview);
  const canWriteReview = isAuthenticated && !hasReviewed;

  const handleSubmit = async () => {
    const result = reviewSchema.safeParse({ rating, text });
    if (!result.success) {
      const errs: Record<string, string> = {};
      result.error.issues.forEach((i) => {
        errs[i.path[0] as string] = i.message;
      });
      setErrors(errs);
      return;
    }

    setErrors({});
    setSubmitError('');
    setIsSubmitting(true);
    const response = await addReview(productId, rating, text);
    setIsSubmitting(false);

    if (!response.success) {
      setSubmitError(response.error || 'Failed to submit review');
      return;
    }

    setRating(0);
    setText('');
    setShowForm(false);
  };

  const renderWriteButton = () => {
    if (authLoading || myReviewLoading) {
      return (
        <span className="text-sm text-muted-foreground">Checking account…</span>
      );
    }

    if (!isAuthenticated) {
      return (
        <Link
          href={loginHref}
          className="px-6 py-2.5 border border-foreground text-sm font-medium letter-wide uppercase transition-smooth hover:bg-foreground hover:text-background"
        >
          Sign in to Review
        </Link>
      );
    }

    if (hasReviewed) {
      return (
        <span className="text-sm text-muted-foreground">You&apos;ve reviewed this product</span>
      );
    }

    return (
      <button
        type="button"
        onClick={() => setShowForm(!showForm)}
        className="px-6 py-2.5 border border-foreground text-sm font-medium letter-wide uppercase transition-smooth hover:bg-foreground hover:text-background"
      >
        {showForm ? 'Cancel' : 'Write a Review'}
      </button>
    );
  };

  return (
    <section className="mt-20 lg:mt-28">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <h2 className="font-heading text-2xl lg:text-3xl">Customer Reviews</h2>
        {renderWriteButton()}
      </div>

      {!isAuthenticated && !authLoading && (
        <p className="text-sm text-muted-foreground mb-8 border border-border bg-secondary/40 px-4 py-3">
          <Link href={loginHref} className="text-foreground underline underline-offset-4 hover:text-gold">
            Sign in
          </Link>{' '}
          to share your experience with this product.
        </p>
      )}

      {canWriteReview && showForm && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="border border-border p-6 mb-10"
        >
          <h3 className="font-heading text-lg mb-1">Your Review</h3>
          <p className="text-xs text-muted-foreground mb-5">
            Posting as <span className="font-medium text-foreground">{user?.name}</span>
          </p>

          <div className="mb-5">
            <p className="text-xs font-body font-semibold letter-wide uppercase text-muted-foreground mb-2">
              Rating
            </p>
            <div className="flex gap-1" role="radiogroup" aria-label="Rating">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  onClick={() => {
                    setRating(star);
                    setErrors((prev) => {
                      const next = { ...prev };
                      delete next.rating;
                      return next;
                    });
                  }}
                  className="p-0.5 transition-smooth"
                  aria-label={`${star} star${star > 1 ? 's' : ''}`}
                  aria-pressed={rating === star}
                >
                  <Star
                    size={22}
                    className={`transition-smooth ${
                      star <= (hoverRating || rating) ? 'fill-primary text-primary' : 'text-border'
                    }`}
                  />
                </button>
              ))}
            </div>
            {errors.rating && <p className="text-xs text-destructive mt-1">{errors.rating}</p>}
          </div>

          <div className="mb-5">
            <label
              htmlFor="review-text"
              className="block text-xs font-body font-semibold letter-wide uppercase text-muted-foreground mb-1.5"
            >
              Review
            </label>
            <textarea
              id="review-text"
              value={text}
              onChange={(e) => setText(e.target.value.slice(0, 500))}
              placeholder="Share your experience with this product..."
              rows={4}
              className={`w-full px-4 py-3 border text-sm bg-background transition-smooth focus:outline-none focus:border-foreground resize-none ${errors.text ? 'border-destructive' : 'border-border'}`}
            />
            <div className="flex justify-between mt-1">
              {errors.text && <p className="text-xs text-destructive">{errors.text}</p>}
              <p className="text-xs text-muted-foreground ml-auto">{text.length}/500</p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => void handleSubmit()}
            disabled={isSubmitting}
            className="px-8 py-3 bg-primary text-primary-foreground text-sm font-medium letter-wide uppercase transition-smooth hover:opacity-90 disabled:opacity-60"
          >
            {isSubmitting ? 'Submitting…' : 'Submit Review'}
          </button>
          {submitError && <p className="text-sm text-destructive mt-3">{submitError}</p>}
        </motion.div>
      )}

      {isLoading ? (
        <p className="text-sm text-muted-foreground py-6">Loading reviews…</p>
      ) : reviews.length > 0 ? (
        <div className="space-y-6">
          {reviews.map((review) => {
            const isOwn = myReview?.id === review.id;
            return (
              <motion.div
                key={review.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`border-b border-border pb-6 last:border-0 ${isOwn ? 'bg-secondary/30 -mx-4 px-4 py-4 border border-border' : ''}`}
              >
                <div className="flex items-center justify-between mb-2 gap-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="flex shrink-0">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          size={12}
                          className={i < review.rating ? 'fill-primary text-primary' : 'text-border'}
                        />
                      ))}
                    </div>
                    <span className="text-sm font-medium truncate">
                      {review.author}
                      {isOwn && (
                        <span className="ml-2 text-[10px] font-normal uppercase tracking-wide text-muted-foreground">
                          You
                        </span>
                      )}
                    </span>
                  </div>
                  <span className="text-xs text-muted-foreground shrink-0">{review.date}</span>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">{review.text}</p>
              </motion.div>
            );
          })}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground py-8 text-center">
          No reviews yet. Be the first to share your experience!
        </p>
      )}
    </section>
  );
}
