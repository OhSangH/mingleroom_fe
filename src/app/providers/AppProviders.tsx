import { type ReactNode, useEffect, useMemo } from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ErrorBoundary } from 'react-error-boundary';
import { Toaster } from 'sonner';

import theme from '@/app/theme/theme';
import LoadingScreen from '@/shared/ui/LoadingScreen';

type AppProvidersProps = {
  children: ReactNode;
};

function initSentry() {
  // TODO(12): Initialize Sentry for error monitoring.
  // - Why: capture crashes and performance issues during study builds.
  // - Steps: set DSN, environment, and tracing options before render.
  // - Done when: a forced error appears in the Sentry dashboard.
}

function initI18n() {
  // TODO(13): Initialize i18n with default locale and resource bundles.
  // - Why: prepare localization workflow without wiring translations yet.
  // - Steps: configure i18next, add basic resources, set language.
  // - Done when: t('key') resolves in a sample component.
}

export default function AppProviders({ children }: AppProvidersProps) {
  const queryClient = useMemo(() => new QueryClient(), []);

  useEffect(() => {
    initSentry();
    initI18n();
  }, []);

  return (
    <ErrorBoundary fallback={<LoadingScreen label="문제가 발생했어요." />}>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider theme={theme}>
          {children}
          <Toaster richColors position="top-right" />
        </ThemeProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}
