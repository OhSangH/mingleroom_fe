import { useState } from 'react';
import { Alert, Button, Container, Paper, Stack, Typography } from '@mui/material';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/features/auth/store/authStore';
import { readInviteToken } from '@/features/room/invites/entry';
import { joinRoom, redeemRoomInvite } from '@/features/room/api';
import { apiErrorMessage } from '@/shared/api/error';
export default function LobbyPage() {
  const location=useLocation();
  const {roomId=''}=useParams(),navigate=useNavigate(),user=useAuthStore(s=>s.user);
  const [busy,setBusy]=useState(false),[error,setError]=useState('');
  const join=async()=>{setBusy(true);setError('');try{const token=readInviteToken(location.search);if(token!==undefined)await redeemRoomInvite(roomId,token);else await joinRoom(roomId);navigate(`/room/${roomId}`,{replace:true});}catch(e){setError(apiErrorMessage(e));}finally{setBusy(false);}};
  return <Container maxWidth="sm" sx={{py:8}}><Paper variant="outlined" sx={{p:4,borderRadius:3}}><Stack spacing={3}>
    <Typography variant="h5">회의실 {roomId} 입장</Typography><Typography>{user?.username} 계정으로 참여합니다.</Typography>
    {new URLSearchParams(location.search).has("invite")&&<Alert severity="info">제한 초대 링크로 참여합니다. 입장 버튼을 누르면 초대를 확인해요.</Alert>}
    <Alert severity="info">입장하면 채팅과 화이트보드를 함께 사용할 수 있어요. 음성은 입장 후 직접 참여할 수 있어요.</Alert>
    {error&&<Alert severity="error">{error}</Alert>}<Button variant="contained" disabled={busy} onClick={()=>void join()}>{busy?'입장 중…':'회의실 입장'}</Button><Button onClick={()=>navigate('/dashboard')}>내 회의실로</Button>
  </Stack></Paper></Container>;
}
