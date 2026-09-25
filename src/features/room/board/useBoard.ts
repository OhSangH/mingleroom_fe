import { useCallback, useEffect, useRef, useState } from 'react';
import { apiClient } from '@/shared/api/axios';
import { apiErrorMessage } from '@/shared/api/error';
export type Sticky = {id:string;text:string;color:'yellow'|'purple'|'green'|'pink';x:number;y:number;authorId:number;author:string;revision:number};
export type BoardState = {schema:string;version:number;notes:Sticky[]};
export type StickyEdit = Pick<Sticky,'text'|'color'|'x'|'y'|'revision'>;
export type PeerCursor = {userId:number;name:string;x:number;y:number;last:number};
export function useBoard(roomId:string) {
 const [board,setBoard]=useState<BoardState>({schema:'mingleroom-sticky-v1',version:-1,notes:[]});
 const [error,setError]=useState(''),[saving,setSaving]=useState(false),[peers,setPeers]=useState<PeerCursor[]>([]);
 const alive=useRef(true), busy=useRef(false);
 const accept=useCallback((data:unknown)=>{
  const state=data as BoardState;
  if(state?.schema!=='mingleroom-sticky-v1'||!Number.isInteger(state.version)||!Array.isArray(state.notes))return;
  setBoard(old=>state.version>=old.version?state:old);
 },[]);
 const cursor=useCallback((data:unknown)=>{const p=data as PeerCursor;if(!p||!Number.isFinite(p.userId)||!Number.isFinite(p.x)||!Number.isFinite(p.y)||typeof p.name!=='string')return;
  setPeers(old=>[...old.filter(x=>x.userId!==p.userId&&Date.now()-x.last<8000),{...p,last:Date.now()}]);
 },[]);
 const reload=useCallback(async()=>{try{const {data}=await apiClient.get(`/room/${roomId}/board`);if(alive.current){accept(data);setError('');}}catch(e){if(alive.current)setError(apiErrorMessage(e));}},[roomId,accept]);
 useEffect(()=>{alive.current=true;void reload();const timer=setInterval(()=>{if(document.visibilityState==='visible')void reload();setPeers(p=>p.filter(x=>Date.now()-x.last<8000));},4000);return()=>{alive.current=false;clearInterval(timer);};},[reload]);
 const save=async(id:string,edit:StickyEdit|null,revision?:number)=>{
  if(busy.current)return false;busy.current=true;setSaving(true);setError('');
  try{const url=`/room/${roomId}/board/notes/${id}`;const {data}=edit?await apiClient.put(url,edit):await apiClient.delete(url,{params:{revision}});if(alive.current)accept(data);return true;}
  catch(e){if(alive.current){await reload();setError(apiErrorMessage(e));}return false;}
  finally{busy.current=false;if(alive.current)setSaving(false);}
 };
 return {board,error,saving,peers,accept,cursor,reload,save};
}
