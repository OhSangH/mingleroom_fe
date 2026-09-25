import { useState } from 'react';
import { Alert, Button, Container, Paper, Stack, Typography } from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuthStore } from '@/features/auth/store/authStore';
import { joinRoom } from '@/features/room/api';
import { apiErrorMessage } from '@/shared/api/error';
export default function LobbyPage() {
  const {roomId=''}=useParams(),navigate=useNavigate(),user=useAuthStore(s=>s.user);
  const [busy,setBusy]=useState(false),[error,setError]=useState('');
  const join=async()=>{setBusy(true);setError('');try{await joinRoom(roomId);navigate(`/room/${roomId}`);}catch(e){setError(apiErrorMessage(e));}finally{setBusy(false);}};
  return <Container maxWidth="sm" sx={{py:8}}><Paper variant="outlined" sx={{p:4,borderRadius:3}}><Stack spacing={3}>
    <Typography variant="h5">회의실 {roomId} 입장</Typography><Typography>{user?.username} 계정으로 참여합니다.</Typography>
    <Alert severity="info">입장하면 채팅과 화이트보드를 함께 사용할 수 있어요. 음성 통화는 준비 중입니다.</Alert>
    {error&&<Alert severity="error">{error}</Alert>}<Button variant="contained" disabled={busy} onClick={()=>void join()}>{busy?'입장 중…':'회의실 입장'}</Button><Button onClick={()=>navigate('/dashboard')}>내 회의실로</Button>
  </Stack></Paper></Container>;
}
