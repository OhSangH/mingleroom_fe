import { useState } from 'react';
import { Alert, Button, Dialog, DialogActions, DialogContent, DialogTitle, Stack, TextField } from '@mui/material';
import { apiClient } from '@/shared/api/axios';
import { apiErrorMessage } from '@/shared/api/error';
import { invitationUrl } from './entry';
import type { Room } from '../types';
import type { RoomRole } from '../api';

export default function InviteDialog({open,onClose,room,role}:{open:boolean;onClose:()=>void;room:Room;role:RoomRole}) {
  const [hours,setHours]=useState(24),[uses,setUses]=useState(1),[link,setLink]=useState(''),[busy,setBusy]=useState(false),[error,setError]=useState(''),[copied,setCopied]=useState(false);
  const create=async()=>{setBusy(true);setError('');setCopied(false);try{const {data}=await apiClient.post(`/room/${room.id}/controls/invites`,{hours,maxUses:uses});setLink(invitationUrl(room.id,data.token));}catch(e){setError(apiErrorMessage(e));}finally{setBusy(false);}};
  const copy=async(value:string)=>{setError('');try{await navigator.clipboard.writeText(value);setCopied(true);}catch{setError('링크를 직접 선택해서 복사해 주세요.');}};
  return <Dialog open={open} onClose={busy?undefined:onClose} fullWidth maxWidth="sm"><DialogTitle>함께할 사람 초대하기</DialogTitle><DialogContent><Stack spacing={2} sx={{pt:1}}>
    {room.visibility!=='PUBLIC'&&<Alert severity="info">비공개·팀 회의실은 제한 초대 링크로 입장해야 합니다. 방 번호나 토큰 없는 주소만으로는 입장할 수 없어요.</Alert>}
    {role==='HOST'?<><Alert severity="info">초대 링크는 지정한 시간·신규 입장 인원만큼 사용할 수 있습니다. 방이 잠겨 있으면 초대받은 사람도 입장할 수 없어요.</Alert><Stack direction="row" spacing={1}><TextField label="초대 유효 시간" type="number" value={hours} inputProps={{min:1,max:168}} onChange={e=>setHours(Number(e.target.value))}/><TextField label="초대 최대 인원" type="number" value={uses} inputProps={{min:1,max:100}} onChange={e=>setUses(Number(e.target.value))}/></Stack><Button variant="contained" disabled={busy||!Number.isInteger(hours)||hours<1||hours>168||!Number.isInteger(uses)||uses<1||uses>100} onClick={()=>void create()}>{busy?'발급 중…':'제한 초대 링크 발급'}</Button>{link&&<><TextField label="제한 초대 링크" multiline value={link} slotProps={{input:{readOnly:true}}}/><Button variant="outlined" onClick={()=>void copy(link)}>제한 초대 링크 복사</Button></>}</>:<Alert severity="info">제한 초대 링크는 호스트가 발급합니다. 호스트에게 초대를 요청해 주세요.</Alert>}
    {room.visibility==='PUBLIC'&&<><p className="mr-invite-url">{`${location.origin}/lobby/${room.id}`}</p><Button onClick={()=>void copy(`${location.origin}/lobby/${room.id}`)}>일반 입장 링크 복사</Button></>}
    {error&&<Alert severity="error">{error}</Alert>}{copied&&<Alert severity="success">초대 링크를 복사했어요.</Alert>}
  </Stack></DialogContent><DialogActions><Button disabled={busy} onClick={onClose}>닫기</Button></DialogActions></Dialog>;
}
