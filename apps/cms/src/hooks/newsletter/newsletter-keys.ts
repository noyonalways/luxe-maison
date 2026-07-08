export const newsletterKeys = {
  all: ['newsletter'] as const,
  subscribers: () => [...newsletterKeys.all, 'subscribers'] as const,
  subscriber: (id: string) => [...newsletterKeys.all, 'subscriber', id] as const,
  emails: () => [...newsletterKeys.all, 'emails'] as const,
  email: (id: string) => [...newsletterKeys.all, 'email', id] as const,
};
