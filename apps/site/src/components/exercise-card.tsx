import Image from "next/image";
import Link from "next/link";
import { catalogTargetLabel } from "@workoutland/data/catalog";
import { getMachineForExercise } from "@workoutland/data/machines";
import type { Exercise } from "@workoutland/data/plan";
import { GameIcon } from "@/components/game-icon";
import { MUSCLE_ICON } from "@/lib/icons";

export function ExerciseCard({ exercise }: { exercise: Exercise }) {
  const machine = getMachineForExercise(exercise.id);
  const muscle = exercise.muscles[0];

  return (
    <Link
      href={`/workouts/${exercise.id}`}
      className="panel flex items-center gap-3 p-3"
    >
      <div className="relative size-16 shrink-0 overflow-hidden rounded-xl bg-white shadow-[inset_0_2px_0_oklch(0_0_0/0.08)]">
        {machine ? (
          <Image
            src={machine.image}
            alt=""
            fill
            sizes="64px"
            className="object-contain p-1.5"
          />
        ) : (
          <span className="grid size-full place-items-center bg-muted">
            <GameIcon src={MUSCLE_ICON[muscle ?? "cardio"]} className="size-9" />
          </span>
        )}
      </div>
      <div className="min-w-0 flex-1 space-y-0.5">
        <p className="truncate font-extrabold tracking-tight">{exercise.name}</p>
        <p className="truncate text-sm text-muted-foreground">{exercise.focus}</p>
        <p className="inline-flex items-center gap-1.5 font-mono text-xs font-bold text-primary">
          {muscle ? <GameIcon src={MUSCLE_ICON[muscle]} className="size-4" /> : null}
          {catalogTargetLabel(exercise)}
        </p>
      </div>
    </Link>
  );
}
