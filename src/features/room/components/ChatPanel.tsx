import { useMemo, useState } from 'react';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import { Send } from 'lucide-react';
import { Virtuoso } from 'react-virtuoso';

import { FileDropzoneButton } from '@/features/room/components/FileDropzoneButton';
import { useRoomChat } from '@/features/room/ws/useRoomChat';

type ChatPanelProps = {
  roomId: string;
};

export default function ChatPanel({ roomId }: ChatPanelProps) {
  const { messages, sendMessage } = useRoomChat(roomId);
  const [draft, setDraft] = useState('');

  const items = useMemo(
    () =>
      messages.length
        ? messages
        : [
            {
              id: 'seed-1',
              sender: '시스템',
              content: '채팅 준비 완료. STOMP 연결 후 메시지를 수신할 수 있어요.',
              createdAt: new Date().toISOString(),
            },
          ],
    [messages]
  );

  const handleSend = async () => {
    if (!draft.trim()) return;
    await sendMessage(draft.trim());
    setDraft('');
  };

  return (
    <div className="flex h-full flex-col gap-4 rounded-2xl border border-[color:var(--border)] bg-[color:var(--card)] p-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-[color:var(--foreground)]">회의실 채팅</h3>
          <p className="text-xs uppercase tracking-[0.3em] text-[color:var(--muted-foreground)]">실시간</p>
        </div>
        <FileDropzoneButton />
      </div>
      <div className="h-72 overflow-hidden rounded-xl border border-[color:var(--border)] bg-[color:var(--card)]">
        <Virtuoso
          data={items}
          itemContent={(_, item) => (
            <div className="border-b border-[color:var(--border)] px-4 py-3">
              <div className="flex items-center justify-between text-xs text-[color:var(--muted-foreground)]">
                <span>{item.sender}</span>
                <span>{new Date(item.createdAt).toLocaleTimeString()}</span>
              </div>
              <p className="mt-2 text-sm text-[color:var(--foreground)]">{item.content}</p>
            </div>
          )}
        />
      </div>
      <div className="flex gap-2">
        <TextField
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          placeholder="메시지를 입력하세요"
          fullWidth
        />
        <Button variant="contained" onClick={handleSend}>
          <Send size={16} />
        </Button>
      </div>
    </div>
  );
}
