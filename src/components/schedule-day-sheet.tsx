"use client";

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { WEEKDAY_LABELS, type WeekdayKey } from "@/lib/dates";
import type { Workout } from "@/lib/user-data";
import { cn } from "@/lib/utils";

export function ScheduleDaySheet({
  open,
  onOpenChange,
  day,
  workouts,
  selectedId,
  onSelect,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  day: WeekdayKey | null;
  workouts: Workout[];
  selectedId: string | null;
  onSelect: (workoutId: string | null) => void;
}) {
  if (!day) return null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        className="mx-auto w-full max-w-[430px] gap-0 rounded-t-2xl p-0"
      >
        <SheetHeader className="border-b border-border/80">
          <SheetTitle className="text-[17px] font-semibold">
            {WEEKDAY_LABELS[day]}
          </SheetTitle>
          <SheetDescription>Pick a workout or leave as rest.</SheetDescription>
        </SheetHeader>

        <ul className="max-h-[60dvh] overflow-y-auto py-2">
          <li>
            <button
              type="button"
              className={cn(
                "flex min-h-12 w-full items-center px-4 text-left text-[15px] font-medium active:bg-muted",
                selectedId === null && "text-primary",
              )}
              onClick={() => {
                onSelect(null);
                onOpenChange(false);
              }}
            >
              Rest
            </button>
          </li>
          {workouts.map((w) => (
            <li key={w.id}>
              <button
                type="button"
                className={cn(
                  "flex min-h-12 w-full flex-col items-start justify-center px-4 py-2 text-left active:bg-muted",
                  selectedId === w.id && "bg-muted/70",
                )}
                onClick={() => {
                  onSelect(w.id);
                  onOpenChange(false);
                }}
              >
                <span className="text-[15px] font-medium">{w.name}</span>
                <span className="text-[12px] text-muted-foreground">
                  {w.exerciseIds.length} exercises
                </span>
              </button>
            </li>
          ))}
          {workouts.length === 0 ? (
            <li className="px-4 py-6 text-[13px] text-muted-foreground">
              Create a workout first, then schedule it here.
            </li>
          ) : null}
        </ul>
      </SheetContent>
    </Sheet>
  );
}
