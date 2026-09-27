"use client";

import { ExerciseDetail } from "@/components/exercise-detail";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import type { Exercise } from "@/data/plan";

export function ExerciseDrawer({
  exercise,
  open,
  onOpenChange,
}: {
  exercise: Exercise | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
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
                {exercise.sets}×{exercise.reps}
                <span className="mx-1.5 text-border">·</span>
                {exercise.focus}
              </DrawerDescription>
            </DrawerHeader>
            <div
              data-vaul-no-drag
              className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-4"
            >
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
