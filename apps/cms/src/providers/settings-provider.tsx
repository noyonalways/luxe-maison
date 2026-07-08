import { useCallback, useMemo, type ReactNode } from 'react';
import type { StoreSettings } from '@luxe-maison/shared';
import { SettingsContext } from '@/contexts/settings-context';
import { useAuth } from '@/contexts/auth-context';
import { useRole } from '@/contexts/role-context';
import { useSettingsQuery } from '@/hooks/settings/use-settings-query';
import { useUpdateSettingsMutation } from '@/hooks/settings/use-update-settings-mutation';
import { useResetSettingsMutation } from '@/hooks/settings/use-reset-settings-mutation';
import { toApiError } from '@/lib/api/errors';

export function SettingsProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth();
  const { hasAccess } = useRole();
  const canViewSettings = isAuthenticated && hasAccess('settings');

  const { data, isLoading, error } = useSettingsQuery(canViewSettings);
  const updateMutation = useUpdateSettingsMutation();
  const resetMutation = useResetSettingsMutation();

  const settings = data ?? null;

  const updateSettings = useCallback(
    async (partial: Partial<StoreSettings>) => {
      await updateMutation.mutateAsync(partial);
    },
    [updateMutation],
  );

  const resetSettings = useCallback(async () => {
    await resetMutation.mutateAsync();
  }, [resetMutation]);

  const isSaving = updateMutation.isPending || resetMutation.isPending;

  const value = useMemo(
    () => ({
      settings,
      isLoading: canViewSettings && isLoading,
      error: error ? toApiError(error).message : null,
      updateSettings,
      resetSettings,
      isSaving,
    }),
    [settings, canViewSettings, isLoading, error, updateSettings, resetSettings, isSaving],
  );

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}
