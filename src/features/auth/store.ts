import { create } from 'zustand';

import type { User } from '@/entities/user/types';

type AuthState = {
  user: User | null;
  accessToken: string | null;
  isLoading: boolean;
  setAccessToken: (token: string | null) => void;
  setUser: (user: User | null) => void;
  bootstrap: () => Promise<void>;
  logout: () => void;
};

export const useAuthStore = create<AuthState>(() => ({
  user: null,
  accessToken: null,
  isLoading: false,
  setAccessToken: () => {
    // TODO(4): Persist access token into store and storage.
    // - Why: keep authenticated state between refreshes.
    // - Steps: update state, sync to localStorage or cookie.
    // - Done when: token survives reload and can be read by axios.
    throw new Error('TODO');
  },
  setUser: () => {
    // TODO(4): Update user profile state after auth.
    // - Why: UI needs user name, avatar, and id for display.
    // - Steps: store user object, keep null when logged out.
    // - Done when: header shows correct user name after login.
    throw new Error('TODO');
  },
  bootstrap: async () => {
    // TODO(4): Hydrate auth state on app load.
    // - Why: keep session after refresh without manual login.
    // - Steps: read token, call fetchMe, update state.
    // - Done when: loading spinner ends with user state set.
    throw new Error('TODO');
  },
  logout: () => {
    // TODO(4): Clear auth state and cached tokens.
    // - Why: ensure logout removes sensitive session data.
    // - Steps: clear store, remove storage keys, invalidate queries.
    // - Done when: protected routes redirect to /login.
    throw new Error('TODO');
  },
}));
