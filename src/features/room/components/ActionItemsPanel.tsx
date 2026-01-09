const sampleItems = [
  { id: '1', title: '회의 요약 초안 작성', status: '진행 중' },
  { id: '2', title: '다음 스프린트 범위 확정', status: '대기' },
  { id: '3', title: '에셋 폴더 공유', status: '완료' },
];

export default function ActionItemsPanel() {
  return (
    <div className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--card)] p-4">
      <h3 className="text-lg font-semibold text-[color:var(--foreground)]">액션 아이템</h3>
      <div className="mt-4 space-y-3">
        {sampleItems.map((item) => (
          <div
            key={item.id}
            className="rounded-xl border border-[color:var(--border)] bg-[color:var(--card)] px-3 py-2"
          >
            <p className="text-sm text-[color:var(--foreground)]">{item.title}</p>
            <p className="text-xs uppercase tracking-[0.3em] text-[color:var(--muted-foreground)]">
              {item.status}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
