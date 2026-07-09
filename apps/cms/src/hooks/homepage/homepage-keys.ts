export const homepageKeys = {
  all: ['homepage'] as const,
  detail: () => [...homepageKeys.all, 'detail'] as const,
};
