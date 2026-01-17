import { useAuthStore } from '../store/authStore';

export function useAuth() {
  const { user, isLoading } = useAuthStore((state) => ({
    user: state.user,
    isLoading: state.isLoading,
  }));

  const isAuthenticated = Boolean(user);

  return {
    user,
    isAuthenticated,
    isLoading,
  };
}
