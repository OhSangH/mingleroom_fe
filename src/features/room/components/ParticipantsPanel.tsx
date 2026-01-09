type Participant = {
  id: string;
  name: string;
  role: string;
};

const sampleParticipants: Participant[] = [
  { id: '1', name: '김하늘', role: '호스트' },
  { id: '2', name: '박서준', role: '참여자' },
  { id: '3', name: '이수민', role: '참여자' },
];

export default function ParticipantsPanel() {
  return (
    <div className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--card)] p-4">
      <h3 className="text-lg font-semibold text-[color:var(--foreground)]">참여자</h3>
      <div className="mt-4 space-y-3">
        {sampleParticipants.map((participant) => (
          <div
            key={participant.id}
            className="flex items-center justify-between rounded-xl border border-[color:var(--border)] bg-[color:var(--card)] px-3 py-2"
          >
            <div>
              <p className="text-sm text-[color:var(--foreground)]">{participant.name}</p>
              <p className="text-xs uppercase tracking-[0.3em] text-[color:var(--muted-foreground)]">
                {participant.role}
              </p>
            </div>
            <span className="rounded-full bg-[color:var(--accent)] px-2 py-1 text-xs text-[color:var(--accent-foreground)]">
              접속 중
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
