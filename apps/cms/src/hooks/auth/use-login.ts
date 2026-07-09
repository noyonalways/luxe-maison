import { useCallback } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useAuth } from '@/contexts/auth-context';
import { isStaffRole } from '@/lib/auth-session';
import { toApiError } from '@/lib/api/errors';
import { cmsDashboard, resolveRoleSlug } from '@/lib/cms-navigation';
import { useLoginMutation } from '@/hooks/auth/use-login-mutation';

export function useLogin() {
  const navigate = useNavigate();
  const { applySession } = useAuth();
  const loginMutation = useLoginMutation();

  const login = useCallback(
    async (email: string, password: string) => {
      try {
        const response = await loginMutation.mutateAsync({ email, password });

        if (!isStaffRole(response.user.role)) {
          return { success: false as const, error: 'This login is for staff only.' };
        }

        applySession(response.user);
        navigate({ ...cmsDashboard(resolveRoleSlug(response.user)), replace: true });
        return { success: true as const, user: response.user };
      } catch (error) {
        const apiError = toApiError(error);
        return { success: false as const, error: apiError.message };
      }
    },
    [applySession, loginMutation, navigate],
  );

  return {
    login,
    isPending: loginMutation.isPending,
  };
}
