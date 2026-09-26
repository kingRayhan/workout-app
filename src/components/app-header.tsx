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
          <p className="text-[11px] font-semibold tracking-wide text-primary">
            Workoutland
          </p>
          <h1 className="mt-0.5 text-[22px] font-semibold leading-tight tracking-tight text-foreground">
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
