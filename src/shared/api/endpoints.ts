export const endpoints = {
  auth: {
    login: '/auth/login',
    signup: '/auth/signup',
    me: '/auth/me',
  },
  rooms: {
    list: '/rooms',
    detail: (roomId: string) => `/rooms/${roomId}`,
  },
};
