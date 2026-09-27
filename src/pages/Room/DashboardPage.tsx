import { useCallback, useEffect, useState } from 'react';
import { Alert, Box, Button, Card, CardContent, Chip, Container, Stack, TextField, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { Plus, RefreshCw } from 'lucide-react';
import type { Room } from '@/features/room/types';
import { useAuthStore } from '@/features/auth/store/authStore';
import { fetchRooms } from '@/features/dashboard/api';
import { parseRoomEntry, lobbyPath } from '@/features/room/invites/entry';
import { joinRoom } from '@/features/room/api';
import CreateRoomDialog from '@/features/dashboard/components/CreateRoomDialog';
import { apiErrorMessage } from '@/shared/api/error';
export default function DashboardPage() {
  const navigate=useNavigate(),user=useAuthStore(s=>s.user),logout=useAuthStore(s=>s.logout);
  const [rooms,setRooms]=useState<Room[]>([]),[loading,setLoading]=useState(true),[error,setError]=useState('');
  const [open,setOpen]=useState(false),[roomId,setRoomId]=useState(''),[joining,setJoining]=useState(false);
  const [revision,setRevision]=useState(0);
  useEffect(()=>{let active=true;setLoading(true);setError('');void fetchRooms().then(v=>{if(active)setRooms(v);}).catch(e=>{if(active)setError(apiErrorMessage(e));}).finally(()=>{if(active)setLoading(false);});return()=>{active=false;};},[user?.id,revision]);
  const join=useCallback(async()=>{setJoining(true);setError('');try{const entry=parseRoomEntry(roomId);if(entry.token!==undefined){navigate(lobbyPath(entry));}else{await joinRoom(entry.roomId);navigate(`/room/${entry.roomId}`);}}catch(e){setError(apiErrorMessage(e));}finally{setJoining(false);}},[roomId,navigate]);
  return <Box sx={{ minHeight:'100dvh',bgcolor:'#f6f8f5',py:{xs:3,md:6}}}><Container maxWidth="lg">
    <Stack direction={{xs:'column',sm:'row'}} justifyContent="space-between" gap={2} mb={4}>
      <Box><Typography color="primary" fontWeight={700}>MingleRoom</Typography><Typography variant="h4" fontWeight={700}>내 회의실</Typography><Typography color="text.secondary">{user?.username}님, 함께할 이야기를 시작하세요.</Typography></Box>
      <Stack direction="row" spacing={1} alignItems="center"><Button startIcon={<RefreshCw size={16}/>} onClick={()=>setRevision(v=>v+1)}>새로고침</Button><Button variant="contained" startIcon={<Plus size={17}/>} onClick={()=>setOpen(true)}>새 회의실</Button><Button onClick={()=>void logout().catch(e=>setError(apiErrorMessage(e)))}>로그아웃</Button></Stack>
    </Stack>
    <Stack component="form" direction={{xs:'column',sm:'row'}} gap={1} mb={3} onSubmit={e=>{e.preventDefault();void join();}}>
      <TextField label="회의실 번호 또는 초대 링크" value={roomId} onChange={e=>setRoomId(e.target.value)} size="small"/>
      <Button type="submit" variant="outlined" disabled={joining||!roomId.trim()}>{joining?'입장 중…':'입장하기'}</Button>
    </Stack>
    {error&&<Alert severity="error" sx={{mb:2}}>{error}</Alert>}
    {loading?<Typography>회의실을 불러오는 중…</Typography>:!rooms.length&&!error?<Alert severity="info">참여 중인 회의실이 없습니다. 새 회의실을 만들거나 번호로 입장하세요.</Alert>:null}
    <Box sx={{display:'grid',gridTemplateColumns:{xs:'1fr',sm:'repeat(2,1fr)',md:'repeat(3,1fr)'},gap:2}}>{rooms.map(room=><Card key={room.id} variant="outlined" sx={{borderRadius:3}}><CardContent>
      <Stack direction="row" justifyContent="space-between"><Typography variant="caption" color="text.secondary">ROOM {room.id}</Typography><Chip size="small" label={room.visibility}/></Stack>
      <Typography variant="h6" my={2}>{room.title}</Typography><Button variant="outlined" onClick={()=>navigate(`/room/${room.id}`)}>회의실 열기</Button>
    </CardContent></Card>)}</Box>
    <CreateRoomDialog open={open} onClose={()=>setOpen(false)} onCreated={room=>{setOpen(false);navigate(`/room/${room.id}`);}}/>
  </Container></Box>;
}
