import { Fragment } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export function AccountRowSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn("flex items-center gap-3", className)}
      aria-busy="true"
      aria-label="Loading account"
    >
      <Skeleton className="size-10 shrink-0 rounded-full" />
      <div className="min-w-0 flex-1 space-y-2">
        <Skeleton className="h-3.5 w-28" />
        <Skeleton className="h-3 w-40" />
      </div>
      <Skeleton className="h-8 w-16 rounded-lg" />
    </div>
  );
}

export function SignInButtonSkeleton({ className }: { className?: string }) {
  return (
    <Skeleton
      className={cn("h-11 w-full rounded-xl", className)}
      aria-busy="true"
      aria-label="Loading sign in"
    />
  );
}

export function TodolistSkeleton() {
  return (
    <section
      className="overflow-hidden rounded-2xl bg-card ring-1 ring-border/80"
      aria-busy="true"
      aria-label="Loading todolist"
    >
      <div className="space-y-2 px-4 py-3.5">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-5 w-40" />
        <Skeleton className="h-3 w-16" />
      </div>
      <div className="border-t border-border/80">
        {Array.from({ length: 6 }, (_, i) => (
          <div
            key={i}
            className="flex min-h-12 items-center gap-3 border-b border-border/60 px-4 last:border-b-0"
          >
            <Skeleton className="size-5 rounded-md" />
            <Skeleton className="h-4 max-w-[70%] flex-1" />
          </div>
        ))}
      </div>
    </section>
  );
}

export function PlanSkeleton() {
  return (
    <div className="flex flex-col gap-3" aria-busy="true" aria-label="Loading plan">
      <section className="rounded-2xl bg-card px-4 py-3.5 ring-1 ring-border/80">
        <div className="flex items-center justify-between gap-2">
          <Skeleton className="h-3.5 w-20" />
          <Skeleton className="h-8 w-12 rounded-lg" />
        </div>
        <div className="mt-3 space-y-3">
          {Array.from({ length: 3 }, (_, i) => (
            <div key={i} className="flex items-center justify-between gap-3">
              <div className="flex-1 space-y-1.5">
                <Skeleton className="h-4 w-36" />
                <Skeleton className="h-3 w-20" />
              </div>
              <Skeleton className="h-7 w-14 rounded-md" />
            </div>
          ))}
        </div>
      </section>

      <section className="overflow-hidden rounded-2xl bg-card ring-1 ring-border/80">
        <div className="space-y-1.5 px-4 py-3">
          <Skeleton className="h-3.5 w-20" />
          <Skeleton className="h-3 w-40" />
        </div>
        <div className="border-t border-border/80">
          {Array.from({ length: 7 }, (_, i) => (
            <div
              key={i}
              className="flex min-h-12 items-center justify-between border-t border-border/60 px-4 first:border-t-0"
            >
              <Skeleton className="h-4 w-10" />
              <Skeleton className="h-3.5 w-28" />
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

export function ActivityHeatmapSkeleton({
  weeks = 12,
  compact = false,
  fill = false,
}: {
  weeks?: number;
  compact?: boolean;
  fill?: boolean;
}) {
  void compact;
  const cellGap = "gap-[3px]";
  const cols = weeks;
  const monthStarts = new Set(
    Array.from({ length: Math.ceil(cols / 4) }, (_, i) => i * 4).filter(
      (i) => i < cols,
    ),
  );

  return (
    <div aria-busy="true" aria-label="Loading activity" className="w-full">
      <div className={cn("flex w-full", cellGap)}>
        {Array.from({ length: cols }, (_, c) => (
          <Fragment key={c}>
            {monthStarts.has(c) && c > 0 ? (
              <div
                className={cn("shrink-0", fill ? "w-1.5" : "w-1")}
                aria-hidden
              />
            ) : null}
            <div
              className={cn(
                "flex flex-col",
                cellGap,
                fill ? "min-w-0 flex-1" : "w-3 shrink-0",
              )}
            >
              {Array.from({ length: 7 }, (_, r) => (
                <Skeleton
                  key={r}
                  className={cn(
                    "rounded-[3px] bg-foreground/[0.08]",
                    fill ? "aspect-square w-full" : "size-3",
                  )}
                />
              ))}
            </div>
          </Fragment>
        ))}
      </div>
      <div className={cn("mt-1.5 flex w-full", cellGap)}>
        {Array.from({ length: cols }, (_, c) => (
          <Fragment key={c}>
            {monthStarts.has(c) && c > 0 ? (
              <div
                className={cn("shrink-0", fill ? "w-1.5" : "w-1")}
                aria-hidden
              />
            ) : null}
            <div
              className={cn(
                "relative h-3 overflow-visible",
                fill ? "min-w-0 flex-1" : "w-3 shrink-0",
              )}
            >
              {monthStarts.has(c) ? (
                <Skeleton className="absolute left-0 top-0 h-2.5 w-6" />
              ) : null}
            </div>
          </Fragment>
        ))}
      </div>
    </div>
  );
}

export function CatalogSkeleton() {
  return (
    <div className="flex flex-col pb-6" aria-busy="true" aria-label="Loading catalog">
      <div className="px-4 pb-3 pt-[max(0.65rem,env(safe-area-inset-top))]">
        <Skeleton className="h-3 w-20" />
        <Skeleton className="mt-2 h-6 w-28" />
        <Skeleton className="mt-2 h-3 w-36" />
      </div>
      <div className="px-4">
        <Skeleton className="h-10 w-full rounded-xl" />
      </div>
      <div className="mt-3 space-y-2.5 px-4">
        <Skeleton className="h-8 w-full rounded-lg" />
        <div className="flex gap-1.5">
          {Array.from({ length: 5 }, (_, i) => (
            <Skeleton key={i} className="h-7 w-16 shrink-0 rounded-full" />
          ))}
        </div>
        <Skeleton className="h-3 w-24" />
      </div>
      <div className="mt-2 divide-y divide-border/80 border-y border-border/80">
        {Array.from({ length: 8 }, (_, i) => (
          <div key={i} className="flex items-center gap-3 px-4 py-3.5">
            <Skeleton className="h-3 w-5" />
            <div className="min-w-0 flex-1 space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-48" />
            </div>
            <Skeleton className="size-4 rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function CardBlockSkeleton({
  lines = 3,
  className,
}: {
  lines?: number;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-2xl bg-card px-4 py-4 ring-1 ring-border/80",
        className,
      )}
      aria-busy="true"
    >
      <Skeleton className="h-3.5 w-20" />
      <div className="mt-3 space-y-2">
        {Array.from({ length: lines }, (_, i) => (
          <Skeleton
            key={i}
            className={cn("h-3", i === lines - 1 ? "w-[70%]" : "w-full")}
          />
        ))}
      </div>
    </div>
  );
}
