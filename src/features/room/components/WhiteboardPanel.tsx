export default function WhiteboardPanel() {
  // TODO(11): Implement whiteboard drawing and sync logic.
  // - Why: collaborative sketches require real-time canvas updates.
  // - Steps: setup canvas engine, handle draw events, broadcast deltas.
  // - Done when: strokes appear locally and sync to other clients.
  return (
    <div className="flex h-72 items-center justify-center rounded-2xl border border-dashed border-[color:var(--border)] bg-[color:var(--card)] text-[color:var(--muted-foreground)]">
      화이트보드 자리표시자
    </div>
  );
}
