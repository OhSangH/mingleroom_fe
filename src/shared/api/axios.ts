import axios from 'axios';

import { env } from '@/shared/lib/env';

export const apiClient = axios.create({
  baseURL: env.apiBaseUrl,
  withCredentials: true,
});

apiClient.interceptors.request.use((config) => {
  // TODO(1): Inject access token into request headers.
  // - Why: authenticated endpoints require bearer tokens.
  // - Steps: read token from auth store, set Authorization header.
  // - Done when: protected API responds without 401.
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    // TODO(2): Implement 401 refresh + retry flow.
    // - Why: keep sessions alive without manual re-login.
    // - Steps: call refresh endpoint, update token, retry original request.
    // - Done when: a forced 401 triggers exactly one retry.
    return Promise.reject(error);
  }
);
