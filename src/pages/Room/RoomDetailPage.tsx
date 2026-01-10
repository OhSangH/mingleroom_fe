import { useMemo, useState } from 'react';
import { MessageCircle, StickyNote, Zap } from 'lucide-react';
import { useParams } from 'react-router-dom';

import ActionItemsPanel from '@/features/room/components/ActionItemsPanel';
import ChatPanel from '@/features/room/components/ChatPanel';
import NotePanel from '@/features/room/components/NotePanel';
import ParticipantsPanel from '@/features/room/components/ParticipantsPanel';
import RoomHeader from '@/features/room/components/RoomHeader';
import RoomTabs from '@/features/room/components/RoomTabs';
import WhiteboardPanel from '@/features/room/components/WhiteboardPanel';
import { ScrollArea } from '@/shared/ui/shadcn/scroll-area';

export default function RoomDetailPage() {
  const { roomId = '' } = useParams();
  const [tab, setTab] = useState('chat');

  const tabs = useMemo(
    () => [
      { value: 'chat', label: '채팅', icon: <MessageCircle size={14} /> },
      { value: 'whiteboard', label: '화이트보드', icon: <Zap size={14} /> },
      { value: 'notes', label: '노트', icon: <StickyNote size={14} /> },
    ],
    []
  );

  return (
    <div className="min-h-screen bg-[color:var(--background)] text-[color:var(--foreground)]">
      <RoomHeader title={`회의실 ${roomId}`} subtitle="라이브 세션 진행 중" onLeave={() => {}} />
      <div className="mx-auto grid max-w-6xl grid-cols-12 gap-6 px-6 py-8">
        <div className="col-span-12 space-y-6 lg:col-span-9">
          <RoomTabs value={tab} onChange={setTab} tabs={tabs} />
          {tab === 'chat' && <ChatPanel roomId={roomId} />}
          {tab === 'whiteboard' && <WhiteboardPanel />}
          {tab === 'notes' && <NotePanel />}
        </div>
        <div className="col-span-12 space-y-6 lg:col-span-3">
          <ScrollArea className="max-h-[360px] rounded-2xl border border-[color:var(--border)] bg-[color:var(--card)] p-4">
            <ParticipantsPanel />
          </ScrollArea>
          <ActionItemsPanel />
        </div>
      </div>
    </div>
  );
}
