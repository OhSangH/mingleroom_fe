import * as React from 'react';

import { cn } from '@/shared/ui/cn';

type BadgeVariant = 'default' | 'accent' | 'outline';

const variantStyles: Record<BadgeVariant, string> = {
  default: 'border-[color:var(--border)] bg-[color:var(--card)] text-[color:var(--foreground)]',
  accent: 'border-[color:var(--border)] bg-[color:var(--accent)] text-[color:var(--accent-foreground)]',
  outline: 'border-[color:var(--border)] text-[color:var(--foreground)]',
};

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: BadgeVariant;
}

const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(({ className, variant = 'default', ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      'inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-widest',
      variantStyles[variant],
      className
    )}
    {...props}
  />
));

Badge.displayName = 'Badge';

export { Badge };
