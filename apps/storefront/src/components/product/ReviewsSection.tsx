import { useState } from 'react';
import { motion } from 'framer-motion';
import { Star } from 'lucide-react';
import { z } from 'zod';
import { useReviews, useReviewsForProduct } from '@/context/ReviewsContext';

const reviewSchema = z.object({
  author: z.string().trim().min(2, 'Name must be at least 2 characters').max(50, 'Max 50 characters'),
  rating: z.number().min(1, 'Please select a rating').max(5),
  text: z.string().trim().min(10, 'Review must be at least 10 characters').max(500, 'Max 500 characters'),
});

export default function ReviewsSection({ productId }: { productId: string }) {
  const { addReview } = useReviews();
  const { reviews, isLoading } = useReviewsForProduct(productId);

  const [showForm, setShowForm] = useState(false);
  const [author, setAuthor] = useState('');
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [text, setText] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState('');

  const handleSubmit = async () => {
    const result = reviewSchema.safeParse({ author, rating, text });
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
    const response = await addReview(productId, author, rating, text);
    if (!response.success) {
      setSubmitError(response.error || 'Failed to submit review');
      return;
    }
    setAuthor('');
    setRating(0);
    setText('');
    setShowForm(false);
  };

  return (
    <section className="mt-20 lg:mt-28">
      <div className="flex items-center justify-between mb-8">
        <h2 className="font-heading text-2xl lg:text-3xl">Customer Reviews</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-6 py-2.5 border border-foreground text-sm font-medium letter-wide uppercase transition-smooth hover:bg-foreground hover:text-background"
        >
          {showForm ? 'Cancel' : 'Write a Review'}
        </button>
      </div>

      {/* Review Form */}
      {showForm && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="border border-border p-6 mb-10"
        >
          <h3 className="font-heading text-lg mb-5">Your Review</h3>

          {/* Star Rating */}
          <div className="mb-5">
            <p className="text-xs font-body font-semibold letter-wide uppercase text-muted-foreground mb-2">Rating</p>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map(star => (
                <button
                  key={star}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  onClick={() => { setRating(star); setErrors(prev => { const n = { ...prev }; delete n.rating; return n; }); }}
                  className="p-0.5 transition-smooth"
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

          {/* Name */}
          <div className="mb-4">
            <label className="block text-xs font-body font-semibold letter-wide uppercase text-muted-foreground mb-1.5">Name</label>
            <input
              type="text"
              value={author}
              onChange={e => setAuthor(e.target.value)}
              placeholder="Your name"
              className={`w-full px-4 py-3 border text-sm bg-background transition-smooth focus:outline-none focus:border-foreground ${errors.author ? 'border-destructive' : 'border-border'}`}
            />
            {errors.author && <p className="text-xs text-destructive mt-1">{errors.author}</p>}
          </div>

          {/* Review text */}
          <div className="mb-5">
            <label className="block text-xs font-body font-semibold letter-wide uppercase text-muted-foreground mb-1.5">Review</label>
            <textarea
              value={text}
              onChange={e => setText(e.target.value.slice(0, 500))}
              placeholder="Share your experience with this product..."
              rows={4}
              className={`w-full px-4 py-3 border text-sm bg-background transition-smooth focus:outline-none focus:border-foreground resize-none ${errors.text ? 'border-destructive' : 'border-border'}`}
            />
            <div className="flex justify-between mt-1">
              {errors.text && <p className="text-xs text-destructive">{errors.text}</p>}
              <p className="text-xs text-muted-foreground ml-auto">{text.length}/500</p>
            </div>
          </div>

          <button onClick={() => void handleSubmit()} className="px-8 py-3 bg-primary text-primary-foreground text-sm font-medium letter-wide uppercase transition-smooth hover:opacity-90">
            Submit Review
          </button>
          {submitError && <p className="text-sm text-destructive mt-3">{submitError}</p>}
        </motion.div>
      )}

      {isLoading ? (
        <p className="text-sm text-muted-foreground py-6">Loading reviews…</p>
      ) : reviews.length > 0 ? (
        <div className="space-y-6">
          {reviews.map(review => (
            <motion.div
              key={review.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="border-b border-border pb-6 last:border-0"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={12} className={i < review.rating ? 'fill-primary text-primary' : 'text-border'} />
                    ))}
                  </div>
                  <span className="text-sm font-medium">{review.author}</span>
                </div>
                <span className="text-xs text-muted-foreground">{review.date}</span>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">{review.text}</p>
            </motion.div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground py-8 text-center">No reviews yet. Be the first to share your experience!</p>
      )}
    </section>
  );
}
