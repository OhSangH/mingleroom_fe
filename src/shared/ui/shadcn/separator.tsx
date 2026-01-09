import * as React from 'react';

import { cn } from '@/shared/ui/cn';

const Separator = React.forwardRef<HTMLHRElement, React.HTMLAttributes<HTMLHRElement>>(
  ({ className, ...props }, ref) => (
    <hr ref={ref} className={cn('h-px w-full border-0 bg-[color:var(--border)]', className)} {...props} />
  )
);
Separator.displayName = 'Separator';

export { Separator };
