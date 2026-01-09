import { rest } from 'msw';

export const handlers = [
  rest.get('/auth/me', (_req, res, ctx) => {
    return res(
      ctx.json({
        id: 'seed-user',
        name: '스터디 유저',
        email: 'study@example.com',
      })
    );
  }),
];
