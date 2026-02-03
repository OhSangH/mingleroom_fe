import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import Button from '@mui/material/Button';
import type { Room } from '@/features/room/types';

type RoomCardProps = {
  room: Room;
  onJoin: (roomId: string) => void;
};

export default function RoomCard({ room, onJoin }: RoomCardProps) {
  return (
    <Card className='bg-[color:var(--card)] text-[color:var(--foreground)]'>
      <CardHeader title={room.title} subheader={room.description ?? '설명이 없습니다'} />
      <CardContent className='flex flex-col gap-4'>
        <div className='rounded-xl border border-[color:var(--border)] bg-[color:var(--input)] px-3 py-2 text-xs uppercase tracking-widest text-[color:var(--muted-foreground)]'>
          초대 코드: {room.inviteCode ?? '준비 중'}
        </div>
        <Button variant='contained' onClick={() => onJoin(room.id)}>
          회의실 입장
        </Button>
      </CardContent>
    </Card>
  );
}
