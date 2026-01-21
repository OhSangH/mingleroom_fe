import type { User } from '@/features/user/types';
import { create } from 'zustand';
import { fetchMe, logoutApi, refreshToken } from '../api/api';

let bootstrapPromise: Promise<void> | null = null;

type AuthState = {
  user: User | null;
  accessToken: string | null;
  isLoading: boolean;
  hasBootstrapped: boolean;

  setAccessToken: (token: string | null) => void;
  setUser: (user: User | null) => void;
  bootstrap: () => Promise<void>;

  logout: () => Promise<void>;
  clearAuth: () => void;
};

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  accessToken: null,
  isLoading: false,
  hasBootstrapped: false,

  setAccessToken: (token) => {
    // DONE(4): 액세스 토큰을 스토어 저장.
    // - 이유: 새로고침 사이에 인증 상태를 유지하기 위함.
    // - 단계: 상태 업데이트, 쿠키에 동기화.
    // - 완료 조건: 리로드 후에도 토큰이 유지되고 axios에서 읽힘.
    if (!token) {
      localStorage.removeItem('hasSession');
      get().clearAuth();
      throw new Error('토큰이 존재하지 않습니다.');
    }
    set({ accessToken: token });
  },
  setUser: (meUser) => {
    // DONE(4): 인증 후 사용자 프로필 상태 업데이트.
    // - 이유: UI 표시를 위해 사용자 이름, 아바타, ID가 필요함.
    // - 단계: 사용자 객체 저장, 로그아웃 시 null 유지.
    // - 완료 조건: 로그인 후 헤더에 올바른 사용자 이름 표시.
    set({ user: meUser });
  },
  bootstrap: async () => {
    // DONE(4): 앱 로드 시 인증 상태 하이드레이트.
    // - 이유: 수동 로그인 없이 새로고침 후 세션을 유지하기 위함.
    // - 단계: 토큰 읽기, fetchMe 호출, 상태 업데이트.
    // - 완료 조건: 로딩 스피너가 끝나고 사용자 상태가 설정됨.
    if (get().hasBootstrapped) return;

    const hasSession = localStorage.getItem('hasSession');
    if (!hasSession) {
      set({ isLoading: false, hasBootstrapped: true, user: null, accessToken: null });
      return;
    }

    if (bootstrapPromise) return bootstrapPromise;

    bootstrapPromise = (async () => {
      set({ isLoading: true });
      try {
        if (hasSession) {
          await refreshToken();
        }
        const me = await fetchMe();
        set({ user: me });
      } catch {
        localStorage.removeItem('hasSession');
        get().clearAuth();
      } finally {
        set({ isLoading: false, hasBootstrapped: true });
        bootstrapPromise = null;
      }
    })();

    return bootstrapPromise;
  },
  logout: async () => {
    // DONE(4): 인증 상태와 캐시된 토큰 초기화.
    // - 이유: 로그아웃 시 민감한 세션 데이터를 제거하기 위함.
    // - 단계: 스토어 초기화, 스토리지 키 삭제, 쿼리 무효화.
    // - 완료 조건: 보호 라우트가 /login으로 리다이렉트됨.
    try {
      await logoutApi();
    } finally {
      get().clearAuth();
    }
  },
  clearAuth: () => {
    set({ user: null, accessToken: null, isLoading: false });
  },
}));
