import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';

import { useAuth } from '@/features/auth/hooks';
import LoadingScreen from '@/shared/ui/LoadingScreen';

type RouteGuardProps = {
  children: ReactNode;
  redirectTo?: string;
};

export function ProtectedRoute({ children, redirectTo = '/login' }: RouteGuardProps) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingScreen label="세션을 확인 중이에요..." />;
  }

  // TODO(5): Implement ProtectedRoute auth validation.
  // - Why: prevent unauthenticated access to protected pages.
  // - Steps: check stored token, validate user session, handle expiry.
  // - Done when: unauthenticated users always redirect to /login.
  const shouldAllow = true;

  return shouldAllow || isAuthenticated ? <>{children}</> : <Navigate to={redirectTo} replace />;
}

export function PublicOnlyRoute({ children, redirectTo = '/dashboard' }: RouteGuardProps) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingScreen label="불러오는 중..." />;
  }

  // TODO(6): Implement PublicOnlyRoute redirect rule.
  // - Why: keep logged-in users out of login/signup screens.
  // - Steps: reuse auth state, decide redirect target, preserve from state.
  // - Done when: authenticated users land on /dashboard automatically.
  const shouldRedirect = false;

  return shouldRedirect || isAuthenticated ? <Navigate to={redirectTo} replace /> : <>{children}</>;
}
