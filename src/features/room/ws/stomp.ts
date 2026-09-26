import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { env } from '@/shared/lib/env';
import { validateRoomId } from '@/features/room/api';
export type ChatConnectionState = 'connecting' | 'connected' | 'disconnected' | 'error';
export type StompConfig = {
  roomId: string; accessToken: string; userId?: string;
  onSignal?: (payload:unknown)=>void;
  onMessage: (payload: unknown) => void;
  onBoard?: (payload: unknown) => void;
  onCursor?: (payload: unknown) => void;
  onState: (state: ChatConnectionState, error?: string) => void;
};
export function createClient(config: StompConfig): Client {
  validateRoomId(config.roomId);
  const client = new Client({
    webSocketFactory: () => new SockJS(`${env.apiBaseUrl}/ws-stomp`),
    connectHeaders: { Authorization: `Bearer ${config.accessToken}` },
    reconnectDelay: 0, connectionTimeout: 10000,
    heartbeatIncoming: 10000, heartbeatOutgoing: 10000,
    onConnect: () => {
      client.subscribe(`/sub/chat/room/${config.roomId}`, frame => {
        try { config.onMessage(JSON.parse(frame.body)); }
        catch { config.onState('error', '채팅 응답 형식을 확인하세요.'); }
      });
      if (config.onBoard) client.subscribe(`/sub/board/room/${config.roomId}`, f => { try { config.onBoard?.(JSON.parse(f.body)); } catch { /* Next REST refresh recovers. */ } });
      if (config.onCursor) client.subscribe(`/sub/cursor/room/${config.roomId}`, f => { try { config.onCursor?.(JSON.parse(f.body)); } catch { /* Ephemeral cursor. */ } });
      if(config.onSignal){
        client.subscribe(`/sub/signal/room/${config.roomId}`,f=>{try{config.onSignal?.(JSON.parse(f.body));}catch{/* Ignore malformed ephemeral signal. */}});
        if(config.userId)client.subscribe(`/sub/signal/room/${config.roomId}/user/${config.userId}`,f=>{try{config.onSignal?.(JSON.parse(f.body));}catch{/* Ignore malformed ephemeral signal. */}});
      }
      config.onState('connected');
    },
    onStompError: () => config.onState('error', '채팅 인증 또는 방 참여 권한을 확인하세요. 다시 연결하려면 재시도를 눌러 주세요.'),
    onWebSocketError: () => config.onState('error', '채팅 서버에 연결하지 못했습니다.'),
    onWebSocketClose: () => config.onState('disconnected', '채팅 연결이 종료됐습니다.'),
  });
  return client;
}

export async function connect(client: Client): Promise<void> {
  return new Promise((resolve, reject) => {
    const connected = client.onConnect, failed = client.onStompError, closed = client.onWebSocketClose;
    let settled = false;
    const timer = setTimeout(() => { if (!settled) { settled = true; reject(new Error('채팅 연결 시간이 초과됐습니다.')); void client.deactivate(); } }, 12000);
    const fail = (message: string) => { if (!settled) { settled = true; clearTimeout(timer); reject(new Error(message)); } };
    client.onConnect = frame => { connected(frame); if (!settled) { settled = true; clearTimeout(timer); resolve(); } };
    client.onStompError = frame => { failed(frame); fail('채팅 인증 또는 구독 요청이 거부됐습니다.'); void client.deactivate(); };
    client.onWebSocketClose = event => { closed(event); fail('채팅 서버 연결이 종료됐습니다.'); };
    client.activate();
  });
}
export async function disconnect(client: Client) { await client.deactivate(); }
