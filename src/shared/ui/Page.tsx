import type { ReactNode } from 'react';

type PageProps = {
  title?: string;
  description?: string;
  actions?: ReactNode;
  children: ReactNode;
};

export default function Page({ title, description, actions, children }: PageProps) {
  return (
    <div className="min-h-screen bg-[color:var(--background)] text-[color:var(--foreground)]">
      <div className="mx-auto max-w-6xl px-6 py-10">
        {(title || actions) && (
          <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              {title && <h1 className="text-3xl font-semibold">{title}</h1>}
              {description && <p className="text-[color:var(--muted-foreground)]">{description}</p>}
            </div>
            {actions && <div className="flex items-center gap-3">{actions}</div>}
          </div>
        )}
        {children}
      </div>
    </div>
  );
}
