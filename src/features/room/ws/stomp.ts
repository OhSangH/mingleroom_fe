import type { Client } from '@stomp/stompjs';

export type StompConfig = {
  roomId: string;
  onMessage: (payload: unknown) => void;
};

export function createClient(_config: StompConfig): Client {
  // TODO(8): STOMP 클라이언트 인스턴스 생성 및 설정.
  // - 이유: 채팅에는 룸별 실시간 소켓 연결이 필요함.
  // - 단계: 브로커 URL, 재연결 전략, 핸들러 설정.
  // - 완료 조건: 클라이언트 연결 후 onConnect 콜백 로그가 찍힘.
  throw new Error('TODO');
}

export async function connect(_client: Client) {
  // TODO(8): 룸 토픽에 연결 및 구독.
  // - 이유: 채팅과 이벤트가 서버에서 스트리밍되어야 함.
  // - 단계: 클라이언트 활성화, 토픽 구독, 메시지 파싱.
  // - 완료 조건: 수신 페이로드로 메시지 목록이 업데이트됨.
  throw new Error('TODO');
}

export async function disconnect(_client: Client) {
  // TODO(8): STOMP 서버에서 정상적으로 연결 해제.
  // - 이유: 잔여 구독과 메모리 누수를 방지하기 위함.
  // - 단계: 구독 해제, 클라이언트 비활성화, 로컬 상태 초기화.
  // - 완료 조건: 클라이언트가 비활성화 상태를 보고함.
  throw new Error('TODO');
}
