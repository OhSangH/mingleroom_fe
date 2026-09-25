import { isAxiosError } from 'axios';
export function apiErrorMessage(error: unknown): string {
  if (isAxiosError(error)) {
    const message = error.response?.data?.message;
    if (typeof message === 'string') return message;
    if (!error.response) return '서버에 연결할 수 없습니다. 백엔드 실행 상태와 주소를 확인하세요.';
    return `요청에 실패했습니다 (HTTP ${error.response.status}).`;
  }
  return error instanceof Error ? error.message : '요청을 처리하지 못했습니다.';
}
