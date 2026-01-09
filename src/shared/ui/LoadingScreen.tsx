type LoadingScreenProps = {
  label?: string;
};

export default function LoadingScreen({ label = '불러오는 중...' }: LoadingScreenProps) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[color:var(--background)] text-[color:var(--foreground)]">
      <div className="flex flex-col items-center gap-4">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-[color:var(--border)] border-t-[color:var(--primary)]" />
        <p className="text-sm uppercase tracking-[0.3em] text-[color:var(--muted-foreground)]">{label}</p>
      </div>
    </div>
  );
}
