"use client";

import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { getExerciseExtra } from "@workoutland/data/exercise-extra";
import { getMachine } from "@workoutland/data/machines";
import { EXERCISE_MACHINE, EXERCISE_VIDEO } from "@workoutland/data/media";
import type { Exercise } from "@workoutland/data/plan";
import { catalogTargetLabel } from "@workoutland/data/catalog";
import { cn } from "@/lib/utils";

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
      {children}
    </h3>
  );
}

export function ExerciseDetail({
  exercise,
  className,
  onNavigate,
}: {
  exercise: Exercise;
  className?: string;
  /** Called when an in-detail link navigates away (e.g. close the drawer). */
  onNavigate?: () => void;
}) {
  const video = EXERCISE_VIDEO[exercise.id];
  const machine = getMachine(EXERCISE_MACHINE[exercise.id] ?? "");
  const extra = getExerciseExtra(exercise.id);

  return (
    <div className={cn("space-y-4", className)}>
      {video ? (
        <div className="overflow-hidden rounded-xl bg-black">
          <div className="relative aspect-video w-full">
            <video
              key={video}
              className="h-full w-full object-contain"
              src={video}
              autoPlay
              muted
              loop
              playsInline
              controls
              preload="metadata"
              aria-label={`How to do ${exercise.name}`}
            />
          </div>
        </div>
      ) : null}

      <div className="flex flex-wrap gap-1.5">
        <Badge variant="secondary" className="rounded-md font-medium">
          {catalogTargetLabel(exercise)}
        </Badge>
        {exercise.muscles.map((m) => (
          <Badge key={m} variant="outline" className="rounded-md capitalize">
            {m}
          </Badge>
        ))}
        {machine ? (
          <Badge variant="outline" className="rounded-md font-medium">
            {machine.name}
          </Badge>
        ) : null}
      </div>

      {extra?.tempo ? (
        <div>
          <SectionLabel>Tempo</SectionLabel>
          <p className="mt-1.5 text-[14px] leading-relaxed text-foreground">
            {extra.tempo}
          </p>
        </div>
      ) : null}

      {extra?.why ? (
        <div>
          <SectionLabel>Why</SectionLabel>
          <p className="mt-1.5 text-[14px] leading-relaxed text-foreground/90">
            {extra.why}
          </p>
        </div>
      ) : null}

      <div>
        <SectionLabel>Steps</SectionLabel>
        <ol className="mt-2 space-y-2">
          {exercise.steps.map((step, i) => (
            <li
              key={step}
              className="flex gap-2.5 text-[14px] leading-relaxed text-foreground/90"
            >
              <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-foreground text-[10px] font-semibold text-background">
                {i + 1}
              </span>
              <span>{step}</span>
            </li>
          ))}
        </ol>
      </div>

      {extra && extra.cautions.length > 0 ? (
        <div className="rounded-xl bg-primary/15 px-3.5 py-3">
          <SectionLabel>Caution</SectionLabel>
          <ul className="mt-2 space-y-1.5">
            {extra.cautions.map((item) => (
              <li
                key={item}
                className="text-[14px] leading-relaxed text-foreground/90"
              >
                {item}
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {(exercise.avoid || (extra && extra.mistakes.length > 0)) && (
        <div>
          <SectionLabel>Avoid</SectionLabel>
          <ul className="mt-1.5 space-y-1 text-[14px] leading-relaxed text-foreground/90">
            {exercise.avoid ? <li>{exercise.avoid}</li> : null}
            {extra?.mistakes.map((m) => (
              <li key={m}>{m}</li>
            ))}
          </ul>
        </div>
      )}

      {exercise.tip ? (
        <div>
          <SectionLabel>Tip</SectionLabel>
          <p className="mt-1.5 text-[14px] leading-relaxed text-foreground">
            {exercise.tip}
          </p>
        </div>
      ) : null}

      {extra?.breathing ? (
        <div>
          <SectionLabel>Breathing</SectionLabel>
          <p className="mt-1.5 text-[14px] leading-relaxed text-foreground/90">
            {extra.breathing}
          </p>
        </div>
      ) : null}

      {machine ? (
        <Link
          href={`/catalog?tab=machines#${machine.id}`}
          onClick={onNavigate}
          className="flex items-center gap-3 rounded-xl bg-muted p-2.5 active:bg-muted/80"
        >
          <span className="relative size-14 shrink-0 overflow-hidden rounded-lg bg-background">
            <Image
              src={machine.image}
              alt=""
              fill
              className="object-contain p-0.5"
              sizes="56px"
            />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-[13px] font-semibold text-foreground">
              {machine.name}
            </span>
            <span className="mt-0.5 line-clamp-1 text-[12px] text-muted-foreground">
              {machine.howToFind}
            </span>
          </span>
          <span className="pr-1 text-sm text-primary" aria-hidden>
            →
          </span>
        </Link>
      ) : null}
    </div>
  );
}
