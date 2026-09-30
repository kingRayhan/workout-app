"use client";

import { Footprints, Plus } from "lucide-react";
import { IconTile } from "@/components/icon-tile";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { WEEKDAY_LABELS } from "@/lib/dates";
import type { ScheduleSlot, Workout } from "@/lib/user-data";
import { cn } from "@/lib/utils";

export function ScheduleDaySheet({
  open,
  onOpenChange,
  day,
  workouts,
  selectedId,
  onSelect,
  onQuickAdd,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  day: ScheduleSlot | null;
  workouts: Workout[];
  selectedId: string | null;
  onSelect: (workoutId: string | null) => void;
  /** Every-day slot only: create a treadmill-walk workout and assign it. */
  onQuickAdd?: () => void;
}) {
  if (!day) return null;
  const daily = day === "daily";

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        className="mx-auto w-full max-w-[430px] gap-0 rounded-t-2xl p-0"
      >
        <SheetHeader className="border-b border-border/80">
          <SheetTitle className="text-[17px] font-semibold">
            {daily ? "Every day" : WEEKDAY_LABELS[day]}
          </SheetTitle>
          <SheetDescription>
            {daily
              ? "Shows on Today every day — rest days included — next to that day’s workout."
              : "Pick a workout or leave as rest."}
          </SheetDescription>
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
              {daily ? "None" : "Rest"}
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
          {workouts.length === 0 && !daily ? (
            <li className="px-4 py-6 text-[13px] text-muted-foreground">
              Create a workout first, then schedule it here.
            </li>
          ) : null}
          {daily && onQuickAdd ? (
            <li className="px-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  onQuickAdd();
                  onOpenChange(false);
                }}
                className="flex min-h-14 w-full items-center gap-3 rounded-xl border border-dashed border-border px-3 py-2 text-left active:bg-muted"
              >
                <IconTile icon={Footprints} tone="amber" />
                <span className="min-w-0 flex-1">
                  <span className="block text-[15px] font-medium">
                    Daily treadmill walk
                  </span>
                  <span className="block text-[12px] text-muted-foreground">
                    New workout · 20 min at 4.5 km/h, editable
                  </span>
                </span>
                <Plus className="size-4 text-muted-foreground" aria-hidden />
              </button>
            </li>
          ) : null}
        </ul>
      </SheetContent>
    </Sheet>
  );
}
