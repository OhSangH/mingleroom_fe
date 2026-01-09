import type { ReactNode } from 'react';

type EmptyStateProps = {
  title: string;
  description?: string;
  action?: ReactNode;
};

export default function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-[color:var(--border)] bg-[color:var(--card)] px-6 py-12 text-center">
      <h3 className="text-lg font-semibold text-[color:var(--foreground)]">{title}</h3>
      {description && <p className="mt-2 text-sm text-[color:var(--muted-foreground)]">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
