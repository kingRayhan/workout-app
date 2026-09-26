"use client";

import Link from "next/link";
import { ActivityHeatmap } from "@/components/activity-heatmap";
import { AppHeader } from "@/components/app-header";
import { GoogleSignInButton } from "@/components/google-sign-in-button";
import { TodolistSkeleton } from "@/components/skeletons";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useTodayTodolist } from "@/hooks/use-user-data";
import { useAuth } from "@/lib/auth";
import { catalogExerciseName } from "@/lib/catalog";
import { WEEKDAY_LABELS } from "@/lib/dates";
import { setExerciseDone } from "@/lib/user-data";
import { cn } from "@/lib/utils";
import { BookOpen } from "lucide-react";

export function TodayScreen() {
  const { user, loading: authLoading } = useAuth();
  const {
    date,
    weekday,
    workout,
    workoutId,
    doneIds,
    loading,
    error,
  } = useTodayTodolist();

  const weekdayLong = new Intl.DateTimeFormat(undefined, {
    weekday: "long",
  }).format(new Date());
  const dateLabel = new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
  }).format(new Date());

  const doneCount = workout
    ? workout.exerciseIds.filter((id) => doneIds.has(id)).length
    : 0;
  const total = workout?.exerciseIds.length ?? 0;
  const showDataSkeleton = authLoading || (Boolean(user) && loading);

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
    if (!user) return;
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
      <AppHeader title={headerTitle} subtitle={statusLine} />

      <div className="flex flex-col gap-3 px-4 pt-1">
        {showDataSkeleton ? <TodolistSkeleton /> : null}

        {!authLoading && !user ? (
          <section className="animate-rise rounded-2xl bg-muted px-4 py-4">
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
          <section className="animate-rise rounded-2xl bg-muted px-4 py-8 text-center">
            <p className="text-[17px] font-semibold tracking-tight">
              Rest day
            </p>
            <p className="mx-auto mt-1.5 max-w-[15rem] text-[13px] leading-snug text-muted-foreground">
              Nothing on {WEEKDAY_LABELS[weekday]} — schedule a workout in Plan.
            </p>
            <Button asChild className="mt-4 h-10 rounded-xl px-5 font-semibold">
              <Link href="/plan">Open Plan</Link>
            </Button>
          </section>
        ) : null}

        {user && workout ? (
          <section className="animate-rise overflow-hidden rounded-2xl bg-card ring-1 ring-border/80">
            <div className="px-4 py-3.5">
              <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
                Daily todolist
              </p>
              <h2 className="mt-0.5 text-[17px] font-semibold tracking-tight">
                {workout.name}
              </h2>
              <p className="mt-0.5 text-[13px] text-muted-foreground">
                {doneCount}/{total} done
              </p>
            </div>
            <ul className="border-t border-border/80">
              {workout.exerciseIds.map((id) => {
                const checked = doneIds.has(id);
                const name = catalogExerciseName(id);
                return (
                  <li
                    key={id}
                    className={cn(
                      "flex min-h-12 items-center gap-2 border-b border-border/60 last:border-b-0",
                      checked && "bg-primary/8",
                    )}
                  >
                    <label
                      className={cn(
                        "flex min-h-12 min-w-0 flex-1 cursor-pointer items-center gap-3 py-2.5 pl-4 active:bg-muted/60",
                      )}
                    >
                      <Checkbox
                        checked={checked}
                        onCheckedChange={(v) => void toggle(id, v === true)}
                        className="size-5 rounded-md"
                      />
                      <span
                        className={cn(
                          "min-w-0 flex-1 text-[15px] font-medium leading-snug",
                          checked && "text-muted-foreground line-through",
                        )}
                      >
                        {name}
                      </span>
                    </label>
                    <Link
                      href={`/catalog?exercise=${encodeURIComponent(id)}`}
                      aria-label={`Look up ${name}`}
                      className="mr-2 flex size-10 shrink-0 items-center justify-center rounded-lg text-muted-foreground active:bg-muted active:text-primary"
                    >
                      <BookOpen className="size-4" aria-hidden />
                    </Link>
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

        {user || authLoading ? (
          <section className="animate-rise rounded-2xl bg-card px-4 py-3.5 ring-1 ring-border/80">
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-[13px] font-semibold text-foreground">
                Activity
              </h2>
              <Link
                href="/you"
                className="text-[12px] font-semibold text-primary"
              >
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
            <h2 className="text-[13px] font-semibold">Activity</h2>
            <p className="mt-1.5 text-[12px] text-muted-foreground">
              Greens unlock when you check the daily todolist.
            </p>
          </section>
        )}

        <Link
          href="/catalog"
          className="animate-rise flex min-h-12 items-center justify-between rounded-2xl bg-card px-4 py-3 ring-1 ring-border/80 active:bg-muted/60"
        >
          <span>
            <span className="block text-[15px] font-semibold">
              Browse catalog
            </span>
            <span className="block text-[12px] text-muted-foreground">
              Form videos & cues
            </span>
          </span>
          <span className="text-primary" aria-hidden>
            →
          </span>
        </Link>
      </div>
    </div>
  );
}
