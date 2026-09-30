"use client";

import { ExerciseDetail } from "@/components/exercise-detail";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import type { Exercise } from "@workoutland/data/plan";
import { catalogTargetLabel } from "@workoutland/data/catalog";
import { formatExerciseTargets, type ExerciseSettings } from "@/lib/user-data";

export function ExerciseDrawer({
  exercise: baseExercise,
  targets,
  open,
  onOpenChange,
  children,
}: {
  exercise: Exercise | null;
  /** Workout-specific targets; overrides the catalog sets × reps. */
  targets?: ExerciseSettings;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Rendered above the exercise guide (e.g. the log form). */
  children?: React.ReactNode;
}) {
  const exercise =
    baseExercise && targets
      ? {
          ...baseExercise,
          sets: targets.sets,
          reps: targets.reps,
          cardio: baseExercise.cardio && {
            durationMin: targets.durationMin ?? baseExercise.cardio.durationMin,
            speedKmh: targets.speedKmh ?? undefined,
            inclinePct: targets.inclinePct ?? undefined,
            level: targets.level ?? undefined,
          },
        }
      : baseExercise;
  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="mx-auto h-[100dvh] w-full max-w-[430px] rounded-none border-0 data-[vaul-drawer-direction=bottom]:mt-0 data-[vaul-drawer-direction=bottom]:max-h-[100dvh]">
        {exercise ? (
          <>
            <DrawerHeader className="shrink-0 gap-1 border-b border-border/80 pb-3 text-left group-data-[vaul-drawer-direction=bottom]/drawer-content:text-left">
              <DrawerTitle className="text-[19px] font-semibold tracking-tight">
                {exercise.name}
              </DrawerTitle>
              <DrawerDescription className="text-[13px]">
                {targets
                  ? formatExerciseTargets(targets)
                  : catalogTargetLabel(exercise)}
                <span className="mx-1.5 text-border">·</span>
                {exercise.focus}
              </DrawerDescription>
            </DrawerHeader>
            <div
              data-vaul-no-drag
              className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-4"
            >
              {children ? (
                <>
                  <div className="mb-5">{children}</div>
                  <h3 className="mb-2 px-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
                    How to do it
                  </h3>
                </>
              ) : null}
              <ExerciseDetail
                exercise={exercise}
                onNavigate={() => onOpenChange(false)}
              />
            </div>
          </>
        ) : (
          <DrawerHeader>
            <DrawerTitle>Exercise</DrawerTitle>
          </DrawerHeader>
        )}
      </DrawerContent>
    </Drawer>
  );
}
