import { useCallback } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useAuth } from '@/contexts/auth-context';
import { useLogoutMutation } from '@/hooks/auth/use-logout-mutation';

export function useLogout() {
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const logoutMutation = useLogoutMutation();

  const logout = useCallback(() => {
    void logoutMutation.mutateAsync().finally(() => {
      signOut();
      // Defer navigation so Radix dropdown flushSync does not nest router updates.
      requestAnimationFrame(() => {
        navigate({ to: '/login', replace: true });
      });
    });
  }, [logoutMutation, navigate, signOut]);

  return {
    logout,
    isPending: logoutMutation.isPending,
  };
}
