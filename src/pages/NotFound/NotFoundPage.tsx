import Button from '@mui/material/Button';
import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[color:var(--background)] text-[color:var(--foreground)]">
      <div className="text-center">
        <p className="text-xs uppercase tracking-[0.4em] text-[color:var(--muted-foreground)]">404</p>
        <h1 className="mt-4 text-3xl font-semibold">페이지를 찾을 수 없어요</h1>
        <p className="mt-2 text-sm text-[color:var(--muted-foreground)]">요청하신 페이지가 존재하지 않습니다.</p>
        <Button component={Link} to="/" variant="contained" className="mt-6">
          홈으로 이동
        </Button>
      </div>
    </div>
  );
}
