export const campaignKeys = {
  all: ['campaigns'] as const,
  active: () => [...campaignKeys.all, 'active'] as const,
};
