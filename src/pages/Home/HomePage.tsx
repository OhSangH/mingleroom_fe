import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import { MessageCircle, Sparkles, Users, Video } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';

import { Badge } from '@/shared/ui/shadcn/badge';
import { Separator } from '@/shared/ui/shadcn/separator';

export default function LoginPage() {
  const [inviteCode, setInviteCode] = useState('');

  return (
    <div className='min-h-screen bg-gradient-to-br from-white via-slate-50 to-slate-100 text-[color:var(--foreground)]'>
      <div className='mx-auto flex max-w-6xl flex-col gap-10 px-6 py-10'>
        <header className='flex items-center justify-between'>
          <div className='flex items-center gap-3'>
            <Badge variant='accent'>스터디 빌드</Badge>
            <span className='text-xs uppercase tracking-[0.4em] text-[color:var(--muted-foreground)]'>MingleRoom</span>
          </div>
          <div className='flex gap-2'>
            <Button component={Link} to='/login' variant='outlined' color='inherit'>
              로그인
            </Button>
            <Button component={Link} to='/signup' variant='contained'>
              회원가입
            </Button>
          </div>
        </header>

        <div className='grid gap-10 lg:grid-cols-[1.2fr_0.8fr]'>
          <section className='space-y-6'>
            <h1 className='text-4xl font-semibold leading-tight sm:text-5xl'>
              모든 회의를 생생하고 빠르게, 함께 만들어가요.
            </h1>
            <p className='max-w-xl text-lg text-[color:var(--muted-foreground)]'>
              영상, 채팅, 노트, 공유 보드를 위한 학습용 워크스페이스. 흐름을 이해하는 데 집중할 수 있도록 가볍게
              구성했어요.
            </p>

            <Separator className='bg-[color:var(--border)]' />

            <div className='grid gap-4 sm:grid-cols-2'>
              <div className='rounded-2xl border border-[color:var(--border)] bg-[color:var(--card)] p-4'>
                <Video className='mb-3 text-[color:var(--primary)]' />
                <h3 className='text-lg font-semibold'>라이브 영상 룸</h3>
                <p className='text-sm text-[color:var(--muted-foreground)]'>
                  아직 연결하지 않고 WebRTC 흐름을 설계해요.
                </p>
              </div>
              <div className='rounded-2xl border border-[color:var(--border)] bg-[color:var(--card)] p-4'>
                <MessageCircle className='mb-3 text-[color:var(--primary)]' />
                <h3 className='text-lg font-semibold'>실시간 채팅</h3>
                <p className='text-sm text-[color:var(--muted-foreground)]'>전송 준비가 되면 STOMP를 연결하세요.</p>
              </div>
              <div className='rounded-2xl border border-[color:var(--border)] bg-[color:var(--card)] p-4'>
                <Sparkles className='mb-3 text-[color:var(--primary)]' />
                <h3 className='text-lg font-semibold'>공유 화이트보드</h3>
                <p className='text-sm text-[color:var(--muted-foreground)]'>협업 드로잉으로 흐름을 정리해요.</p>
              </div>
              <div className='rounded-2xl border border-[color:var(--border)] bg-[color:var(--card)] p-4'>
                <Users className='mb-3 text-[color:var(--primary)]' />
                <h3 className='text-lg font-semibold'>액션 아이템</h3>
                <p className='text-sm text-[color:var(--muted-foreground)]'>결정을 명확한 후속 작업으로 정리해요.</p>
              </div>
            </div>
          </section>

          <aside className='rounded-3xl border border-[color:var(--border)] bg-[color:var(--card)] p-6 shadow-soft'>
            <h2 className='text-xl font-semibold'>초대 코드로 참여</h2>
            <p className='mt-2 text-sm text-[color:var(--muted-foreground)]'>코드를 붙여넣어 로비로 바로 이동해요.</p>
            <div className='mt-6 space-y-4'>
              <TextField
                label='초대 코드'
                value={inviteCode}
                onChange={(event) => setInviteCode(event.target.value)}
                fullWidth
                variant='filled'
                InputProps={{ className: 'bg-[color:var(--input)] text-[color:var(--foreground)]' }}
              />
              <Button fullWidth variant='contained'>
                로비 입장
              </Button>
              <Button fullWidth variant='outlined' color='inherit'>
                접근 요청
              </Button>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
