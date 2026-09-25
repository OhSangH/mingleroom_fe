import { useCallback, useEffect, useRef, useState } from 'react';
import type { Client } from '@stomp/stompjs';
import { useAuthStore } from '@/features/auth/store/authStore';
import { refreshToken } from '@/features/auth/api/api';
import { connect, createClient, disconnect, type ChatConnectionState } from './stomp';
export type ChatMessage = { id: string; sender: string; content: string; createdAt: string };
type ServerMessage = { roomId: number; sender: string; message: string; type: string; eventType?: string | null };
export function useRoomChat(roomId: string) {
  const accessToken = useAuthStore(s => s.accessToken);
  const user = useAuthStore(s => s.user);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [state, setState] = useState<ChatConnectionState>('connecting');
  const [error, setError] = useState('');
  const [attempt, setAttempt] = useState(0);
  const clientRef = useRef<Client | null>(null);
  useEffect(() => { setMessages([]); }, [roomId]);
  useEffect(() => {
    if (!accessToken) { setState('error'); setError('로그인이 필요합니다.'); return; }
    let active = true;
    setState('connecting'); setError('');
    const client = createClient({ roomId, accessToken,
      onState: (next, reason) => { if (active) { setState(next); if (reason) setError(reason); } },
      onMessage: payload => {
        const dto = payload as Partial<ServerMessage> | null;
        if (!dto || String(dto.roomId) !== roomId || typeof dto.sender !== 'string' || typeof dto.message !== 'string') return;
        if (active) setMessages(prev => [...prev.slice(-199), {
          id: crypto.randomUUID(), sender: dto.sender!, content: dto.message!, createdAt: new Date().toISOString(),
        }]);
      },
    });
    clientRef.current = client;
    void connect(client).catch(e => { if (active) { setState('error'); setError(e.message); } });
    return () => { active = false; if (clientRef.current === client) clientRef.current = null; void disconnect(client); };
  }, [roomId, accessToken, attempt]);
  const sendMessage = useCallback(async (content: string) => {
    const text = content.trim();
    if (!text || text.length > 2000) throw new Error('메시지는 1~2000자여야 합니다.');
    if (!clientRef.current?.connected || state !== 'connected') throw new Error('채팅에 연결된 뒤 전송하세요.');
    clientRef.current.publish({ destination: `/pub/chat/room/${roomId}`, body: JSON.stringify({
      roomId: Number(roomId), sender: user?.username ?? '', message: text, type: 'TEXT', eventType: null,
    }) });
  }, [roomId, user?.username, state]);
  const retry = useCallback(async () => {
    try { setError(''); const previous=useAuthStore.getState().accessToken; await refreshToken(); if (useAuthStore.getState().accessToken === previous) setAttempt(n => n + 1); }
    catch { setState('error'); setError('로그인이 만료됐습니다. 다시 로그인해 주세요.'); }
  }, []);
  return { messages, sendMessage, state, error, retry };
}
