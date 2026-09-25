import { useState } from 'react';
import { Alert, Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField, Typography } from '@mui/material';
import { createRoom } from '@/features/dashboard/api';
import { apiErrorMessage } from '@/shared/api/error';
import type { Room } from '@/features/room/types';
export default function CreateRoomDialog({ open, onClose, onCreated }: {open:boolean;onClose:()=>void;onCreated:(room:Room)=>void}) {
  const [title,setTitle]=useState(''),[busy,setBusy]=useState(false),[error,setError]=useState('');
  const create=async()=>{setBusy(true);setError('');try{const room=await createRoom({title});setTitle('');onCreated(room);}catch(e){setError(apiErrorMessage(e));}finally{setBusy(false);}};
  return <Dialog open={open} onClose={busy?undefined:onClose} fullWidth maxWidth="xs"><DialogTitle>새 회의실</DialogTitle><DialogContent>
    <Typography variant="body2" color="text.secondary" mb={2}>공개 · 링크 입장 방식으로 생성됩니다. 비공개·팀 초대 정책은 별도 구현이 필요합니다.</Typography>
    <TextField autoFocus label="회의실 이름" fullWidth value={title} onChange={e=>setTitle(e.target.value)} slotProps={{htmlInput:{maxLength:150}}}/>
    {error&&<Alert severity="error" sx={{mt:2}}>{error}</Alert>}
  </DialogContent><DialogActions><Button disabled={busy} onClick={onClose}>취소</Button><Button variant="contained" disabled={busy||!title.trim()} onClick={()=>void create()}>{busy?'생성 중…':'생성하고 입장'}</Button></DialogActions></Dialog>;
}
