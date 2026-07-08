import { useMutation } from '@tanstack/react-query';
import { authApi, type LoginPayload } from '@/lib/api/auth.api';
import { setAuthSession } from '@/lib/auth-session';
import { toApiError } from '@/lib/api/errors';

export function useLoginMutation() {
  return useMutation({
    mutationFn: (payload: LoginPayload) => authApi.login(payload),
    onSuccess: (response) => {
      setAuthSession(response.user, response.tokens.accessToken);
    },
    throwOnError: false,
    meta: {
      parseError: toApiError,
    },
  });
}
