"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { AppHeader } from "@/components/app-header";
import { Badge } from "@/components/ui/badge";
import { getMachine } from "@/data/machines";
import { getExerciseExtra } from "@/data/exercise-extra";
import { EXERCISE_MACHINE, EXERCISE_VIDEO, MEDIA_CREDIT } from "@/data/media";
import { PLAN_META, type Exercise, type MuscleGroup } from "@/data/plan";
import {
  allCatalogExercises,
  filterExercisesByTag,
  MUSCLE_TAGS,
} from "@/lib/catalog";
import { cn } from "@/lib/utils";
import { ChevronDown } from "lucide-react";

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
      {children}
    </h3>
  );
}

export function TagFilterBar({
  value,
  onChange,
  className,
}: {
  value: MuscleGroup | null;
  onChange: (tag: MuscleGroup | null) => void;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex gap-1.5 overflow-x-auto pb-0.5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
        className,
      )}
      role="listbox"
      aria-label="Filter by muscle"
    >
      <button
        type="button"
        role="option"
        aria-selected={value === null}
        onClick={() => onChange(null)}
        className={cn(
          "shrink-0 rounded-full px-3 py-1.5 text-[12px] font-semibold transition-colors",
          value === null
            ? "bg-foreground text-background"
            : "bg-muted text-muted-foreground active:bg-muted/80",
        )}
      >
        All
      </button>
      {MUSCLE_TAGS.map((tag) => {
        const active = value === tag.id;
        return (
          <button
            key={tag.id}
            type="button"
            role="option"
            aria-selected={active}
            onClick={() => onChange(active ? null : tag.id)}
            className={cn(
              "shrink-0 rounded-full px-3 py-1.5 text-[12px] font-semibold transition-colors",
              active
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground active:bg-muted/80",
            )}
          >
            {tag.label}
          </button>
        );
      })}
    </div>
  );
}

function ExerciseRow({
  exercise,
  index,
  open,
  onToggle,
}: {
  exercise: Exercise;
  index: number;
  open: boolean;
  onToggle: () => void;
}) {
  const video = EXERCISE_VIDEO[exercise.id];
  const machine = getMachine(EXERCISE_MACHINE[exercise.id] ?? "");
  const extra = getExerciseExtra(exercise.id);

  return (
    <article className={cn(open && "bg-muted/50")}>
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        className="flex w-full items-center gap-3 px-4 py-3.5 text-left active:bg-muted/80"
      >
        <span className="w-6 shrink-0 font-mono text-xs tabular-nums text-muted-foreground">
          {String(index + 1).padStart(2, "0")}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-[15px] font-semibold leading-snug text-foreground">
            {exercise.name}
          </span>
          <span className="mt-0.5 block truncate text-[13px] text-muted-foreground">
            {exercise.sets}×{exercise.reps}
            <span className="mx-1.5 text-border">·</span>
            {exercise.focus}
          </span>
        </span>
        <ChevronDown
          className={cn(
            "size-4 shrink-0 text-muted-foreground transition-transform",
            open && "rotate-180 text-foreground",
          )}
          aria-hidden
        />
      </button>

      {open ? (
        <div className="animate-expand space-y-4 px-4 pb-5">
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
              {exercise.sets} × {exercise.reps}
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
              className="flex items-center gap-3 rounded-xl bg-muted p-2.5 active:bg-muted/80"
            >
              <span className="relative size-14 shrink-0 overflow-hidden rounded-lg bg-background">
                <Image
                  src={machine.image}
                  alt=""
                  fill
                  className="object-cover"
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
      ) : null}
    </article>
  );
}

export function WorkoutCatalog({
  embedded = false,
  tag = null,
  onTagChange,
}: {
  embedded?: boolean;
  tag?: MuscleGroup | null;
  onTagChange?: (tag: MuscleGroup | null) => void;
}) {
  const [localTag, setLocalTag] = useState<MuscleGroup | null>(null);
  const [openId, setOpenId] = useState<string | null>(null);

  const activeTag = onTagChange ? tag : localTag;
  const setTag = onTagChange ?? setLocalTag;

  const all = useMemo(() => allCatalogExercises(), []);
  const filtered = useMemo(
    () => filterExercisesByTag(all, activeTag),
    [all, activeTag],
  );

  const body = (
    <>
      <div className="space-y-2.5 px-4">
        <p className="rounded-lg bg-muted px-3 py-2 text-[12px] leading-snug text-muted-foreground">
          <span className="font-medium text-foreground">Weight:</span> last reps
          hard, form clean. Easy 15 → add load.
        </p>
        <TagFilterBar value={activeTag} onChange={setTag} />
        <p className="text-[12px] text-muted-foreground">
          {filtered.length} exercise{filtered.length === 1 ? "" : "s"}
          {activeTag ? ` · ${activeTag}` : ""}
        </p>
      </div>

      <div className="mt-2 divide-y divide-border/80 border-y border-border/80 bg-card">
        {filtered.map((exercise, index) => (
          <ExerciseRow
            key={exercise.id}
            exercise={exercise}
            index={index}
            open={openId === exercise.id}
            onToggle={() =>
              setOpenId((current) =>
                current === exercise.id ? null : exercise.id,
              )
            }
          />
        ))}
        {filtered.length === 0 ? (
          <p className="px-4 py-8 text-center text-[13px] text-muted-foreground">
            No exercises for this tag.
          </p>
        ) : null}
      </div>

      <p className="mt-4 px-4 text-center text-[10px] text-muted-foreground">
        {MEDIA_CREDIT}
      </p>
    </>
  );

  if (embedded) {
    return <div className="flex flex-col">{body}</div>;
  }

  return (
    <div className="flex flex-col pb-6">
      <AppHeader
        title="Catalog"
        subtitle={`${PLAN_META.sets}×${PLAN_META.reps} · ${all.length} exercises`}
      />
      {body}
    </div>
  );
}
