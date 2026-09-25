import { Avatar, Chip, Paper, Stack, Typography } from '@mui/material';
import type { Participant } from '@/features/room/api';
export default function ParticipantsPanel({ participants, currentUserId }: { participants: Participant[]; currentUserId: string }) {
  return <Paper variant="outlined" sx={{ p: 2, borderRadius: 3 }}>
    <Typography variant="h6" mb={1}>방 멤버 · {participants.length}</Typography>
    <Typography variant="caption" color="text.secondary">등록된 멤버입니다. 실제 온라인 접속 여부는 아직 제공하지 않습니다.</Typography>
    <Stack spacing={2} mt={2}>{participants.map(p => <Stack direction="row" spacing={1.5} alignItems="center" key={p.id}>
      <Avatar sx={{ bgcolor: '#dceadf', color: '#315d42', width: 32, height: 32 }}>{p.name[0]}</Avatar>
      <Typography variant="body2" sx={{ flex: 1 }}>{p.name}{p.id === currentUserId ? ' (나)' : ''}</Typography>
      <Chip size="small" label={{HOST:'호스트',PRESENTER:'발표자',MEMBER:'참가자'}[p.role]}/>
    </Stack>)}</Stack>
  </Paper>;
}
