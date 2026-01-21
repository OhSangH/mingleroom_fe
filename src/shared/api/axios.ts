import axios, { AxiosError, AxiosHeaders, type InternalAxiosRequestConfig } from 'axios';

import { env } from '@/shared/lib/env';
import { useAuthStore } from '@/features/auth/store/authStore';

export const apiClient = axios.create({
  baseURL: env.apiBaseUrl,
  withCredentials: true,
});

declare module 'axios' {
  export interface AxiosRequestConfig {
    _retry?: boolean;
    skipAuth?: boolean;
  }

  export interface InternalAxiosRequestConfig {
    _retry?: boolean;
    skipAuth?: boolean;
  }
}

const rawClient = axios.create({
  baseURL: env.apiBaseUrl,
  withCredentials: true,
});

function setBearer(config: InternalAxiosRequestConfig, token: string) {
  const headers = AxiosHeaders.from(config.headers);
  headers.set('Authorization', `Bearer ${token}`);
  config.headers = headers;
}

apiClient.interceptors.request.use((config) => {
  // DONE(1): Inject access token into request headers.
  // - 이유: 인증된 엔드포인트에는 베어러 토큰이 필요함.
  // - 단계: 인증 스토어에서 토큰 읽기, Authorization 헤더 설정.
  // - 완료 조건: 보호 API가 401 없이 응답함.
  if (config.skipAuth) return config;

  const token = useAuthStore.getState().accessToken;

  if (token) {
    setBearer(config, token);
  }

  return config;
});

let refreshPromise: Promise<string | null> | null = null;

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    // DONE(2): 401 갱신 + 재시도 흐름 구현.
    // - 이유: 인증된 엔드포인트에는 베어러 토큰이 필요함.
    // - 단계: 인증 스토어에서 토큰 읽기, Authorization 헤더 설정.
    // - 완료 조건: 보호 API가 401 없이 응답함.
    const status = error.response?.status;
    const originalConfig = error.config;

    if (!originalConfig || status !== 401) throw error;

    if (originalConfig?._retry) throw error;

    const url = originalConfig?.url ?? '';
    const isAuthEndpoint =
      url.includes('/auth/login') || url.includes('/auth/refresh') || url.includes('/auth/reissue');

    if (isAuthEndpoint) throw error;

    const hasSession = localStorage.getItem('hasSession');
    if (!hasSession) throw error;

    originalConfig._retry = true;

    try {
      if (!refreshPromise) {
        refreshPromise = (async () => {
          const res = await rawClient.post<{ accessToken: string }>('/auth/refresh', null);

          const newToken = res.data?.accessToken ?? null;
          useAuthStore.getState().setAccessToken(newToken);

          return newToken;
        })().finally(() => {
          refreshPromise = null;
        });
      }
      const newToken = await refreshPromise;

      if (!newToken) {
        localStorage.removeItem('hasSession');
        useAuthStore.getState().clearAuth();
        throw error;
      }

      setBearer(originalConfig, newToken);

      return apiClient.request(originalConfig);
    } catch (e) {
      useAuthStore.getState().clearAuth();
      throw e;
    }
  },
);
