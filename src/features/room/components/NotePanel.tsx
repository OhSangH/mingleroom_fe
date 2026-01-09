import { useState } from 'react';

export default function NotePanel() {
  const [note, setNote] = useState('회의 노트를 여기에 적어보세요...');

  return (
    <div className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--card)] p-4">
      <h3 className="text-lg font-semibold text-[color:var(--foreground)]">공유 노트</h3>
      <textarea
        className="mt-4 h-48 w-full rounded-xl border border-[color:var(--border)] bg-[color:var(--input)] p-3 text-sm text-[color:var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[color:var(--ring)]"
        value={note}
        onChange={(event) => setNote(event.target.value)}
      />
    </div>
  );
}
