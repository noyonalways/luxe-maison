export const homepageKeys = {
  all: ['homepage'] as const,
  content: () => [...homepageKeys.all, 'content'] as const,
};
