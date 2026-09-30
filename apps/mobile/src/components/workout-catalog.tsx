"use client";

import { useEffect, useMemo, useState } from "react";
import { AppHeader } from "@/components/app-header";
import { ExerciseDetail } from "@/components/exercise-detail";
import { MEDIA_CREDIT } from "@workoutland/data/media";
import { PLAN_META, type Exercise, type MuscleGroup } from "@workoutland/data/plan";
import {
  allCatalogExercises,
  catalogTargetLabel,
  filterExercisesByQuery,
  filterExercisesByTag,
  MUSCLE_TAGS,
} from "@workoutland/data/catalog";
import { cn } from "@/lib/utils";
import { ChevronDown } from "lucide-react";

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

export function ExerciseRow({
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
  return (
    <article
      id={`exercise-${exercise.id}`}
      className={cn("scroll-mt-36", open && "bg-muted/50")}
    >
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
            {catalogTargetLabel(exercise)}
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
        <ExerciseDetail
          exercise={exercise}
          className="animate-expand px-4 pb-5"
        />
      ) : null}
    </article>
  );
}

export function WorkoutCatalog({
  embedded = false,
  tag = null,
  query = "",
  focusExerciseId = null,
  onTagChange,
}: {
  embedded?: boolean;
  tag?: MuscleGroup | null;
  query?: string;
  focusExerciseId?: string | null;
  onTagChange?: (tag: MuscleGroup | null) => void;
}) {
  const [localTag, setLocalTag] = useState<MuscleGroup | null>(null);
  const [openId, setOpenId] = useState<string | null>(focusExerciseId);

  const activeTag = onTagChange ? tag : localTag;
  const setTag = onTagChange ?? setLocalTag;

  const all = useMemo(() => allCatalogExercises(), []);
  const filtered = useMemo(() => {
    const byTag = filterExercisesByTag(all, activeTag);
    return filterExercisesByQuery(byTag, query);
  }, [all, activeTag, query]);

  useEffect(() => {
    if (!focusExerciseId) return;
    setOpenId(focusExerciseId);
    const timer = window.setTimeout(() => {
      document
        .getElementById(`exercise-${focusExerciseId}`)
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 80);
    return () => window.clearTimeout(timer);
  }, [focusExerciseId]);

  const body = (
    <>
      <div className="space-y-2.5 px-4 pt-2">
        <TagFilterBar value={activeTag} onChange={setTag} />
        <p className="text-[12px] text-muted-foreground">
          {filtered.length} exercise{filtered.length === 1 ? "" : "s"}
          {activeTag ? ` · ${activeTag}` : ""}
          {query.trim() ? ` · “${query.trim()}”` : ""}
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
            {query.trim()
              ? `No exercises match “${query.trim()}”.`
              : "No exercises for this tag."}
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
