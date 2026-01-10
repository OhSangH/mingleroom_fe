import { useCallback, useRef, useState } from 'react';
import type { Client } from '@stomp/stompjs';

import { connect, createClient, disconnect } from '@/features/room/ws/stomp';

export type ChatMessage = {
  id: string;
  sender: string;
  content: string;
  createdAt: string;
};

export function useRoomChat(roomId: string) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const clientRef = useRef<Client | null>(null);

  const handleMessage = useCallback((payload: unknown) => {
    const next = payload as ChatMessage;
    setMessages((prev) => [...prev, next]);
  }, []);

  const open = useCallback(async () => {
    // TODO(9): STOMP 클라이언트 연결 및 구독 설정.
    // - 이유: 채팅 패널에 서버의 실시간 메시지가 필요함.
    // - 단계: 클라이언트 생성, 연결, 구독, 페이로드 반영.
    // - 완료 조건: 서버 수신 메시지가 목록에 표시됨.
    const client = createClient({ roomId, onMessage: handleMessage });
    await connect(client);
    clientRef.current = client;
  }, [handleMessage, roomId]);

  const close = useCallback(async () => {
    if (!clientRef.current) return;
    await disconnect(clientRef.current);
    clientRef.current = null;
  }, []);

  const sendMessage = useCallback(async (_content: string) => {
    // TODO(9): STOMP 토픽으로 채팅 메시지 발행.
    // - 이유: 발신 메시지가 다른 멤버에게 브로드캐스트되어야 함.
    // - 단계: 페이로드 직렬화 후 /pub 채팅 목적지로 발행.
    // - 완료 조건: 보낸 메시지가 목록에 에코되어 표시됨.
    throw new Error('TODO');
  }, []);

  return {
    messages,
    open,
    close,
    sendMessage,
  };
}
