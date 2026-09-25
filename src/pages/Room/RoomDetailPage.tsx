import { useEffect, useRef, useState } from 'react';
import { Alert, Button, Chip, Container, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, Snackbar, Tooltip } from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Check, ChevronRight, Copy, Headphones, LayoutGrid, Link2, LockKeyhole, MessageCircle, Mic, MicOff, PanelRightClose, ShieldCheck, StickyNote, Users, X } from 'lucide-react';
import { useAuthStore } from '@/features/auth/store/authStore';
import { fetchRoomDetail, fetchParticipants, type Participant } from '@/features/room/api';
import type { Room } from '@/features/room/types';
import { apiErrorMessage } from '@/shared/api/error';
import { useRoomChat } from '@/features/room/ws/useRoomChat';
import { useBoard } from '@/features/room/board/useBoard';
import Whiteboard from '@/features/room/board/Whiteboard';
import RoomConversation from '@/features/room/components/RoomConversation';
import './room-workspace.css';
function Brand(){return <span className="mr-brand"><span className="mr-brand-icon"><i/><i/><i/></span>mingle<span>room</span><b>·</b></span>;}
function Meeting({room,participants,me}:{room:Room;participants:Participant[];me:Participant}){
 const user=useAuthStore(s=>s.user)!,navigate=useNavigate();const board=useBoard(room.id);
 const chat=useRoomChat(room.id,{onBoard:board.accept,onCursor:board.cursor,onConnected:()=>void board.reload()});
 const [tab,setTab]=useState<'chat'|'people'>('chat'),[mobile,setMobile]=useState<'board'|'chat'|'people'>('board'),[focus,setFocus]=useState(false);
 const [invite,setInvite]=useState(false),[voice,setVoice]=useState(false),[toast,setToast]=useState(''),[mic,setMic]=useState<'off'|'loading'|'on'>('off'),[micError,setMicError]=useState('');
 const stream=useRef<MediaStream|null>(null),micGeneration=useRef(0);
 const stop=()=>{micGeneration.current++;stream.current?.getTracks().forEach(t=>t.stop());stream.current=null;setMic('off');};
 useEffect(()=>()=>{micGeneration.current++;stream.current?.getTracks().forEach(t=>t.stop());},[]);
 const testMic=async()=>{const generation=++micGeneration.current;setMic('loading');setMicError('');try{if(!navigator.mediaDevices?.getUserMedia)throw new Error('마이크 테스트는 localhost 또는 HTTPS에서 사용할 수 있어요.');const s=await navigator.mediaDevices.getUserMedia({audio:true});if(generation!==micGeneration.current){s.getTracks().forEach(t=>t.stop());return;}stream.current=s;setMic('on');}catch(e){if(generation===micGeneration.current){setMicError((e as Error).message);setMic('off');}}};
 const copy=async()=>{try{await navigator.clipboard.writeText(`${location.origin}/lobby/${room.id}`);setToast('입장 링크를 복사했어요.');}catch{setToast('아래 입장 링크를 직접 복사해 주세요.');}};
 const roleLabel={HOST:'호스트',PRESENTER:'발표자',MEMBER:'참가자'};
 return <div className={`mr-shell ${focus?'mr-focus':''}`}>
  <nav className="mr-rail" aria-label="회의실 메뉴"><button className="mr-rail-logo" aria-label="내 회의실로" onClick={()=>navigate('/dashboard')}>m</button><div><Tooltip title="내 회의실"><IconButton aria-label="내 회의실로 이동" onClick={()=>navigate('/dashboard')}><LayoutGrid/></IconButton></Tooltip><Tooltip title="화이트보드"><IconButton className="selected" aria-label="화이트보드 보기" onClick={()=>setMobile('board')}><StickyNote/></IconButton></Tooltip><Tooltip title="참가자"><IconButton aria-label="참가자 보기" onClick={()=>{setTab('people');setMobile('people');setFocus(false);}}><Users/></IconButton></Tooltip></div><span className="mr-avatar">{user.username.slice(0,1)}</span></nav>
  <main className="mr-workspace"><header className="mr-topbar"><Brand/><span className="mr-breadcrumb">내 회의실 <ChevronRight size={14}/> 아이디어 룸</span><div><Chip size="small" label="협업 공간" variant="outlined"/><Tooltip title="회의실 나가기"><IconButton aria-label="회의실 나가기" onClick={()=>navigate('/dashboard')}><X size={20}/></IconButton></Tooltip></div></header>
   <div className="mr-room-header"><div><div className="mr-eyebrow"><span>MINGLEROOM SESSION</span><span><LockKeyhole size={13}/>{room.visibility==='PUBLIC'?'공개 회의실':'제한된 회의실'}</span><span>ROOM {room.id}</span></div><h1>{room.title}<span>·</span></h1><p>함께 생각하고, 나누고, 더 좋은 아이디어로.</p></div><div className="mr-room-actions"><div className="mr-avatar-stack">{participants.slice(0,3).map(p=><span className="mr-avatar" key={p.id} title={p.name}>{p.name.slice(0,1)}</span>)}</div><span className="mr-member-count">멤버 {participants.length}명</span><Button variant="outlined" startIcon={<Link2 size={16}/>} onClick={()=>setInvite(true)}>초대 링크</Button></div></div>
   <div className="mr-session-bar"><span><span className={`mr-status-dot ${chat.state==='connected'?'connected':''}`}/>{chat.state==='connected'?'함께 만드는 시간':'연결을 확인하고 있어요'}<small>아이디어 보드</small></span><span><ShieldCheck size={15}/><Chip size="small" variant="outlined" label={roleLabel[me.role]}/>{me.role!=='MEMBER'&&<Tooltip title="보드 집중 보기"><IconButton aria-label="보드 집중 보기" aria-pressed={focus} onClick={()=>setFocus(v=>!v)}><PanelRightClose size={18}/></IconButton></Tooltip>}</span></div>
   <div className={`mr-room-layout mr-mobile-${mobile}`}><Whiteboard model={board} role={me.role} userId={Number(user.id)} sendCursor={chat.sendCursor} connected={chat.state==='connected'}/><RoomConversation chat={chat} participants={participants} userId={Number(user.id)} tab={tab} onTab={setTab}/></div>
   <nav className="mr-mobile-tabs" aria-label="회의실 화면 전환">{([['board','보드',StickyNote],['chat','채팅',MessageCircle],['people','참가자',Users]] as const).map(([id,label,Icon])=><button key={id} className={mobile===id?'selected':''} onClick={()=>{setMobile(id);if(id!=='board')setTab(id);}}><Icon size={18}/>{label}</button>)}</nav>
   <footer className="mr-session-footer"><span><Headphones size={18}/><strong>음성 연결 준비 중</strong><small>지금은 채팅과 보드로 함께해요</small></span><div><Button startIcon={mic==='on'?<Mic size={16}/>:<MicOff size={16}/>} onClick={()=>setVoice(true)}>마이크 테스트</Button><Button startIcon={<ArrowLeft size={16}/>} onClick={()=>navigate('/dashboard')}>나가기</Button></div></footer>
  </main>
  <Dialog open={invite} onClose={()=>setInvite(false)} fullWidth maxWidth="xs"><DialogTitle>함께할 사람 초대하기</DialogTitle><DialogContent><p>회의실 번호 <strong>{room.id}</strong></p><p className="mr-invite-url">{`${location.origin}/lobby/${room.id}`}</p><Alert severity="info">{room.visibility==='PUBLIC'?'로그인한 사용자는 방의 입장 정책에 따라 참여할 수 있어요.':'링크만으로 비공개 방의 입장 권한이 생기지는 않아요.'}</Alert></DialogContent><DialogActions><Button onClick={()=>setInvite(false)}>닫기</Button><Button variant="contained" startIcon={<Copy size={16}/>} onClick={()=>void copy()}>링크 복사</Button></DialogActions></Dialog>
  <Dialog open={voice} onClose={()=>{stop();setVoice(false);}} fullWidth maxWidth="xs"><DialogTitle>내 마이크 확인</DialogTitle><DialogContent><Alert severity="info">음성 통화는 아직 연결되지 않았어요. 이 테스트는 내 기기의 마이크 접근만 확인하며 다른 사람에게 전송하지 않아요.</Alert>{micError&&<Alert severity="error" sx={{mt:2}}>{micError}</Alert>}<div className="mr-mic-test">{mic==='on'?<Check size={36}/>:<Mic size={36}/>}<p>{mic==='on'?'마이크 접근을 확인했어요':mic==='loading'?'브라우저의 마이크 권한을 허용해 주세요':'테스트를 눌러 마이크를 확인하세요'}</p></div></DialogContent><DialogActions><Button onClick={()=>{stop();setVoice(false);}}>닫기</Button>{mic==='on'?<Button onClick={stop}>테스트 종료</Button>:<Button variant="contained" disabled={mic==='loading'} onClick={()=>void testMic()}>테스트 시작</Button>}</DialogActions></Dialog>
  <Snackbar open={!!toast} message={toast} autoHideDuration={3500} onClose={()=>setToast('')}/>
 </div>;
}
export default function RoomDetailPage(){
 const {roomId=''}=useParams(),user=useAuthStore(s=>s.user),navigate=useNavigate();
 const [room,setRoom]=useState<Room|null>(null),[participants,setParticipants]=useState<Participant[]>([]),[error,setError]=useState('');
 useEffect(()=>{let active=true;setRoom(null);setParticipants([]);setError('');const load=()=>Promise.all([fetchRoomDetail(roomId),fetchParticipants(roomId)]).then(([r,p])=>{if(active){setRoom(r);setParticipants(p);setError('');}}).catch(e=>{if(active){setError(apiErrorMessage(e));setRoom(null);}});void load();const timer=setInterval(()=>{if(document.visibilityState==='visible')void load();},10000);return()=>{active=false;clearInterval(timer);};},[roomId,user?.id]);
 const me=participants.find(p=>p.id===String(user?.id));
 if(room&&me)return <Meeting key={`${roomId}-${user?.id}`} room={room} participants={participants} me={me}/>;
 return <Container sx={{py:8}}><Brand/><Alert severity={error?'error':'info'} sx={{my:3}}>{error||'회의실 참여 권한을 확인하고 있어요.'}</Alert><Button onClick={()=>navigate(error?`/lobby/${roomId}`:'/dashboard')}>{error?'입장 확인':'내 회의실로'}</Button></Container>;
}
