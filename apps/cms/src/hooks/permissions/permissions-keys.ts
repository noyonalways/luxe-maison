export const permissionsKeys = {
  all: ['permissions'] as const,
  matrix: () => [...permissionsKeys.all, 'matrix'] as const,
};
