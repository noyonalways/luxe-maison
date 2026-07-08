export const campaignKeys = {
  all: ['campaigns'] as const,
  list: (activeOnly = false) => [...campaignKeys.all, 'list', { activeOnly }] as const,
  detail: (id: string) => [...campaignKeys.all, 'detail', id] as const,
};
