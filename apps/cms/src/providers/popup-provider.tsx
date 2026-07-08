import { useCallback, useMemo, type ReactNode } from 'react';
import { PopupContext } from '@/contexts/popup-context';
import { useAuth } from '@/contexts/auth-context';
import { useRole } from '@/contexts/role-context';
import { usePopupsList } from '@/hooks/popups/use-popups-list';
import { useCreatePopupMutation } from '@/hooks/popups/use-create-popup-mutation';
import { useUpdatePopupMutation } from '@/hooks/popups/use-update-popup-mutation';
import { useSetPopupEnabledMutation } from '@/hooks/popups/use-set-popup-enabled-mutation';
import { useDeletePopupMutation } from '@/hooks/popups/use-delete-popup-mutation';
import { toApiError } from '@/lib/api/errors';
import type { CreatePopupPayload, UpdatePopupPayload } from '@/lib/api/popups.api';

export function PopupProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth();
  const { hasAccess } = useRole();
  const canViewPopups = isAuthenticated && hasAccess('popup');

  const { data, isLoading, error } = usePopupsList(canViewPopups);
  const createMutation = useCreatePopupMutation();
  const updateMutation = useUpdatePopupMutation();
  const setEnabledMutation = useSetPopupEnabledMutation();
  const deleteMutation = useDeletePopupMutation();

  const popups = data ?? [];

  const addPopup = useCallback(
    async (popup: CreatePopupPayload) => createMutation.mutateAsync(popup),
    [createMutation],
  );

  const updatePopup = useCallback(
    async (id: string, partial: UpdatePopupPayload) =>
      updateMutation.mutateAsync({ id, popup: partial }),
    [updateMutation],
  );

  const setPopupEnabled = useCallback(
    async (id: string, enabled: boolean) => setEnabledMutation.mutateAsync({ id, enabled }),
    [setEnabledMutation],
  );

  const deletePopup = useCallback(
    async (id: string) => {
      await deleteMutation.mutateAsync(id);
    },
    [deleteMutation],
  );

  const getActivePopups = useCallback(
    () => popups.filter((p) => p.enabled).sort((a, b) => b.priority - a.priority),
    [popups],
  );

  const isSaving =
    createMutation.isPending ||
    updateMutation.isPending ||
    setEnabledMutation.isPending ||
    deleteMutation.isPending;

  const value = useMemo(
    () => ({
      popups,
      isLoading: canViewPopups && isLoading,
      error: error ? toApiError(error).message : null,
      addPopup,
      updatePopup,
      setPopupEnabled,
      deletePopup,
      getActivePopups,
      isSaving,
    }),
    [
      popups,
      canViewPopups,
      isLoading,
      error,
      addPopup,
      updatePopup,
      setPopupEnabled,
      deletePopup,
      getActivePopups,
      isSaving,
    ],
  );

  return <PopupContext.Provider value={value}>{children}</PopupContext.Provider>;
}
