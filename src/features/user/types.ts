export type User = {
  id: number;
  email: string;
  username: string;
  role: UserRole;
  profileImg: string | null;
  isBanned: boolean;
  createdAt: string;
  lastLoginAt: string | null;
  passwordUpdatedAt: string;
};
export type UserRole = 'USER' | 'ADMIN';

export type UserApi = {
  id: number;
  email: string;
  username: string;
  role: UserRole;
  profileImg: string | null;
  isBanned: boolean;
  createdAt: string;
  lastLoginAt: string | null;
  passwordUpdatedAt: string;
};
