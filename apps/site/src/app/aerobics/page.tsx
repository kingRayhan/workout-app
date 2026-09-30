import type { Metadata } from "next";
import Link from "next/link";
import { AEROBIC_GROUPS } from "@workoutland/data/aerobics";
import { catalogTargetLabel } from "@workoutland/data/catalog";
import { EXERCISE_VIDEO } from "@workoutland/data/media";
import { FormVideo } from "@/components/form-video";
import { GameIcon } from "@/components/game-icon";
import { ICONS, MUSCLE_ICON } from "@/lib/icons";

export const metadata: Metadata = {
  title: "Aerobics",
  description:
    "Gym floor aerobics: open-hand rounds and light-plate moves like disc jumping jacks, disc squats, twists, and presses.",
};

export default function AerobicsPage() {
  return (
    <div className="mx-auto max-w-6xl space-y-12 px-5 pt-14">
      <header className="max-w-2xl space-y-3">
        <h1 className="flex items-center gap-3 text-4xl font-extrabold tracking-tight">
          <GameIcon src={ICONS.aerobics} className="size-12" />
          Aerobics
        </h1>
        <p className="text-lg text-muted-foreground text-pretty">
          The floor block from a gym class: open hand first, then a light disc. Clips loop where we have one.
        </p>
      </header>

      {AEROBIC_GROUPS.map((group) => (
        <section key={group.id} id={group.id} className="scroll-mt-24 space-y-4">
          <div>
            <p className="badge">{group.label}</p>
            <p className="mt-2 max-w-xl text-sm text-muted-foreground">{group.blurb}</p>
          </div>
          <div className={group.exercises.length > 1 ? "grid gap-4 sm:grid-cols-2" : "grid max-w-3xl"}>
            {group.exercises.map((exercise) => {
              const video = EXERCISE_VIDEO[exercise.id];
              return (
                <Link
                  key={exercise.id}
                  href={`/aerobics/${exercise.id}`}
                  className="panel overflow-hidden"
                >
                  {video ? (
                    <FormVideo src={video} label={`${exercise.name} form demo`} />
                  ) : (
                    <div className="grid aspect-video place-items-center bg-muted">
                      <GameIcon src={MUSCLE_ICON[exercise.muscles[0] ?? "cardio"]} className="size-16" />
                    </div>
                  )}
                  <div className="space-y-1 p-4">
                    <p className="text-lg font-extrabold tracking-tight">{exercise.name}</p>
                    <p className="text-sm text-muted-foreground">{exercise.focus}</p>
                    {exercise.videoHint ? (
                      <p className="text-sm text-pretty text-muted-foreground">{exercise.videoHint}</p>
                    ) : null}
                    <p className="font-mono text-xs font-bold text-primary">
                      {catalogTargetLabel(exercise)} rounds
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}
