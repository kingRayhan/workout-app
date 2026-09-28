import { Target } from "lucide-react";
import Link from "next/link";
import { IconImage } from "@/components/icon-tile";
import { round1 } from "@/lib/units";
import { cn } from "@/lib/utils";

/**
 * Target weight with remaining amount and progress from `startKg`
 * (usually the first logged weight).
 */
export function TargetProgress({
  targetKg,
  currentKg,
  startKg,
  className,
}: {
  targetKg: number | null;
  currentKg: number | null;
  startKg: number | null;
  className?: string;
}) {
  if (targetKg === null) {
    return (
      <Link
        href="/you/bmi"
        className={cn(
          "flex items-center gap-2 rounded-xl bg-muted/60 px-3 py-2 text-[12px] text-muted-foreground active:bg-muted",
          className,
        )}
      >
        <IconImage icon={Target} className="size-4" />
        <span>
          <span className="font-semibold text-primary">Set a target weight</span>{" "}
          to track progress
        </span>
      </Link>
    );
  }

  const remaining = currentKg !== null ? round1(currentKg - targetKg) : null;
  const reached = remaining !== null && Math.abs(remaining) < 0.1;
  const losing = startKg !== null ? startKg > targetKg : (remaining ?? 0) > 0;

  let progress: number | null = null;
  if (startKg !== null && currentKg !== null && startKg !== targetKg) {
    const p = (startKg - currentKg) / (startKg - targetKg);
    progress = Math.min(1, Math.max(0, p));
  }
  if (reached) progress = 1;

  return (
    <Link
      href="/you/bmi"
      className={cn(
        "block rounded-xl bg-muted/60 px-3 py-2.5 active:bg-muted",
        className,
      )}
    >
      <div className="flex items-center justify-between gap-2 text-[12px]">
        <span className="flex items-center gap-1.5 text-muted-foreground">
          <IconImage icon={Target} className="size-4" />
          Target{" "}
          <span className="font-semibold text-foreground tabular-nums">
            {targetKg} kg
          </span>
        </span>
        {remaining === null ? null : reached ? (
          <span className="font-semibold text-primary">Reached 🎉</span>
        ) : (
          <span className="tabular-nums text-muted-foreground">
            <span className="font-semibold text-foreground">
              {Math.abs(remaining)} kg
            </span>{" "}
            to {remaining > 0 ? "lose" : "gain"}
          </span>
        )}
      </div>
      {progress !== null ? (
        <>
          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-background/60">
            <div
              className="h-full rounded-full bg-primary transition-[width] duration-500"
              style={{ width: `${progress * 100}%` }}
            />
          </div>
          <div className="mt-1 flex justify-between text-[10px] text-muted-foreground tabular-nums">
            <span>Start {startKg} kg</span>
            <span>
              {Math.round(progress * 100)}% {losing ? "lost" : "gained"}
            </span>
          </div>
        </>
      ) : null}
    </Link>
  );
}
