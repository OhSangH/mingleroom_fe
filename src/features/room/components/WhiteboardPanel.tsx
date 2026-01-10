export default function WhiteboardPanel() {
  // TODO(11): 화이트보드 그리기 및 동기화 로직 구현.
  // - 이유: 협업 스케치에는 실시간 캔버스 업데이트가 필요함.
  // - 단계: 캔버스 엔진 설정, 그리기 이벤트 처리, 델타 브로드캐스트.
  // - 완료 조건: 획이 로컬에 표시되고 다른 클라이언트와 동기화됨.
  return (
    <div className="flex h-72 items-center justify-center rounded-2xl border border-dashed border-[color:var(--border)] bg-[color:var(--card)] text-[color:var(--muted-foreground)]">
      화이트보드 자리표시자
    </div>
  );
}
