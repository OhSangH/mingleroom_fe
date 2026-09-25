export const env = {
  // A same-origin dev proxy keeps REST, refresh cookies and SockJS together.
  apiBaseUrl: (import.meta.env.VITE_API_BASE_URL || '/api').replace(/\/$/, ''),
};
