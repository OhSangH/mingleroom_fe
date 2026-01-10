import type { User } from '../user/types';

export type LoginPayload = {
  email: string;
  password: string;
};

export type SignupPayload = {
  username: string;
  email: string;
  password: string;
};

export type AuthResponse = {
  user: User;
  accessToken: string;
};

export type AuthResponseDto = Partial<AuthResponse> & {
  token?: string;
  accessToken?: string;
  user?: User;
  principal?: User;
  data?: Partial<AuthResponse> & { token?: string; accessToken?: string; user?: User; principal?: User };
};
