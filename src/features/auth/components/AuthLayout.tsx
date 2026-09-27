import type { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { authReturnPath } from '@/features/room/invites/entry';
import { Alert, Button } from '@mui/material';

type AuthLayoutProps = {
  title: string;
  subtitle: string;
  children: ReactNode;
};

export default function AuthLayout({ title, subtitle, children }: AuthLayoutProps) {
  const location=useLocation();
  const from=authReturnPath(location.state?.from);
  const signup=location.pathname==='/signup';
  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-slate-50 to-slate-100 text-[color:var(--foreground)]">
      <div className="mx-auto flex min-h-screen max-w-5xl flex-col items-center justify-center px-6 py-12 lg:flex-row lg:gap-16">
        <div className="mb-10 max-w-md text-center lg:mb-0 lg:text-left">
          <p className="text-xs font-semibold uppercase tracking-[0.4em] text-[color:var(--muted-foreground)]">
            MingleRoom
          </p>
          <h1 className="mt-4 text-4xl font-semibold">{title}</h1>
          <p className="mt-3 text-base text-[color:var(--muted-foreground)]">{subtitle}</p>
        </div>
        <div className="w-full max-w-md rounded-3xl border border-[color:var(--border)] bg-[color:var(--card)] p-8 shadow-soft">
          {from&&<Alert severity="info" sx={{mb:2}}>로그인 후 초대받은 회의실로 돌아갑니다.</Alert>}
          {children}
          <Button component={Link} to={signup?'/login':'/signup'} state={from?{from}:undefined} sx={{mt:2}}>{signup?'이미 계정이 있어요 · 로그인':'계정이 없어요 · 회원가입'}</Button>
        </div>
      </div>
    </div>
  );
}
