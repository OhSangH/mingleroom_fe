import type { User } from '@/features/user/types';
import { create } from 'zustand';

type AuthState = {
  user: User | null;
  accessToken: string | null;
  isLoading: boolean;
  setAccessToken: (token: string | null) => void;
  setUser: (user: User | null) => void;
  bootstrap: () => Promise<void>;
  logout: () => void;
  clearAuth: () => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  accessToken: null,
  isLoading: false,
  setAccessToken: (token) => {
    // TODO(4): 액세스 토큰을 스토어와 스토리지에 저장.
    // - 이유: 새로고침 사이에 인증 상태를 유지하기 위함.
    // - 단계: 상태 업데이트, localStorage 또는 쿠키에 동기화.
    // - 완료 조건: 리로드 후에도 토큰이 유지되고 axios에서 읽힘.
    if (token) localStorage.setItem('jwt', token);
    set({ accessToken: token });
    // throw new Error('TODO');
  },
  setUser: () => {
    // TODO(4): 인증 후 사용자 프로필 상태 업데이트.
    // - 이유: UI 표시를 위해 사용자 이름, 아바타, ID가 필요함.
    // - 단계: 사용자 객체 저장, 로그아웃 시 null 유지.
    // - 완료 조건: 로그인 후 헤더에 올바른 사용자 이름 표시.
    throw new Error('TODO');
  },
  bootstrap: async () => {
    // TODO(4): 앱 로드 시 인증 상태 하이드레이트.
    // - 이유: 수동 로그인 없이 새로고침 후 세션을 유지하기 위함.
    // - 단계: 토큰 읽기, fetchMe 호출, 상태 업데이트.
    // - 완료 조건: 로딩 스피너가 끝나고 사용자 상태가 설정됨.
    throw new Error('TODO');
  },
  logout: () => {
    // TODO(4): 인증 상태와 캐시된 토큰 초기화.
    // - 이유: 로그아웃 시 민감한 세션 데이터를 제거하기 위함.
    // - 단계: 스토어 초기화, 스토리지 키 삭제, 쿼리 무효화.
    // - 완료 조건: 보호 라우트가 /login으로 리다이렉트됨.
    throw new Error('TODO');
  },
  clearAuth: () => {
    throw new Error('TODO');
  },
}));
