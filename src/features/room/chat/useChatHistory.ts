import { useCallback, useEffect, useRef, useState } from 'react';
import { apiErrorMessage } from '@/shared/api/error';
import { fetchHistory, mergeMessages, type ChatMessage } from './history';
export function useChatHistory(roomId:string){
 const [messages,setMessages]=useState<ChatMessage[]>([]),[loading,setLoading]=useState(false),[loadingOlder,setLoadingOlder]=useState(false),[error,setError]=useState(''),[hasMore,setHasMore]=useState(false);
 const ref=useRef<ChatMessage[]>([]),cursor=useRef<string|null>(null),initialized=useRef(false),syncing=useRef(false),olderBusy=useRef(false),generation=useRef(0),controllers=useRef(new Set<AbortController>());
 const accept=useCallback((incoming:ChatMessage[])=>{ref.current=mergeMessages(ref.current,incoming);setMessages(ref.current);},[]);
 const query=useCallback(async(params:{before?:string;after?:string})=>{const c=new AbortController();controllers.current.add(c);try{return await fetchHistory(roomId,params,c.signal);}finally{controllers.current.delete(c);}},[roomId]);
 const refresh=useCallback(async()=>{
  if(syncing.current)return;syncing.current=true;const gen=generation.current;setLoading(true);setError('');
  try{
   const last=ref.current.at(-1)?.id;
   if(initialized.current&&last){let after=last;for(;;){const p=await query({after});if(gen!==generation.current)return;accept(p.items);if(!p.hasMore)break;if(!p.nextCursor||p.nextCursor===after)throw new Error('채팅 기록을 계속 불러오지 못했습니다.');after=p.nextCursor;}}
   // Re-read an overlap window to recover delayed or missed realtime deliveries.
   const p=await query({});if(gen!==generation.current)return;accept(p.items);
   if(!initialized.current){cursor.current=p.nextCursor;setHasMore(p.hasMore);initialized.current=true;}
  }catch(e){if(gen===generation.current)setError(apiErrorMessage(e));}
  finally{if(gen===generation.current){syncing.current=false;setLoading(false);}}
 },[accept,query]);
 const loadOlder=useCallback(async()=>{
  if(!cursor.current||olderBusy.current)return;const before=cursor.current,gen=generation.current;olderBusy.current=true;setLoadingOlder(true);setError('');
  try{const p=await query({before});if(gen!==generation.current)return;if(p.hasMore&&p.nextCursor===before)throw new Error('이전 기록을 계속 불러오지 못했습니다.');accept(p.items);cursor.current=p.nextCursor;setHasMore(p.hasMore);}
  catch(e){if(gen===generation.current)setError(apiErrorMessage(e));}
  finally{if(gen===generation.current){olderBusy.current=false;setLoadingOlder(false);}}
 },[accept,query]);
 useEffect(()=>{generation.current++;ref.current=[];setMessages([]);cursor.current=null;initialized.current=false;syncing.current=false;olderBusy.current=false;setHasMore(false);void refresh();const visible=()=>{if(document.visibilityState==='visible')void refresh();};document.addEventListener('visibilitychange',visible);return()=>{generation.current++;controllers.current.forEach(c=>c.abort());controllers.current.clear();document.removeEventListener('visibilitychange',visible);};},[roomId,refresh]);
 return {messages,accept,historyLoading:loading,historyError:error,hasMore,loadingOlder,loadOlder,refreshHistory:refresh};
}
