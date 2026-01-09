import * as React from 'react';

import { cn } from '@/shared/ui/cn';

type DropdownContextValue = {
  open: boolean;
  setOpen: (open: boolean) => void;
};

const DropdownContext = React.createContext<DropdownContextValue | null>(null);

function useDropdownContext() {
  const context = React.useContext(DropdownContext);
  if (!context) {
    throw new Error('DropdownMenu components must be used within DropdownMenu');
  }
  return context;
}

function DropdownMenu({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = React.useState(false);

  return (
    <DropdownContext.Provider value={{ open, setOpen }}>
      <div className="relative inline-block text-[color:var(--foreground)]">{children}</div>
    </DropdownContext.Provider>
  );
}

const DropdownMenuTrigger = React.forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement>>(
  ({ className, ...props }, ref) => {
    const { open, setOpen } = useDropdownContext();
    return (
      <button
        ref={ref}
        type="button"
        className={cn(
          'flex items-center gap-2 rounded-md px-3 py-2 text-sm text-[color:var(--foreground)] outline-none focus:ring-2 focus:ring-[color:var(--ring)]',
          className
        )}
        onClick={() => setOpen(!open)}
        {...props}
      />
    );
  }
);
DropdownMenuTrigger.displayName = 'DropdownMenuTrigger';

const DropdownMenuContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => {
    const { open } = useDropdownContext();
    if (!open) return null;
    return (
      <div
        ref={ref}
        className={cn(
          'absolute right-0 z-50 mt-2 min-w-[200px] rounded-xl border border-[color:var(--border)] bg-[color:var(--card)] p-2 text-[color:var(--foreground)] shadow-soft',
          className
        )}
        {...props}
      />
    );
  }
);
DropdownMenuContent.displayName = 'DropdownMenuContent';

const DropdownMenuItem = React.forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement>>(
  ({ className, onClick, ...props }, ref) => {
    const { setOpen } = useDropdownContext();
    return (
      <button
        ref={ref}
        type="button"
        className={cn(
          'flex w-full cursor-pointer select-none items-center rounded-md px-3 py-2 text-left text-sm text-[color:var(--foreground)] outline-none hover:bg-[color:var(--accent)]',
          className
        )}
        onClick={(event) => {
          onClick?.(event);
          setOpen(false);
        }}
        {...props}
      />
    );
  }
);
DropdownMenuItem.displayName = 'DropdownMenuItem';

const DropdownMenuLabel = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('px-3 py-2 text-xs font-semibold uppercase tracking-widest text-[color:var(--muted-foreground)]', className)}
      {...props}
    />
  )
);
DropdownMenuLabel.displayName = 'DropdownMenuLabel';

const DropdownMenuSeparator = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('my-2 h-px bg-[color:var(--border)]', className)} {...props} />
  )
);
DropdownMenuSeparator.displayName = 'DropdownMenuSeparator';

const DropdownMenuGroup = ({ children }: { children: React.ReactNode }) => <div>{children}</div>;
const DropdownMenuPortal = ({ children }: { children: React.ReactNode }) => <>{children}</>;
const DropdownMenuSub = ({ children }: { children: React.ReactNode }) => <div>{children}</div>;
const DropdownMenuSubContent = ({ children }: { children: React.ReactNode }) => <div>{children}</div>;
const DropdownMenuSubTrigger = ({ children }: { children: React.ReactNode }) => <div>{children}</div>;
const DropdownMenuRadioGroup = ({ children }: { children: React.ReactNode }) => <div>{children}</div>;

export {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuGroup,
  DropdownMenuPortal,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuRadioGroup,
};
