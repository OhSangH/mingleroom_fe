import type { Room } from '@/features/room/types';

export type Workspace = {
  id: string;
  name: string;
  description?: string;
};

export const workspaceKeys = {
  all: ['workspaces'] as const,
  list: () => [...workspaceKeys.all, 'list'] as const,
};

export const roomKeys = {
  all: ['rooms'] as const,
  list: (workspaceId?: string) => [...roomKeys.all, 'list', workspaceId] as const,
};

export async function fetchWorkspaces(): Promise<Workspace[]> {
  // TODO(7): 워크스페이스용 react-query queryFn 구현.
  // - 이유: 대시보드에 워크스페이스 필터 렌더링 데이터가 필요함.
  // - 단계: API 호출, 응답 매핑, 재시도로 오류 처리.
  // - 완료 조건: 워크스페이스 목록이 실제 데이터로 렌더링됨.
  throw new Error('TODO');
}

export async function fetchRooms(_workspaceId?: string): Promise<Room[]> {
  // TODO(7): 룸용 react-query queryFn 구현.
  // - 이유: 대시보드 카드가 룸 목록 데이터에 의존함.
  // - 단계: API 호출, 응답 매핑, 필요 시 페이지네이션 추가.
  // - 완료 조건: 룸 카드가 서버 페이로드로 렌더링됨.
  throw new Error('TODO');
}

export async function createRoom(_payload: { title: string; description?: string }): Promise<Room> {
  // TODO(7): 룸 생성용 react-query mutationFn 구현.
  // - 이유: 다이얼로그 제출 시 서버에 룸이 생성되어야 함.
  // - 단계: API 호출, 생성된 룸 반환, 룸 목록 무효화.
  // - 완료 조건: 전체 새로고침 없이 새 룸이 표시됨.
  throw new Error('TODO');
}
