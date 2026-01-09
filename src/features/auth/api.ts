import type { User } from '@/entities/user/types';

export type LoginPayload = {
  email: string;
  password: string;
};

export type SignupPayload = {
  name: string;
  email: string;
  password: string;
};

export type AuthResponse = {
  user: User;
  accessToken: string;
};

export async function login(_payload: LoginPayload): Promise<AuthResponse> {
  // TODO(3): Implement login API call.
  // - Why: authenticate users and receive access tokens.
  // - Steps: call /auth/login, map response, handle errors.
  // - Done when: valid credentials return user + token.
  throw new Error('TODO');
}

export async function signup(_payload: SignupPayload): Promise<AuthResponse> {
  // TODO(3): Implement signup API call.
  // - Why: create accounts and issue initial access tokens.
  // - Steps: call /auth/signup, map response, handle validation errors.
  // - Done when: new users can log in right after signup.
  throw new Error('TODO');
}

export async function fetchMe(): Promise<User> {
  // TODO(3): Implement fetch-me API call.
  // - Why: hydrate auth state on refresh or app start.
  // - Steps: call /auth/me, map response, handle 401.
  // - Done when: refresh loads user profile without flicker.
  throw new Error('TODO');
}
