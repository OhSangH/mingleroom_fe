export const endpoints = {
  auth: {
    login: '/auth/login',
    signup: '/auth/join',
    me: '/auth/me',
  },
  rooms: {
    list: '/rooms',
    detail: (roomId: string) => `/rooms/${roomId}`,
  },
};
