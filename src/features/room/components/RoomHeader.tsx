import Button from '@mui/material/Button';

type RoomHeaderProps = {
  title: string;
  subtitle?: string;
  onLeave: () => void;
};

export default function RoomHeader({ title, subtitle, onLeave }: RoomHeaderProps) {
  return (
    <div className="sticky top-0 z-20 border-b border-[color:var(--border)] bg-[color:var(--card)] backdrop-blur">
      <div className="mx-auto flex max-w-6xl flex-col gap-3 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.4em] text-[color:var(--muted-foreground)]">회의실</p>
          <h1 className="text-2xl font-semibold text-[color:var(--foreground)]">{title}</h1>
          {subtitle && <p className="text-sm text-[color:var(--muted-foreground)]">{subtitle}</p>}
        </div>
        <Button variant="outlined" color="error" onClick={onLeave}>
          나가기
        </Button>
      </div>
    </div>
  );
}
