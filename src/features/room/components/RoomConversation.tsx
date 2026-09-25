import { useEffect, useRef, useState } from 'react';
import { Alert, Button, IconButton, TextField } from '@mui/material';
import { Crown, MessageCircle, Send, Users } from 'lucide-react';
import type { Participant } from '../api';
import type { useRoomChat } from '../ws/useRoomChat';
export default function RoomConversation({chat,participants,userId,tab,onTab}:{chat:ReturnType<typeof useRoomChat>;participants:Participant[];userId:number;tab:'chat'|'people';onTab:(t:'chat'|'people')=>void}){
 const [draft,setDraft]=useState(''),[error,setError]=useState('');const end=useRef<HTMLDivElement>(null);
 useEffect(()=>{end.current?.scrollIntoView({block:'nearest'});},[chat.messages,tab]);
 const send=async()=>{try{await chat.sendMessage(draft);setDraft('');setError('');}catch(e){setError((e as Error).message);}};
 return <aside className="mr-conversation"><div className="mr-panel-tabs"><button className={tab==='chat'?'selected':''} onClick={()=>onTab('chat')}><MessageCircle size={17}/>채팅</button><button className={tab==='people'?'selected':''} onClick={()=>onTab('people')}><Users size={17}/>참가자 <span>{participants.length}</span></button></div>
 {tab==='chat'?<><div className="mr-chat-status"><span className={chat.state==='connected'?'online':''}/>{{connected:'실시간 연결됨',connecting:'연결 중',disconnected:'연결 끊김',error:'연결 오류'}[chat.state]}</div>
 {chat.error&&<Alert severity="warning" action={<Button onClick={()=>void chat.retry()}>재시도</Button>}>{chat.error}</Alert>}
 <div className="mr-messages" role="log" aria-label="채팅 내역" aria-live="polite"><div className="mr-chat-date">함께 나누는 이야기</div>{!chat.messages.length&&<div className="mr-chat-empty"><MessageCircle size={28}/><p>첫 인사를 나눠보세요.</p><small>연결 후 받은 메시지가 여기에 표시돼요.</small></div>}
 {chat.messages.map(m=><div className="mr-message" key={m.id}><span className="mr-avatar">{m.sender.slice(0,1)}</span><div><header><strong>{m.sender}</strong><time>{new Date(m.createdAt).toLocaleTimeString('ko-KR',{hour:'2-digit',minute:'2-digit'})}</time></header><p>{m.content}</p></div></div>)}<div ref={end}/></div>
 {error&&<Alert severity="error">{error}</Alert>}<form className="mr-chat-form" onSubmit={e=>{e.preventDefault();void send();}}><TextField label="채팅 메시지" multiline maxRows={4} size="small" fullWidth value={draft} disabled={chat.state!=='connected'} onChange={e=>setDraft(e.target.value)} slotProps={{htmlInput:{maxLength:2000}}} onKeyDown={e=>{if(e.key==='Enter'&&!e.shiftKey&&!e.nativeEvent.isComposing){e.preventDefault();if(draft.trim())void send();}}}/><IconButton type="submit" aria-label="메시지 전송" disabled={!draft.trim()||chat.state!=='connected'}><Send size={19}/></IconButton></form><p className="mr-chat-hint">Enter 전송 · Shift + Enter 줄바꿈</p></>:<div className="mr-people"><p>회의실에 등록된 멤버입니다.</p>{participants.map(p=><div className="mr-person" key={p.id}><span className="mr-avatar">{p.name.slice(0,1)}</span><div><strong>{p.name}{p.id===String(userId)?' (나)':''}</strong><small>{p.role==='HOST'?'호스트':p.role==='PRESENTER'?'발표자':'참가자'}</small></div>{p.role==='HOST'&&<Crown size={16}/>}</div>)}<p className="mr-permission-note">호스트·발표자는 모든 노트를, 참가자는 본인 노트를 편집할 수 있어요.</p></div>}
 </aside>;
}
