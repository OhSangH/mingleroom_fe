import { useEffect, useState } from 'react';
import { Alert, Button, MenuItem, Stack, TextField, Typography } from '@mui/material';
import { apiClient } from '@/shared/api/axios';
import { apiErrorMessage } from '@/shared/api/error';
import type { RoomDto } from '../api';
export default function RoomSettings({roomId,onSaved}:{roomId:string;onSaved:()=>void}){
 const [source,setSource]=useState<RoomDto|null>(null),[title,setTitle]=useState(''),[visibility,setVisibility]=useState<RoomDto['visibility']>('PUBLIC'),[busy,setBusy]=useState(false),[error,setError]=useState(''),[saved,setSaved]=useState(false);
 const accept=(room:RoomDto)=>{setSource(room);setTitle(room.title);setVisibility(room.visibility);};
 useEffect(()=>{let active=true;setSource(null);void apiClient.get<RoomDto>(`/room/${roomId}`).then(r=>{if(active)accept(r.data);}).catch(e=>{if(active)setError(apiErrorMessage(e));});return()=>{active=false;};},[roomId]);
 const reload=async()=>{if(source&&(title!==source.title||visibility!==source.visibility)&&!window.confirm('작성 중인 설정을 최신 설정으로 교체할까요?'))return;setBusy(true);setError('');setSaved(false);try{accept((await apiClient.get<RoomDto>(`/room/${roomId}`)).data);}catch(e){setError(apiErrorMessage(e));}finally{setBusy(false);}};
 const save=async()=>{if(!source)return;if(source.visibility!=='PUBLIC'&&visibility==='PUBLIC'&&!window.confirm('공개 방으로 변경하면 입장 정책에 따라 다른 사용자가 번호로 참여할 수 있습니다. 변경할까요?'))return;setBusy(true);setError('');setSaved(false);try{const {data}=await apiClient.patch<RoomDto>(`/room/${roomId}`,{title:title.trim(),visibility,expectedTitle:source.title,expectedVisibility:source.visibility});accept(data);setSaved(true);onSaved();}catch(e){setError(apiErrorMessage(e));}finally{setBusy(false);}};
 return <Stack spacing={2}><Typography variant="h6">방 기본 설정</Typography>{error&&<Alert severity="error">{error}</Alert>}{saved&&<Alert severity="success">방 설정을 저장했어요.</Alert>}
 <TextField label="변경할 회의실 이름" value={title} onChange={e=>{setTitle(e.target.value);setSaved(false);}} disabled={!source||busy} slotProps={{htmlInput:{maxLength:150}}}/>
 <TextField select label="변경할 공개 범위" value={visibility} onChange={e=>{setVisibility(e.target.value as RoomDto['visibility']);setSaved(false);}} disabled={!source||busy||source.visibility==='TEAM'}>{source?.visibility==='TEAM'?<MenuItem value="TEAM">팀 회의실</MenuItem>:[<MenuItem key="PUBLIC" value="PUBLIC">공개</MenuItem>,<MenuItem key="PRIVATE" value="PRIVATE">비공개</MenuItem>]}</TextField>
 <Typography variant="body2" color="text.secondary">비공개로 바꾸어도 기존 참가자는 유지됩니다. 신규 참가자는 제한 초대 링크가 필요하며, 입장 잠금은 별도로 적용됩니다.</Typography>
 <Stack direction="row" spacing={1}><Button variant="contained" disabled={busy||!source||!title.trim()||(title.trim()===source.title&&visibility===source.visibility)} onClick={()=>void save()}>방 설정 저장</Button><Button disabled={busy} onClick={()=>void reload()}>최신 설정 불러오기</Button></Stack>
 </Stack>;
}
