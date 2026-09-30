"use client";

import {
  Check,
  ChevronRight,
  History,
  TrendingDown,
  TrendingUp,
  Trophy,
} from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { exerciseLogHref } from "@/lib/routes";
import { CardioSteppers, Stepper } from "@/components/exercise-settings-editor";
import {
  cardioDistanceKm,
  cardioMetrics,
  isCardioExercise,
  metricValue,
  progressMetric,
} from "@workoutland/data/catalog";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";
import { celebrate } from "@/lib/confetti";
import { useExerciseHistory } from "@/hooks/use-user-data";
import { relativeDayLabel } from "@/lib/dates";
import {
  formatPerformed,
  setExerciseDone,
  SETTINGS_LIMITS,
  type ExerciseLog,
  type ExerciseSettings,
  type PerformedSet,
} from "@/lib/user-data";
import { cn } from "@/lib/utils";

const HISTORY_ROWS = 8;

export function targetsToPerformed(t: ExerciseSettings): PerformedSet {
  return {
    sets: t.sets,
    reps: t.reps,
    weightKg: t.weightKg,
    durationMin: t.durationMin,
    speedKmh: t.speedKmh,
    inclinePct: t.inclinePct,
    level: t.level,
  };
}

function initialValues(
  targets: ExerciseSettings,
  log: ExerciseLog | undefined,
): PerformedSet {
  const t = targetsToPerformed(targets);
  if (!log) return t;
  const cardioLogged = log.durationMin !== null;
  return {
    sets: log.sets ?? t.sets,
    reps: log.reps ?? t.reps,
    weightKg: log.weightKg ?? t.weightKg,
    durationMin: log.durationMin ?? t.durationMin,
    speedKmh: cardioLogged ? log.speedKmh : t.speedKmh,
    inclinePct: cardioLogged ? log.inclinePct : t.inclinePct,
    level: cardioLogged ? log.level : t.level,
  };
}

const PERFORMED_KEYS = [
  "sets",
  "reps",
  "weightKg",
  "durationMin",
  "speedKmh",
  "inclinePct",
  "level",
] as const satisfies readonly (keyof PerformedSet)[];

function samePerformed(a: PerformedSet, b: PerformedSet) {
  return PERFORMED_KEYS.every((k) => a[k] === b[k]);
}

function pickPerformed(p: PerformedSet): PerformedSet {
  return Object.fromEntries(PERFORMED_KEYS.map((k) => [k, p[k]])) as PerformedSet;
}

export function ExerciseLogPanel({
  exerciseId,
  date,
  workoutId,
  targets,
  log,
  disabled = false,
  onLogged,
}: {
  exerciseId: string;
  date: string;
  workoutId: string | null;
  targets: ExerciseSettings;
  /** The log for `date`, if the exercise is already checked off. */
  log: ExerciseLog | undefined;
  disabled?: boolean;
  /** After a successful save (first log or update), e.g. to close the sheet. */
  onLogged?: () => void;
}) {
  const { user } = useAuth();
  const { logs: history, loading } = useExerciseHistory(exerciseId);
  const [value, setValue] = useState(() => initialValues(targets, log));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { sets, reps, weightKg } = SETTINGS_LIMITS;
  const cardio = isCardioExercise(exerciseId);
  const metric = progressMetric(exerciseId);

  const logged = Boolean(log?.done);
  const saved = log ? initialValues(targets, log) : null;
  const dirty =
    !saved || !samePerformed(value, saved) || formatPerformed(log!) === null;

  const previous = useMemo(
    () => history.find((l) => l.date < date && formatPerformed(l)),
    [history, date],
  );
  const best = useMemo(() => {
    let top: ExerciseLog | null = null;
    for (const l of history) {
      const v = metricValue(l, metric);
      if (v !== null && (!top || v > (metricValue(top, metric) ?? 0))) top = l;
    }
    return top;
  }, [history, metric]);

  async function save(done: boolean) {
    if (!user) return;
    setSaving(true);
    setError(null);
    try {
      await setExerciseDone(user.uid, {
        date,
        exerciseId,
        workoutId,
        done,
        performed: done ? value : undefined,
      });
      if (!done) {
        setValue(initialValues(targets, undefined));
        return;
      }
      if (!logged) void celebrate();
      onLogged?.();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Couldn’t save.");
    } finally {
      setSaving(false);
    }
  }

  const dayLabel = relativeDayLabel(date);

  return (
    <div className="space-y-4">
      <section className="rounded-2xl bg-card p-3 ring-1 ring-border/80">
        <div className="flex items-center justify-between gap-2 px-1">
          <h3 className="text-[13px] font-semibold">
            {dayLabel === "Today" ? "Today’s log" : `Log · ${dayLabel}`}
          </h3>
          {logged ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-primary/15 px-2 py-0.5 text-[11px] font-semibold text-primary">
              <Check className="size-3" aria-hidden />
              Logged
            </span>
          ) : null}
        </div>

        {disabled ? (
          <p className="mt-2 px-1 text-[13px] text-muted-foreground">
            You can log this once the day arrives.
          </p>
        ) : (
          <div className="mt-2.5 space-y-2">
            {cardio ? (
              <CardioSteppers
                value={value}
                onChange={(next) => setValue((v) => ({ ...v, ...next }))}
                metrics={cardioMetrics(exerciseId)}
              />
            ) : (
              <>
                <Stepper
                  label="Weight lifted"
                  value={value.weightKg}
                  onChange={(n) => setValue((v) => ({ ...v, weightKg: n }))}
                  step={1}
                  min={weightKg.min}
                  max={weightKg.max}
                  suffix="kg"
                  nullable
                  placeholder="None (bodyweight)"
                  decimal
                />
                <div className="grid grid-cols-2 gap-2">
                  <Stepper
                    label="Sets"
                    value={value.sets}
                    onChange={(n) => n !== null && setValue((v) => ({ ...v, sets: n }))}
                    step={1}
                    min={sets.min}
                    max={sets.max}
                  />
                  <Stepper
                    label="Reps"
                    value={value.reps}
                    onChange={(n) => n !== null && setValue((v) => ({ ...v, reps: n }))}
                    step={1}
                    min={reps.min}
                    max={reps.max}
                  />
                </div>
              </>
            )}
            {cardio && cardioDistanceKm(value) !== null ? (
              <p className="px-1 text-[12px] text-muted-foreground tabular-nums">
                ≈ {cardioDistanceKm(value)} km
              </p>
            ) : null}

            {previous ? (
              <button
                type="button"
                onClick={() =>
                  setValue({
                    ...pickPerformed(previous),
                    sets: previous.sets ?? value.sets,
                    reps: previous.reps ?? value.reps,
                    durationMin: previous.durationMin ?? value.durationMin,
                  })
                }
                className="flex w-full items-center gap-2 rounded-xl px-1 py-1 text-left text-[12px] text-muted-foreground active:bg-muted/60"
              >
                <History className="size-3.5 shrink-0" aria-hidden />
                <span className="min-w-0 flex-1 truncate">
                  Last time ({relativeDayLabel(previous.date)}):{" "}
                  <span className="font-medium text-foreground">
                    {formatPerformed(previous)}
                  </span>
                </span>
                <span className="shrink-0 font-semibold text-primary">Use</span>
              </button>
            ) : null}

            {error ? (
              <p className="px-1 text-[12px] text-destructive" role="alert">
                {error}
              </p>
            ) : null}

            <div className="flex gap-2 pt-0.5">
              {logged ? (
                <Button
                  type="button"
                  variant="outline"
                  disabled={saving}
                  onClick={() => void save(false)}
                  className="h-10 rounded-xl"
                >
                  Undo
                </Button>
              ) : null}
              <Button
                type="button"
                disabled={saving || (logged && !dirty)}
                onClick={() => void save(true)}
                className="h-10 flex-1 rounded-xl font-semibold"
              >
                {saving
                  ? "Saving…"
                  : logged
                    ? dirty
                      ? "Update log"
                      : "Saved"
                    : "Log & mark done"}
              </Button>
            </div>
          </div>
        )}
      </section>

      <section>
        <div className="flex items-center justify-between px-1">
          <h3 className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
            History
          </h3>
          {history.length ? (
            <Link
              href={exerciseLogHref(exerciseId)}
              className="flex items-center gap-0.5 text-[12px] font-semibold text-primary"
            >
              {history.length} session{history.length === 1 ? "" : "s"} · See all
              <ChevronRight className="size-3.5" aria-hidden />
            </Link>
          ) : null}
        </div>

        {best ? (
          <div className="mt-2 flex items-center gap-2 rounded-xl bg-amber-500/10 px-3 py-2 text-[12px]">
            <Trophy className="size-4 shrink-0 text-amber-400" aria-hidden />
            <span className="text-muted-foreground">Best</span>
            <span className="font-semibold text-foreground tabular-nums">
              {metricValue(best, metric)} {metric.unit}
            </span>
            <span className="ml-auto text-muted-foreground">
              {relativeDayLabel(best.date)}
            </span>
          </div>
        ) : null}

        {loading ? (
          <p className="mt-2 px-1 text-[13px] text-muted-foreground">Loading…</p>
        ) : history.length === 0 ? (
          <p className="mt-2 px-1 text-[13px] text-muted-foreground">
            No sessions yet. Log one to start tracking your progress.
          </p>
        ) : (
          <ul className="mt-2 divide-y divide-border/60 rounded-xl bg-card ring-1 ring-border/80">
            {history.slice(0, HISTORY_ROWS).map((entry, i) => {
              const current = metricValue(entry, metric);
              const older = history
                .slice(i + 1)
                .map((l) => metricValue(l, metric))
                .find((v) => v !== null);
              const delta =
                current !== null && older != null
                  ? Math.round((current - older) * 100) / 100
                  : null;
              return (
                <li
                  key={entry.id}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 text-[13px]",
                    entry.date === date && "bg-primary/8",
                  )}
                >
                  <span className="w-24 shrink-0 text-muted-foreground">
                    {relativeDayLabel(entry.date)}
                  </span>
                  <span className="min-w-0 flex-1 truncate font-medium tabular-nums">
                    {formatPerformed(entry) ?? "Done"}
                  </span>
                  {delta !== null && delta !== 0 ? (
                    <span
                      className={cn(
                        "inline-flex shrink-0 items-center gap-0.5 text-[11px] font-semibold tabular-nums",
                        delta > 0 ? "text-primary" : "text-rose-400",
                      )}
                    >
                      {delta > 0 ? (
                        <TrendingUp className="size-3" aria-hidden />
                      ) : (
                        <TrendingDown className="size-3" aria-hidden />
                      )}
                      {delta > 0 ? "+" : ""}
                      {delta} {metric.unit}
                    </span>
                  ) : null}
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
