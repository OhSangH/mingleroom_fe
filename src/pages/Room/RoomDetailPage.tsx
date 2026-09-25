import { useEffect, useState } from 'react';
import { Alert, Box, Button, Chip, Container, Stack, Typography } from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuthStore } from '@/features/auth/store/authStore';
import { fetchRoomDetail, fetchParticipants, type Participant } from '@/features/room/api';
import type { Room } from '@/features/room/types';
import ChatPanel from '@/features/room/components/ChatPanel';
import ParticipantsPanel from '@/features/room/components/ParticipantsPanel';
import { apiErrorMessage } from '@/shared/api/error';
export default function RoomDetailPage() {
  const {roomId=''}=useParams(),navigate=useNavigate(),user=useAuthStore(s=>s.user);
  const [room,setRoom]=useState<Room|null>(null),[participants,setParticipants]=useState<Participant[]>([]),[error,setError]=useState('');
  useEffect(()=>{let active=true;setRoom(null);setParticipants([]);setError('');
    const load=()=>Promise.all([fetchRoomDetail(roomId),fetchParticipants(roomId)]).then(([r,p])=>{if(active){setRoom(r);setParticipants(p);setError('');}}).catch(e=>{if(active){setError(apiErrorMessage(e));setRoom(null);}});
    void load();const timer=setInterval(()=>{if(document.visibilityState==='visible')void load();},10000);
    return()=>{active=false;clearInterval(timer);};
  },[roomId,user?.id]);
  const me=participants.find(p=>p.id===String(user?.id));
  return <Box sx={{minHeight:'100dvh',bgcolor:'#f6f8f5',py:3}}><Container maxWidth="lg">
    <Stack direction="row" justifyContent="space-between" alignItems="center" gap={2} mb={3}><Box><Typography color="primary" variant="overline">MingleRoom · ROOM {roomId}</Typography><Typography variant="h5" fontWeight={700}>{room?.title||'회의실'}</Typography></Box><Button variant="outlined" onClick={()=>navigate('/dashboard')}>회의실 나가기</Button></Stack>
    {error&&<Alert severity="error" sx={{mb:2}} action={<Button color="inherit" onClick={()=>navigate(`/lobby/${roomId}`)}>입장 확인</Button>}>{error}</Alert>}
    {!room&&!error&&<Typography>참여 권한을 확인하는 중…</Typography>}
    {room&&me&&<><Stack direction="row" spacing={1} mb={2}><Chip label={me.role}/><Chip variant="outlined" label={room.visibility}/></Stack>
      <Box sx={{display:'grid',gridTemplateColumns:{xs:'1fr',md:'minmax(0,1fr) 300px'},gap:2}}><ChatPanel key={roomId} roomId={roomId}/><ParticipantsPanel participants={participants} currentUserId={String(user?.id)}/></Box>
      <Alert severity="info" sx={{mt:2}}>현재 서버 연동 범위는 로그인·방 입장·멤버 조회·실시간 채팅입니다. 화이트보드와 음성은 기존 비공개 프로토타입에서 데모로 시험할 수 있습니다.</Alert>
      <Typography variant="caption" color="text.secondary" display="block" mt={1}>나가기는 채팅 연결만 종료하며 방 멤버 등록은 유지합니다.</Typography>
    </>}
    {room&&!me&&<Alert severity="warning">현재 계정이 참가자 목록에 없습니다.</Alert>}
  </Container></Box>;
}
