import { useCallback, useMemo, type ReactNode } from 'react';
import type { HomepageContent } from '@luxe-maison/shared';
import { HomepageContext } from '@/contexts/homepage-context';
import { useAuth } from '@/contexts/auth-context';
import { useRole } from '@/contexts/role-context';
import { useHomepageQuery } from '@/hooks/homepage/use-homepage-query';
import { useUpdateHomepageMutation } from '@/hooks/homepage/use-update-homepage-mutation';
import { useResetHomepageMutation } from '@/hooks/homepage/use-reset-homepage-mutation';
import { toApiError } from '@/lib/api/errors';

export function HomepageProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth();
  const { hasAccess } = useRole();
  const canViewHomepage = isAuthenticated && hasAccess('homepage');

  const { data, isLoading, error } = useHomepageQuery(canViewHomepage);
  const updateMutation = useUpdateHomepageMutation();
  const resetMutation = useResetHomepageMutation();

  const content = data ?? null;

  const updateHomepage = useCallback(
    async (partial: Partial<HomepageContent>) => {
      await updateMutation.mutateAsync(partial);
    },
    [updateMutation],
  );

  const resetHomepage = useCallback(async () => {
    await resetMutation.mutateAsync();
  }, [resetMutation]);

  const isSaving = updateMutation.isPending || resetMutation.isPending;

  const value = useMemo(
    () => ({
      content,
      isLoading: canViewHomepage && isLoading,
      error: error ? toApiError(error).message : null,
      updateHomepage,
      resetHomepage,
      isSaving,
    }),
    [content, canViewHomepage, isLoading, error, updateHomepage, resetHomepage, isSaving],
  );

  return <HomepageContext.Provider value={value}>{children}</HomepageContext.Provider>;
}
