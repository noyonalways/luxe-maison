export const productKeys = {
  all: ['products'] as const,
  list: () => [...productKeys.all, 'list'] as const,
  detail: (id: string) => [...productKeys.all, 'detail', id] as const,
};

export const reviewKeys = {
  all: ['reviews'] as const,
  byProduct: (productId: string) => [...reviewKeys.all, 'product', productId] as const,
  average: (productId: string) => [...reviewKeys.all, 'average', productId] as const,
};
