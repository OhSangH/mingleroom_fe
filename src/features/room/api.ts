import type { Room } from '@/features/room/types';

export type Participant = {
  id: string;
  name: string;
  role: 'HOST' | 'MEMBER';
};

export async function fetchRoomDetail(_roomId: string): Promise<Room> {
  // TODO(7): 룸 상세용 react-query queryFn 구현.
  // - 이유: 룸 헤더에 최신 제목과 메타데이터가 필요함.
  // - 단계: API 호출, 응답 매핑, 미존재 오류 처리.
  // - 완료 조건: 서버 데이터로 룸 상세가 렌더링됨.
  throw new Error('TODO');
}

export async function fetchParticipants(_roomId: string): Promise<Participant[]> {
  // TODO(7): 참가자용 react-query queryFn 구현.
  // - 이유: 사이드바에 멤버 목록과 역할 정보가 필요함.
  // - 단계: API 호출, 응답 매핑, 빈 룸 처리.
  // - 완료 조건: 참가자 목록이 실시간으로 업데이트됨.
  throw new Error('TODO');
}
