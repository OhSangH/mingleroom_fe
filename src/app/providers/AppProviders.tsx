import { type ReactNode, useEffect, useMemo } from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ErrorBoundary } from 'react-error-boundary';
import { Toaster } from 'sonner';

import theme from '@/app/theme/theme';
import LoadingScreen from '@/shared/ui/LoadingScreen';
import { useAuthStore } from '@/features/auth/store/authStore';

type AppProvidersProps = {
  children: ReactNode;
};

function initSentry() {
  // TODO(12): 오류 모니터링을 위한 Sentry 초기화.
  // - 이유: 스터디 빌드 중 크래시와 성능 문제를 수집하기 위함.
  // - 단계: 렌더 전에 DSN, 환경, 트레이싱 옵션을 설정.
  // - 완료 조건: 강제 에러가 Sentry 대시보드에 표시됨.
}

function initI18n() {
  // TODO(13): 기본 로케일과 리소스 번들로 i18n 초기화.
  // - 이유: 번역 연결 없이 로컬라이제이션 워크플로를 준비하기 위함.
  // - 단계: i18next 설정, 기본 리소스 추가, 언어 설정.
  // - 완료 조건: 샘플 컴포넌트에서 t('key')가 정상 해석됨.
}

export default function AppProviders({ children }: AppProvidersProps) {
  const queryClient = useMemo(() => new QueryClient(), []);

  useEffect(() => {
    initSentry();
    initI18n();
    useAuthStore.getState().bootstrap();
  }, []);

  return (
    <ErrorBoundary fallback={<LoadingScreen label='문제가 발생했어요.' />}>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider theme={theme}>
          {children}
          <Toaster richColors position='top-right' />
        </ThemeProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}
