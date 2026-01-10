import type { User, UserApi } from '../types';

export function mapUser(api: UserApi): User {
  return {
    id: api.id,
    email: api.email,
    username: api.username,
    role: api.role,
    profileImg: api.profileImg,
    isBanned: api.isBanned,
    createdAt: api.createdAt,
    lastLoginAt: api.lastLoginAt,
    passwordUpdatedAt: api.passwordUpdatedAt,
  };
}
