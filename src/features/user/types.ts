export type User = {
  id: number;
  email: string;
  username: string;
  role: UserRole;
  profileImg: string | null;
  isBanned: boolean;
  createdAt: string; // ✅ 프론트 표준화
  lastLoginAt: string | null;
  passwordUpdatedAt: string;
};
export type UserRole = 'USER' | 'ADMIN'; // 네 서버 enum에 맞춰 확장

export type UserApi = {
  id: number;
  email: string;
  username: string;
  role: UserRole;
  profileImg: string | null;
  isBanned: boolean;
  createdAt: string; // ✅ 서버 그대로(현재 오타/네이밍)
  lastLoginAt: string | null;
  passwordUpdatedAt: string;
};
