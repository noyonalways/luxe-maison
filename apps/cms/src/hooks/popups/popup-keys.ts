export const popupKeys = {
  all: ['popups'] as const,
  list: () => [...popupKeys.all, 'list'] as const,
  detail: (id: string) => [...popupKeys.all, 'detail', id] as const,
};
