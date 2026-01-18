import { useAuthStore } from '../store/authStore';

export function useAuth() {
  const user = useAuthStore((s) => s.user);
  const isLoading = useAuthStore((s) => s.isLoading);
  const hasBootstrapped = useAuthStore((s) => s.hasBootstrapped);

  const isAuthenticated = Boolean(user);

  return {
    user,
    isAuthenticated,
    isLoading,
    hasBootstrapped,
  };
}
