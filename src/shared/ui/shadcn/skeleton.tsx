import * as React from 'react';

import { cn } from '@/shared/ui/cn';

function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('animate-pulse rounded-md bg-[color:var(--muted)]', className)} {...props} />;
}

export { Skeleton };
