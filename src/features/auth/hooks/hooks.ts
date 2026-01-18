import { useAuthStore } from '../store/authStore';

export function useAuth() {
  const { user, isLoading, hasBootstrapped } = useAuthStore((state) => ({
    user: state.user,
    isLoading: state.isLoading,
    hasBootstrapped: state.hasBootstrapped,
  }));

  const isAuthenticated = Boolean(user);

  return {
    user,
    isAuthenticated,
    isLoading,
    hasBootstrapped,
  };
}
