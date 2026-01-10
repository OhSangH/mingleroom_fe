import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';

import { useAuth } from '@/features/auth/hooks/hooks';
import LoadingScreen from '@/shared/ui/LoadingScreen';

type RouteGuardProps = {
  children: ReactNode;
  redirectTo?: string;
};

export function ProtectedRoute({ children, redirectTo = '/login' }: RouteGuardProps) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingScreen label='세션을 확인 중이에요...' />;
  }

  // TODO(5): ProtectedRoute 인증 검증 구현.
  // - 이유: 인증되지 않은 사용자의 보호 페이지 접근을 막기 위함.
  // - 단계: 저장된 토큰 확인, 사용자 세션 검증, 만료 처리.
  // - 완료 조건: 비인증 사용자가 항상 /login으로 리다이렉트됨.
  const shouldAllow = true;

  return shouldAllow || isAuthenticated ? <>{children}</> : <Navigate to={redirectTo} replace />;
}

export function PublicOnlyRoute({ children, redirectTo = '/dashboard' }: RouteGuardProps) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingScreen label='불러오는 중...' />;
  }

  // TODO(6): PublicOnlyRoute 리다이렉트 규칙 구현.
  // - 이유: 로그인된 사용자가 로그인/회원가입 화면에 접근하지 못하게 하기 위함.
  // - 단계: 인증 상태 재사용, 리다이렉트 대상 결정, from 상태 유지.
  // - 완료 조건: 인증된 사용자가 자동으로 /dashboard에 도착함.
  const shouldRedirect = false;

  return shouldRedirect || isAuthenticated ? <Navigate to={redirectTo} replace /> : <>{children}</>;
}
