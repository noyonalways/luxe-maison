export interface Review {
  id: string;
  productId: string;
  customerId?: string;
  author: string;
  rating: number;
  text: string;
  date: string;
}
