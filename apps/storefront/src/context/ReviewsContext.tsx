import React, { createContext, useContext, useState, useCallback } from 'react';

export interface Review {
  id: string;
  productId: string;
  author: string;
  rating: number;
  text: string;
  date: string;
}

interface ReviewsContextType {
  getReviews: (productId: string) => Review[];
  addReview: (productId: string, author: string, rating: number, text: string) => void;
  getAverageRating: (productId: string) => { avg: number; count: number } | null;
}

const ReviewsContext = createContext<ReviewsContextType | undefined>(undefined);

// Seed some demo reviews
const seedReviews: Review[] = [
  { id: 'r1', productId: 'pnj-001', author: 'Arjun M.', rating: 5, text: 'Absolutely stunning quality. The silk feels incredible and the embroidery is exquisite.', date: '2026-02-15' },
  { id: 'r2', productId: 'pnj-001', author: 'Rahul K.', rating: 4, text: 'Beautiful Punjabi, fits well. Slightly long in the arms for me but overall excellent.', date: '2026-01-28' },
  { id: 'r3', productId: 'tsh-001', author: 'David L.', rating: 5, text: 'Best t-shirt I\'ve ever owned. The Pima cotton is incredibly soft.', date: '2026-02-20' },
  { id: 'r4', productId: 'sht-001', author: 'James W.', rating: 5, text: 'Perfect summer shirt. Light, breathable, and looks fantastic.', date: '2026-03-01' },
];

export function ReviewsProvider({ children }: { children: React.ReactNode }) {
  const [reviews, setReviews] = useState<Review[]>(seedReviews);

  const getReviews = useCallback((productId: string) => {
    return reviews.filter(r => r.productId === productId).sort((a, b) => b.date.localeCompare(a.date));
  }, [reviews]);

  const addReview = useCallback((productId: string, author: string, rating: number, text: string) => {
    const newReview: Review = {
      id: `r-${Date.now()}`,
      productId,
      author: author.trim(),
      rating,
      text: text.trim(),
      date: new Date().toISOString().split('T')[0],
    };
    setReviews(prev => [newReview, ...prev]);
  }, []);

  const getAverageRating = useCallback((productId: string) => {
    const productReviews = reviews.filter(r => r.productId === productId);
    if (productReviews.length === 0) return null;
    const avg = productReviews.reduce((sum, r) => sum + r.rating, 0) / productReviews.length;
    return { avg: Math.round(avg * 10) / 10, count: productReviews.length };
  }, [reviews]);

  return (
    <ReviewsContext.Provider value={{ getReviews, addReview, getAverageRating }}>
      {children}
    </ReviewsContext.Provider>
  );
}

export function useReviews() {
  const ctx = useContext(ReviewsContext);
  if (!ctx) throw new Error('useReviews must be used within ReviewsProvider');
  return ctx;
}
