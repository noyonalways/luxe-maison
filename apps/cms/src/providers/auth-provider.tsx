import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import {
  AuthContext,
  type UserProfile,
} from '@/contexts/auth-context';
import {
  clearAuthSession,
  getStoredToken,
  getStoredUser,
  isStaffRole,
  setAuthSession,
} from '@/lib/auth-session';
import { useAuthSession } from '@/hooks/auth/use-auth-session';
import { authKeys } from '@/hooks/auth/auth-keys';
import { permissionsKeys } from '@/hooks/permissions/permissions-keys';
import { clearPermissionsCache } from '@/lib/permissions-cache';

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const [user, setUser] = useState<UserProfile | null>(() => getStoredUser());
  const sessionQuery = useAuthSession();

  const applySession = useCallback(
    (profile: UserProfile) => {
      const token = getStoredToken();
      if (token) setAuthSession(profile, token);
      setUser(profile);
      queryClient.setQueryData(authKeys.session(), profile);
      void queryClient.invalidateQueries({ queryKey: permissionsKeys.matrix() });
    },
    [queryClient],
  );

  const signOut = useCallback(() => {
    clearAuthSession();
    clearPermissionsCache();
    setUser(null);
    queryClient.removeQueries({ queryKey: authKeys.all });
    queryClient.removeQueries({ queryKey: permissionsKeys.all });
  }, [queryClient]);

  useEffect(() => {
    if (sessionQuery.data) {
      if (!isStaffRole(sessionQuery.data.role)) {
        signOut();
        return;
      }

      const token = getStoredToken();
      if (token) setAuthSession(sessionQuery.data, token);
      setUser(sessionQuery.data);
    }
  }, [sessionQuery.data, signOut]);

  useEffect(() => {
    if (sessionQuery.isError) {
      signOut();
    }
  }, [sessionQuery.isError, signOut]);

  const updateProfile = (data: Partial<Pick<UserProfile, 'name' | 'avatar'>>) => {
    setUser((prev) => {
      if (!prev) return null;
      const next = { ...prev, ...data };
      const token = getStoredToken();
      if (token) setAuthSession(next, token);
      return next;
    });
  };

  const hasToken = Boolean(getStoredToken());

  const value = useMemo(
    () => ({
      user: hasToken ? user : null,
      isAuthenticated: Boolean(hasToken && user),
      isRestoringSession: hasToken && sessionQuery.isFetching,
      updateProfile,
      applySession,
      signOut,
    }),
    [user, hasToken, sessionQuery.isFetching, applySession, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
