import { http, HttpResponse } from 'msw';
// Opt-in development fixture only; no worker is started in the application.
export const handlers = [http.get('/api/auth/me', () => HttpResponse.json({
  id: 1, username: '테스트 사용자', email: 'test@example.test', role: 'USER',
  profileImg: null, isBanned: false, createdAt: '2026-01-01T00:00:00Z',
  lastLoginAt: null, passwordUpdatedAt: '2026-01-01T00:00:00Z',
}))];
