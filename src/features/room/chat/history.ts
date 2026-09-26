import { apiClient } from '@/shared/api/axios';
export type ChatMessage={id:string;sender:string;senderId:string;content:string;createdAt:string;clientMessageId?:string|null};
export type HistoryPage={items:ChatMessage[];nextCursor:string|null;hasMore:boolean};
export function parseChatMessage(payload:unknown,roomId:string):ChatMessage|null {
 if(!payload||typeof payload!=='object')return null;
 const d=payload as Record<string,unknown>;
 if(typeof d.id!=='string'||!/^[1-9]\d{0,18}$/.test(d.id)||String(d.roomId)!==roomId||typeof d.sender!=='string'||typeof d.senderId!=='string'||typeof d.createdAt!=='string'||!Number.isFinite(Date.parse(d.createdAt)))return null;
 return {id:d.id,sender:d.sender,senderId:d.senderId,content:typeof d.message==='string'?d.message:'[첨부 메시지]',createdAt:d.createdAt,clientMessageId:typeof d.clientMessageId==='string'?d.clientMessageId:null};
}
// Use decimal strings so PostgreSQL BIGINT IDs keep their precision in JavaScript.
export function mergeMessages(current:ChatMessage[],incoming:ChatMessage[]):ChatMessage[]{
 const items=new Map(current.map(m=>[m.id,m]));for(const m of incoming)items.set(m.id,{...items.get(m.id),...m});
 return [...items.values()].sort((a,b)=>a.id.length-b.id.length||a.id.localeCompare(b.id));
}
export async function fetchHistory(roomId:string,params:{before?:string;after?:string}={},signal?:AbortSignal):Promise<HistoryPage>{
 const {data}=await apiClient.get(`/room/${roomId}/messages`,{params:{...params,limit:50},signal});
 if(!data||!Array.isArray(data.items)||typeof data.hasMore!=='boolean')throw new Error('채팅 기록 응답을 확인할 수 없습니다. 서버를 업데이트해 주세요.');
 const items=data.items.map((d:unknown)=>parseChatMessage(d,roomId));
 if(items.some((x:ChatMessage|null)=>x===null)||(data.hasMore&&(typeof data.nextCursor!=='string'||!/^[1-9]\d{0,18}$/.test(data.nextCursor))))throw new Error('채팅 기록 형식이 올바르지 않습니다.');
 return {items,nextCursor:data.nextCursor??null,hasMore:data.hasMore};
}
