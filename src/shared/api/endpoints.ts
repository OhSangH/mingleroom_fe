export const endpoints = {
  auth: { login: '/auth/login', signup: '/auth/join', me: '/auth/me', logout: '/auth/logout', refresh: '/auth/refresh' },
  rooms: {
    list: '/room', create: '/room/create',
    detail: (id: string) => `/room/${encodeURIComponent(id)}`,
    members: (id: string) => `/room/${encodeURIComponent(id)}/members`,
    join: (id: string) => `/room/${encodeURIComponent(id)}/join/me`,
    leave: (id: string) => `/room/${encodeURIComponent(id)}/leave/me`,
  },
  workspaces: '/workspace',
};
