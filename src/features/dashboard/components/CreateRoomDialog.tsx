import { useState } from 'react';
import { Alert, Button, Dialog, DialogActions, DialogContent, DialogTitle, MenuItem, TextField, Typography } from '@mui/material';
import { createRoom } from '@/features/dashboard/api';
import { apiErrorMessage } from '@/shared/api/error';
import type { Room } from '@/features/room/types';
export default function CreateRoomDialog({ open, onClose, onCreated }: {open:boolean;onClose:()=>void;onCreated:(room:Room)=>void}) {
  const [visibility,setVisibility]=useState<'PUBLIC'|'PRIVATE'>('PUBLIC');
  const [title,setTitle]=useState(''),[busy,setBusy]=useState(false),[error,setError]=useState('');
  const create=async()=>{setBusy(true);setError('');try{const room=await createRoom({title,visibility});setTitle('');onCreated(room);}catch(e){setError(apiErrorMessage(e));}finally{setBusy(false);}};
  return <Dialog open={open} onClose={busy?undefined:onClose} fullWidth maxWidth="xs"><DialogTitle>새 회의실</DialogTitle><DialogContent>
    <Typography variant="body2" color="text.secondary" mb={2}>공개 방은 번호로 입장할 수 있고, 비공개 방은 호스트가 발급한 제한 초대 링크가 필요합니다.</Typography>
    <TextField autoFocus label="회의실 이름" fullWidth value={title} onChange={e=>setTitle(e.target.value)} slotProps={{htmlInput:{maxLength:150}}}/>
    <TextField select fullWidth label="공개 범위" value={visibility} onChange={e=>setVisibility(e.target.value as 'PUBLIC'|'PRIVATE')} sx={{mt:2}} disabled={busy}><MenuItem value="PUBLIC">공개 · 번호로 입장</MenuItem><MenuItem value="PRIVATE">비공개 · 제한 초대로 입장</MenuItem></TextField>
    {error&&<Alert severity="error" sx={{mt:2}}>{error}</Alert>}
  </DialogContent><DialogActions><Button disabled={busy} onClick={onClose}>취소</Button><Button variant="contained" disabled={busy||!title.trim()} onClick={()=>void create()}>{busy?'생성 중…':'생성하고 입장'}</Button></DialogActions></Dialog>;
}
