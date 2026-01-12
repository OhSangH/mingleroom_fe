import { type UserApi, type User } from '@/features/user/types';
import { apiClient } from '@/shared/api/axios';
import { AxiosError } from 'axios';
import { useAuthStore } from '../store/auth.store';
import { mapUser } from '@/features/user/api/api';
import type { AuthResponse, AuthResponseDto, LoginPayload, SignupPayload } from '../types';
import { z } from 'zod';

function extractAccessToken(dto: AuthResponseDto): string | null {
  return dto.accessToken ?? dto.token ?? dto.data?.accessToken ?? dto.data?.token ?? null;
}

function toErrorMessage(error: unknown): string {
  if (!(error instanceof AxiosError)) return '요청 중 알 수 없는 오류가 발생했습니다.';
  const status = error.response?.status;
  const data = error.response?.data as { message?: string; error?: string } | undefined;

  return data?.message ?? data?.error ?? `요청 실패 (HTTP ${status ?? '?'})`;
}

export async function login(payload: LoginPayload): Promise<AuthResponse> {
  // DONE(3): 로그인 API 호출 구현.
  // - 이유: 사용자를 인증하고 액세스 토큰을 받기 위함.
  // - 단계: /auth/login 호출, 응답 매핑, 오류 처리.
  // - 완료 조건: 유효한 자격 증명으로 사용자 + 토큰이 반환됨.
  try {
    const res = await apiClient.post('/auth/login', payload, { skipAuth: true });
    const accessToken = extractAccessToken(res.data);
    if (!accessToken) throw new Error('로그인 응답에 accessToken이 없습니다.');
    useAuthStore.getState().setAccessToken(accessToken);

    const user = await fetchMe();

    return { user, accessToken };
  } catch (e) {
    throw new Error(toErrorMessage(e));
  }
}

export async function signup(payload: SignupPayload): Promise<void> {
  // DONE(3): 회원가입 API 호출 구현.
  // - 이유: 계정 생성
  // - 단계: /auth/join 호출, 응답 매핑, 검증 오류 처리.
  // - 완료 조건: 회원가입 직후 신규 사용자가 로그인 가능함.
  await apiClient.post<AuthResponseDto>('/auth/join', payload, { skipAuth: true });
}

export async function fetchMe(): Promise<User> {
  // DONE(3): 내 정보 조회 API 호출 구현.
  // - 이유: 새로고침이나 앱 시작 시 인증 상태를 하이드레이트하기 위함.
  // - 단계: /auth/me 호출, 응답 매핑, 401 처리.
  // - 완료 조건: 새로고침 시 사용자 프로필이 깜빡임 없이 로드됨.
  try {
    const res = await apiClient.get<UserApi>('/auth/me');
    const user = mapUser(res.data);

    return user;
  } catch (e) {
    if (e instanceof AxiosError && e.response?.status === 401) {
      useAuthStore.getState().clearAuth();
    }
    throw e;
  }
}

export const passwordSchema = z.string().superRefine((val, ctx) => {
  // 1) 공백 금지
  if (/\s/.test(val)) {
    ctx.addIssue({
      code: 'custom',
      message: '비밀번호에 공백을 포함할 수 없습니다.',
    });
  }

  // 2) 길이
  if (val.length < 8) {
    ctx.addIssue({
      code: 'custom',
      message: '비밀번호는 8자 이상이어야 합니다.',
    });
  }

  // 3) 각 조건 분리(원하는 것만 남기면 됨)
  if (!/[a-z]/.test(val)) {
    ctx.addIssue({
      code: 'custom',
      message: '소문자를 최소 1개 포함해야 합니다.',
    });
  }

  if (!/[A-Z]/.test(val)) {
    ctx.addIssue({
      code: 'custom',
      message: '대문자를 최소 1개 포함해야 합니다.',
    });
  }

  if (!/\d/.test(val)) {
    ctx.addIssue({
      code: 'custom',
      message: '숫자를 최소 1개 포함해야 합니다.',
    });
  }

  if (!/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(val)) {
    ctx.addIssue({
      code: 'custom',
      message: '특수문자를 최소 1개 포함해야 합니다.',
    });
  }
});
