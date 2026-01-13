import { useMemo } from 'react';

import { useAuthStore } from '../store/authStore';

export function useAuth() {
  const user = useAuthStore((state) => state.user);
  const accessToken = useAuthStore((state) => state.accessToken);
  const isLoading = useAuthStore((state) => state.isLoading);

  const isAuthenticated = useMemo(() => Boolean(accessToken), [accessToken]);

  return {
    user,
    isAuthenticated,
    isLoading,
  };
}
