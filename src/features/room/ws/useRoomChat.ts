import { useCallback, useEffect, useRef, useState } from 'react';
import type { Client } from '@stomp/stompjs';
import { useAuthStore } from '@/features/auth/store/authStore';
import { refreshToken } from '@/features/auth/api/api';
import { connect, createClient, disconnect, type ChatConnectionState } from './stomp';
import { useChatHistory } from '../chat/useChatHistory';
import { parseChatMessage } from '../chat/history';
export type { ChatMessage } from '../chat/history';
export function useRoomChat(roomId: string, boardEvents?: {onBoard:(data:unknown)=>void;onCursor:(data:unknown)=>void;onConnected:()=>void}) {
  const events=useRef(boardEvents);events.current=boardEvents;
  const cursorTime=useRef(0);
  const accessToken = useAuthStore(s => s.accessToken);
  const user = useAuthStore(s => s.user);
  const history=useChatHistory(roomId);
  const historyRef=useRef(history);historyRef.current=history;
  const [sending,setSending]=useState(false);
  const pending=useRef<{id:string;resolve:()=>void;reject:(e:Error)=>void;timer:ReturnType<typeof setTimeout>}|null>(null);
  const [state, setState] = useState<ChatConnectionState>('connecting');
  const [error, setError] = useState('');
  const [attempt, setAttempt] = useState(0);
  const clientRef = useRef<Client | null>(null);
  useEffect(() => {
    if (!accessToken) { setState('error'); setError('로그인이 필요합니다.'); return; }
    let active = true;
    setState('connecting'); setError('');
    const client = createClient({ roomId, accessToken,
      onBoard: payload => { if(active) events.current?.onBoard(payload); },
      onCursor: payload => { if(active) events.current?.onCursor(payload); },
      onState: (next, reason) => { if (active) { setState(next); if (reason) setError(reason); if(next==='connected'){setError('');events.current?.onConnected();void historyRef.current.refreshHistory();} } },
      onMessage: payload => {
        const dto=parseChatMessage(payload,roomId);
        if(!dto||!active)return;
        historyRef.current.accept([dto]);
        if(pending.current&&dto.clientMessageId===pending.current.id&&dto.senderId===String(user?.id)){
          const p=pending.current;pending.current=null;clearTimeout(p.timer);setSending(false);p.resolve();
        }
      },
    });
    clientRef.current = client;
    void connect(client).catch(e => { if (active) { setState('error'); setError(e.message); } });
    return () => { active = false; if(pending.current){clearTimeout(pending.current.timer);pending.current.reject(new Error('연결이 종료됐습니다. 기록을 확인한 뒤 다시 전송해 주세요.'));pending.current=null;} setSending(false); if (clientRef.current === client) clientRef.current = null; void disconnect(client); };
  }, [roomId, accessToken, attempt, user?.id]);
  const sendMessage = useCallback(async (content: string) => {
    const text = content.trim();
    if (!text || text.length > 2000) throw new Error('메시지는 1~2000자여야 합니다.');
    if (!clientRef.current?.connected || state !== 'connected') throw new Error('채팅에 연결된 뒤 전송하세요.');
    if(pending.current)throw new Error('앞선 메시지의 저장을 확인하고 있어요.');
    const clientMessageId=crypto.randomUUID();setSending(true);
    return new Promise<void>((resolve,reject)=>{
      const timer=setTimeout(()=>{if(pending.current?.id!==clientMessageId)return;pending.current=null;setSending(false);reject(new Error('저장 확인 응답을 받지 못했습니다. 대화 기록을 확인한 뒤 다시 보내주세요.'));void historyRef.current.refreshHistory();},12000);
      pending.current={id:clientMessageId,resolve,reject,timer};
      try{clientRef.current!.publish({destination:`/pub/chat/room/${roomId}`,body:JSON.stringify({roomId:Number(roomId),message:text,type:'TEXT',clientMessageId})});}
      catch(e){clearTimeout(timer);pending.current=null;setSending(false);reject(e);}
    });
  }, [roomId, user?.username, state]);
  const retry = useCallback(async () => {
    try { setError(''); const previous=useAuthStore.getState().accessToken; await refreshToken(); if (useAuthStore.getState().accessToken === previous) setAttempt(n => n + 1); }
    catch { setState('error'); setError('로그인이 만료됐습니다. 다시 로그인해 주세요.'); }
  }, []);
  const sendCursor=useCallback((x:number,y:number)=>{if(!clientRef.current?.connected||Date.now()-cursorTime.current<120)return;cursorTime.current=Date.now();clientRef.current.publish({destination:`/pub/cursor/room/${roomId}`,body:JSON.stringify({x,y})});},[roomId]);
  return { ...history, sendMessage, state, error, retry, sendCursor, sending };
}
