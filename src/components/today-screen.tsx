"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ActivityHeatmap } from "@/components/activity-heatmap";
import { AppHeader } from "@/components/app-header";
import { BodyWeightCard } from "@/components/body-weight-card";
import { GoogleSignInButton } from "@/components/google-sign-in-button";
import { TodolistSkeleton } from "@/components/skeletons";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ExerciseDrawer } from "@/components/exercise-drawer";
import { OnboardingTour } from "@/components/onboarding-tour";
import { useProfile, useTodayTodolist } from "@/hooks/use-user-data";
import { useAuth } from "@/lib/auth";
import {
  IconTile,
  MUSCLE_STYLE,
  SectionTitle,
  TONE_TEXT,
  TONE_TILE,
} from "@/components/icon-tile";
import type { Exercise, MuscleGroup } from "@/data/plan";
import {
  catalogExerciseName,
  getCatalogExercise,
  MUSCLE_TAGS,
} from "@/lib/catalog";
import { localDateKey, WEEKDAY_LABELS } from "@/lib/dates";
import {
  setExerciseDone,
  setTourStatus,
  type TourStatus,
} from "@/lib/user-data";
import { cn } from "@/lib/utils";
import {
  BedDouble,
  BookOpen,
  CalendarPlus,
  ChartColumn,
  Check,
  ChevronLeft,
  ChevronRight,
  Eye,
  Flame,
  ListChecks,
  LogIn,
  PartyPopper,
} from "lucide-react";

/** How far ahead the day switcher can preview. */
const MAX_FUTURE_DAYS = 6;

function DaySwitcher({
  selected,
  offset,
  onChange,
}: {
  selected: Date;
  offset: number;
  onChange: (offset: number) => void;
}) {
  const relative =
    offset === 0
      ? "Today"
      : offset === -1
        ? "Yesterday"
        : offset === 1
          ? "Tomorrow"
          : selected.toLocaleDateString(undefined, { weekday: "long" });
  const dateLabel = selected.toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
  });

  return (
    <div data-tour="day-switcher" className="flex items-center gap-1">
      <Button
        variant="ghost"
        size="icon"
        className="size-10 rounded-xl"
        aria-label="Previous day"
        onClick={() => onChange(offset - 1)}
      >
        <ChevronLeft className="size-5" />
      </Button>
      <button
        type="button"
        className="min-w-0 flex-1 rounded-xl py-1 text-center active:bg-muted/60 disabled:active:bg-transparent"
        onClick={() => onChange(0)}
        disabled={offset === 0}
        aria-label={offset === 0 ? undefined : "Back to today"}
      >
        <span
          className={cn(
            "flex items-center justify-center gap-1.5 text-[15px] font-semibold leading-tight",
            offset === 0 && "text-primary",
            offset > 0 && "text-sky-400",
          )}
        >
          <span
            className={cn(
              "size-1.5 rounded-full",
              offset === 0 ? "bg-primary" : offset > 0 ? "bg-sky-400" : "bg-muted-foreground",
            )}
            aria-hidden
          />
          {relative}
        </span>
        <span className="block text-[12px] text-muted-foreground">
          {dateLabel}
          {offset !== 0 ? " · tap for today" : ""}
        </span>
      </button>
      <Button
        variant="ghost"
        size="icon"
        className="size-10 rounded-xl"
        aria-label="Next day"
        disabled={offset >= MAX_FUTURE_DAYS}
        onClick={() => onChange(offset + 1)}
      >
        <ChevronRight className="size-5" />
      </Button>
    </div>
  );
}

export function TodayScreen() {
  const { user, loading: authLoading } = useAuth();
  const { profile, loading: profileLoading } = useProfile();
  const [tourDismissed, setTourDismissed] = useState(false);
  const [peekExercise, setPeekExercise] = useState<Exercise | null>(null);
  const [offset, setOffset] = useState(0);
  const selected = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + offset);
    return d;
  }, [offset]);
  const isFuture = offset > 0;
  const {
    date,
    weekday,
    workout,
    workoutId,
    doneIds,
    loading,
    error,
  } = useTodayTodolist(localDateKey(selected));

  const weekdayLong = new Intl.DateTimeFormat(undefined, {
    weekday: "long",
  }).format(selected);
  const dateLabel = new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
  }).format(selected);

  const doneCount = workout
    ? workout.exerciseIds.filter((id) => doneIds.has(id)).length
    : 0;
  const total = workout?.exerciseIds.length ?? 0;
  const allDone = !isFuture && total > 0 && doneCount === total;
  const workoutMuscles = useMemo(() => {
    const seen = new Set<MuscleGroup>();
    for (const id of workout?.exerciseIds ?? []) {
      for (const m of getCatalogExercise(id)?.muscles ?? []) seen.add(m);
    }
    return MUSCLE_TAGS.map((t) => t.id).filter((m) => seen.has(m));
  }, [workout]);
  const showDataSkeleton = authLoading || (Boolean(user) && loading);
  const showTour =
    Boolean(user) &&
    !profileLoading &&
    !showDataSkeleton &&
    offset === 0 &&
    profile.tourStatus === null &&
    !tourDismissed;

  function finishTour(status: TourStatus) {
    setTourDismissed(true);
    if (user) void setTourStatus(user.uid, status).catch(() => {});
  }

  const firstName = user?.displayName?.trim().split(/\s+/)[0];
  const hour = new Date().getHours();
  const timeGreeting =
    hour < 5 ? "Late night" : hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  const headerTitle =
    user && firstName ? `${timeGreeting}, ${firstName}` : "Today";

  const statusLine = !user
    ? `${weekdayLong} · ${dateLabel}`
    : loading
      ? `${weekdayLong} · ${dateLabel}`
      : !workout
        ? `Rest day · ${weekdayLong}`
        : total === 0
          ? `${weekdayLong} · ${dateLabel}`
          : doneCount === total
            ? `All ${total} done for ${weekdayLong} 🎉`
            : `${doneCount}/${total} done · ${weekdayLong}`;

  async function toggle(exerciseId: string, next: boolean) {
    if (!user || isFuture) return;
    try {
      await setExerciseDone(user.uid, {
        date,
        exerciseId,
        workoutId,
        done: next,
      });
    } catch {
      // snapshot will reconcile
    }
  }

  return (
    <div className="flex flex-col pb-4">
      {showTour ? <OnboardingTour onFinish={finishTour} /> : null}
      <ExerciseDrawer
        exercise={peekExercise}
        open={peekExercise !== null}
        onOpenChange={(open) => {
          if (!open) setPeekExercise(null);
        }}
      />
      <AppHeader title={headerTitle} subtitle={statusLine} />

      <div className="flex flex-col gap-3 px-4 pt-1">
        {user ? (
          <DaySwitcher selected={selected} offset={offset} onChange={setOffset} />
        ) : null}

        {showDataSkeleton ? <TodolistSkeleton /> : null}

        {!authLoading && !user ? (
          <section className="animate-rise rounded-2xl bg-muted px-4 py-4">
            <IconTile icon={LogIn} tone="lime" className="mb-2.5" />
            <h2 className="text-[17px] font-semibold tracking-tight">
              Sign in for your todolist
            </h2>
            <p className="mt-1 text-[13px] leading-snug text-muted-foreground">
              Schedule workouts and check off today’s exercises.
            </p>
            <div className="mt-3">
              <GoogleSignInButton />
            </div>
          </section>
        ) : null}

        {user && error ? (
          <p className="rounded-xl bg-destructive/10 px-3 py-2 text-[13px] text-destructive">
            {error}
          </p>
        ) : null}

        {user && !loading && !workout ? (
          <section
            data-tour="rest-day"
            className="animate-rise rounded-2xl bg-muted px-4 py-8 text-center"
          >
            <span className="mx-auto mb-3 grid size-12 place-items-center rounded-2xl bg-sky-500/15 text-sky-400">
              <BedDouble className="size-6" aria-hidden />
            </span>
            <p className="text-[17px] font-semibold tracking-tight">
              Rest day
            </p>
            <p className="mx-auto mt-1.5 max-w-[15rem] text-[13px] leading-snug text-muted-foreground">
              Nothing on {WEEKDAY_LABELS[weekday]} — schedule a workout in Plan.
            </p>
            <Button asChild className="mt-4 h-10 rounded-xl px-5 font-semibold">
              <Link href="/plan">
                <CalendarPlus className="size-4" aria-hidden />
                Open Plan
              </Link>
            </Button>
          </section>
        ) : null}

        {user && workout ? (
          <section
            data-tour="todolist"
            className="animate-rise overflow-hidden rounded-2xl bg-card ring-1 ring-border/80"
          >
            <div className="flex items-start gap-3 px-4 pt-3.5 pb-3">
              <IconTile
                icon={allDone ? PartyPopper : isFuture ? Eye : ListChecks}
                tone={allDone ? "lime" : isFuture ? "sky" : "lime"}
              />
              <div className="min-w-0 flex-1">
                <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
                  {isFuture ? "Preview" : "Daily todolist"}
                </p>
                <h2 className="mt-0.5 text-[17px] font-semibold leading-tight tracking-tight">
                  {workout.name}
                </h2>
                {workoutMuscles.length ? (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {workoutMuscles.map((m) => {
                      const style = MUSCLE_STYLE[m];
                      const Icon = style.icon;
                      return (
                        <span
                          key={m}
                          className={cn(
                            "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium",
                            TONE_TILE[style.tone],
                          )}
                        >
                          <Icon className="size-3" aria-hidden />
                          {style.label}
                        </span>
                      );
                    })}
                  </div>
                ) : null}
              </div>
              {total > 0 ? (
                <div className="text-right">
                  <p
                    className={cn(
                      "text-[20px] font-semibold leading-none tabular-nums",
                      allDone ? "text-primary" : "text-foreground",
                    )}
                  >
                    {isFuture ? total : `${doneCount}/${total}`}
                  </p>
                  <p className="mt-1 text-[11px] text-muted-foreground">
                    {isFuture ? "exercises" : allDone ? "all done" : "done"}
                  </p>
                </div>
              ) : null}
            </div>
            {total > 0 && !isFuture ? (
              <div className="mx-4 mb-3 h-1.5 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-primary transition-[width] duration-500"
                  style={{ width: `${(doneCount / total) * 100}%` }}
                />
              </div>
            ) : null}
            <ul className="border-t border-border/80">
              {workout.exerciseIds.map((id) => {
                const checked = doneIds.has(id);
                const name = catalogExerciseName(id);
                const muscles = getCatalogExercise(id)?.muscles ?? [];
                const primary = muscles[0] ? MUSCLE_STYLE[muscles[0]] : null;
                return (
                  <li
                    key={id}
                    className={cn(
                      "flex min-h-14 items-center gap-2 border-b border-border/60 last:border-b-0",
                      checked && "bg-primary/8",
                    )}
                  >
                    <label
                      className={cn(
                        "flex min-h-14 min-w-0 flex-1 items-center gap-3 py-2 pl-4",
                        isFuture ? "cursor-default" : "cursor-pointer active:bg-muted/60",
                      )}
                    >
                      <Checkbox
                        checked={checked}
                        disabled={isFuture}
                        onCheckedChange={(v) => void toggle(id, v === true)}
                        className="size-5 rounded-md"
                      />
                      {primary ? (
                        <IconTile
                          icon={checked ? Check : primary.icon}
                          tone={checked ? "lime" : primary.tone}
                        />
                      ) : null}
                      <span className="min-w-0 flex-1">
                        <span
                          className={cn(
                            "block text-[15px] font-medium leading-snug",
                            checked && "text-muted-foreground line-through",
                          )}
                        >
                          {name}
                        </span>
                        {muscles.length ? (
                          <span className="mt-0.5 flex flex-wrap gap-x-2 text-[11px] font-medium">
                            {muscles.map((m) => (
                              <span
                                key={m}
                                className={
                                  checked
                                    ? "text-muted-foreground"
                                    : TONE_TEXT[MUSCLE_STYLE[m].tone]
                                }
                              >
                                {MUSCLE_STYLE[m].label}
                              </span>
                            ))}
                          </span>
                        ) : null}
                      </span>
                    </label>
                    <button
                      type="button"
                      aria-label={`Look up ${name}`}
                      onClick={() => {
                        const exercise = getCatalogExercise(id);
                        if (exercise) setPeekExercise(exercise);
                      }}
                      className="mr-2 flex size-10 shrink-0 items-center justify-center rounded-lg text-muted-foreground active:bg-muted active:text-primary"
                    >
                      <BookOpen className="size-4" aria-hidden />
                    </button>
                  </li>
                );
              })}
            </ul>
            {total === 0 ? (
              <p className="px-4 py-4 text-[13px] text-muted-foreground">
                This workout has no exercises yet.
              </p>
            ) : null}
          </section>
        ) : null}

        {user ? (
          <BodyWeightCard key={date} date={date} disabled={isFuture} />
        ) : null}

        {user || authLoading ? (
          <section
            data-tour="activity"
            className="animate-rise rounded-2xl bg-card px-4 py-3.5 ring-1 ring-border/80"
          >
            <div className="flex items-center justify-between gap-2">
              <SectionTitle icon={Flame} tone="lime">
                Activity
              </SectionTitle>
              <Link
                href="/you"
                className="flex items-center gap-1 text-[12px] font-semibold text-primary"
              >
                <ChartColumn className="size-3.5" aria-hidden />
                Report
              </Link>
            </div>
            <div className="mt-2 w-full">
              <ActivityHeatmap
                range={{ months: 3 }}
                compact
                fill
                showRangeLabel
                showLegend
              />
            </div>
          </section>
        ) : (
          <section className="animate-rise rounded-2xl bg-card px-4 py-3.5 ring-1 ring-border/80">
            <SectionTitle icon={Flame} tone="lime">
              Activity
            </SectionTitle>
            <p className="mt-1.5 text-[12px] text-muted-foreground">
              Greens unlock when you check the daily todolist.
            </p>
          </section>
        )}

        <Link
          href="/catalog"
          className="animate-rise flex min-h-12 items-center gap-3 rounded-2xl bg-card px-4 py-3 ring-1 ring-border/80 active:bg-muted/60"
        >
          <IconTile icon={BookOpen} tone="violet" />
          <span className="min-w-0 flex-1">
            <span className="block text-[15px] font-semibold">
              Browse catalog
            </span>
            <span className="block text-[12px] text-muted-foreground">
              Form videos & cues
            </span>
          </span>
          <ChevronRight className="size-4 text-muted-foreground" aria-hidden />
        </Link>
      </div>
    </div>
  );
}
