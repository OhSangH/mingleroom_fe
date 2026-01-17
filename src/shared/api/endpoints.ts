export const endpoints = {
  auth: {
    login: '/auth/login',
    signup: '/auth/join',
    me: '/auth/me',
    logout: '/auth/logout',
  },
  rooms: {
    list: '/rooms',
    detail: (roomId: string) => `/rooms/${roomId}`,
  },
};
