import type { ReactNode } from "react";

export function AppHeader({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: ReactNode;
}) {
  return (
    <header className="sticky top-0 z-10 bg-background/90 px-4 pb-3 pt-[max(0.65rem,env(safe-area-inset-top))] backdrop-blur-md">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="inline-flex items-center gap-1.5 rounded-full bg-primary/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.14em] text-primary shadow-[inset_0_1px_0_oklch(1_0_0/0.2),0_2px_0_oklch(0.4_0.1_132)]">
            <span className="size-1.5 rounded-full bg-primary" aria-hidden />
            Workoutland
          </p>
          <h1 className="mt-1.5 text-[26px] font-extrabold leading-none tracking-tight text-foreground">
            {title}
          </h1>
          {subtitle ? (
            <p className="mt-0.5 text-[13px] leading-snug text-muted-foreground">
              {subtitle}
            </p>
          ) : null}
        </div>
        {action}
      </div>
    </header>
  );
}
