import { useMemo, useState } from 'react';
import Button from '@mui/material/Button';
import { Plus } from 'lucide-react';

import type { Room } from '@/entities/room/types';
import { useAuthStore } from '@/features/auth/store/auth.store';
import CreateRoomDialog from '@/features/dashboard/components/CreateRoomDialog';
import RoomCard from '@/features/dashboard/components/RoomCard';
import WorkspaceSelect from '@/features/dashboard/components/WorkspaceSelect';
import type { Workspace } from '@/features/dashboard/api';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/shared/ui/shadcn/dropdown-menu';

const sampleRooms: Room[] = [
  { id: '1', title: '디자인 싱크', description: '주간 정렬', inviteCode: 'MX-742' },
  { id: '2', title: '스터디 룸', description: '알고리즘 연습', inviteCode: 'VR-229' },
  { id: '3', title: '데모 리뷰', description: '출시 준비', inviteCode: 'GD-518' },
];

const sampleWorkspaces: Workspace[] = [
  { id: 'alpha', name: '알파 팀' },
  { id: 'beta', name: '베타 팀' },
];

export default function DashboardPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [workspaceId, setWorkspaceId] = useState<string | undefined>('alpha');
  const logout = useAuthStore((state) => state.logout);

  const rooms = useMemo(() => sampleRooms, []);

  return (
    <div className='min-h-screen bg-gradient-to-br from-white via-slate-50 to-slate-100 text-[color:var(--foreground)]'>
      <div className='mx-auto max-w-6xl px-6 py-10'>
        <div className='flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between'>
          <div>
            <p className='text-xs uppercase tracking-[0.4em] text-[color:var(--muted-foreground)]'>대시보드</p>
            <h1 className='text-3xl font-semibold'>내 회의실</h1>
          </div>
          <div className='flex items-center gap-3'>
            <WorkspaceSelect workspaces={sampleWorkspaces} value={workspaceId} onChange={setWorkspaceId} />
            <Button variant='contained' startIcon={<Plus size={16} />} onClick={() => setIsDialogOpen(true)}>
              새 회의실
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger className='rounded-full border border-[color:var(--border)] px-4 py-2 text-sm'>
                계정
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuLabel>프로필</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>설정</DropdownMenuItem>
                <DropdownMenuItem onSelect={logout}>로그아웃</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <div className='mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-3'>
          {rooms.map((room) => (
            <RoomCard key={room.id} room={room} onJoin={() => {}} />
          ))}
        </div>
      </div>

      <CreateRoomDialog open={isDialogOpen} onClose={() => setIsDialogOpen(false)} />
    </div>
  );
}
