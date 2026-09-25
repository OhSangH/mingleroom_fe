import { useEffect, useRef, useState } from 'react';
import { Alert, Box, Button, Chip, Paper, Stack, TextField, Typography } from '@mui/material';
import { Send } from 'lucide-react';
import { useRoomChat } from '@/features/room/ws/useRoomChat';
export default function ChatPanel({ roomId }: { roomId: string }) {
  const { messages, sendMessage, state, error, retry } = useRoomChat(roomId);
  const [draft, setDraft] = useState(''), [sendError, setSendError] = useState('');
  const bottom = useRef<HTMLDivElement>(null);
  useEffect(() => { bottom.current?.scrollIntoView({ block: 'nearest' }); }, [messages]);
  const handleSend = async () => {
    if (!draft.trim()) return;
    try { await sendMessage(draft); setDraft(''); setSendError(''); }
    catch (e) { setSendError(e instanceof Error ? e.message : '전송하지 못했습니다.'); }
  };
  return <Paper variant="outlined" sx={{ p: 2, borderRadius: 3 }}>
    <Stack direction="row" alignItems="center" justifyContent="space-between" mb={2}>
      <Typography variant="h6">회의실 채팅</Typography>
      <Chip size="small" color={state === 'connected' ? 'success' : 'default'} label={{connecting:'연결 중',connected:'연결됨',disconnected:'연결 끊김',error:'연결 오류'}[state]}/>
    </Stack>
    {error && <Alert severity="warning" action={<Button size="small" onClick={() => void retry()}>재시도</Button>} sx={{ mb: 1 }}>{error}</Alert>}
    <Box aria-label="채팅 내역" role="log" aria-live="polite" sx={{ height: 320, overflowY: 'auto', bgcolor: 'grey.50', borderRadius: 2, p: 1.5 }}>
      {!messages.length && <Typography color="text.secondary" variant="body2">연결 후 수신한 메시지가 표시됩니다. 이전 채팅 기록 조회는 아직 지원하지 않습니다.</Typography>}
      {messages.map(m => <Box key={m.id} sx={{ mb: 2 }}>
        <Stack direction="row" justifyContent="space-between"><Typography fontWeight={600} variant="body2">{m.sender}</Typography><Typography variant="caption" color="text.secondary">{new Date(m.createdAt).toLocaleTimeString()}</Typography></Stack>
        <Typography sx={{ whiteSpace: 'pre-wrap', overflowWrap: 'anywhere', mt: .5 }}>{m.content}</Typography>
      </Box>)}<div ref={bottom}/>
    </Box>
    {sendError && <Alert severity="error" sx={{ mt: 1 }}>{sendError}</Alert>}
    <Stack component="form" direction="row" spacing={1} mt={2} onSubmit={e => { e.preventDefault(); void handleSend(); }}>
      <TextField label="채팅 메시지" value={draft} onChange={e => setDraft(e.target.value)} multiline maxRows={4} fullWidth disabled={state !== 'connected'} slotProps={{htmlInput:{maxLength:2000}}} onKeyDown={e => {
        if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) { e.preventDefault(); void handleSend(); }
      }}/>
      <Button type="submit" variant="contained" aria-label="메시지 전송" disabled={state !== 'connected' || !draft.trim()}><Send size={18}/></Button>
    </Stack>
  </Paper>;
}
