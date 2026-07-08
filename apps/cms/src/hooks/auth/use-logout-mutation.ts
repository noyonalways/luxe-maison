import { useMutation } from '@tanstack/react-query';
import { authApi } from '@/lib/api/auth.api';

export function useLogoutMutation() {
  return useMutation({
    mutationFn: () => authApi.logout(),
  });
}
