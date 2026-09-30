"use client";

import {
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Dumbbell,
  Search,
  Trash2,
  TrendingDown,
  TrendingUp,
  Trophy,
} from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { AppHeader } from "@/components/app-header";
import { ExerciseDrawer } from "@/components/exercise-drawer";
import { ExerciseWeightChart } from "@/components/exercise-weight-chart";
import { GoogleSignInButton } from "@/components/google-sign-in-button";
import { IconImage, IconTile, MUSCLE_STYLE } from "@/components/icon-tile";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { TagFilterBar } from "@/components/workout-catalog";
import type { MuscleGroup } from "@workoutland/data/plan";
import { useAllExerciseLogs } from "@/hooks/use-user-data";
import { useAuth } from "@/lib/auth";
import {
  catalogExerciseName,
  formatCardio,
  getCatalogExercise,
  isCardioExercise,
  isMuscleTag,
  metricValue,
  progressMetric,
} from "@workoutland/data/catalog";
import { localDateKey, parseLocalDateKey, relativeDayLabel } from "@/lib/dates";
import { EXERCISE_LOG_HREF } from "@/lib/routes";
import {
  formatPerformed,
  setExerciseDone,
  type ExerciseLog,
} from "@/lib/user-data";
import { cn } from "@/lib/utils";

const RANGE_PRESETS = [
  { id: "7d", label: "7D", days: 7 },
  { id: "30d", label: "30D", days: 30 },
  { id: "90d", label: "90D", days: 90 },
  { id: "1y", label: "1Y", days: 365 },
  { id: "all", label: "All", days: null },
  { id: "custom", label: "Custom", days: null },
] as const;

type RangeId = (typeof RANGE_PRESETS)[number]["id"];
const DEFAULT_RANGE: RangeId = "all";
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

function daysAgo(n: number) {
  const d = new Date();
  d.setDate(d.getDate() - (n - 1));
  return localDateKey(d);
}

function shortDate(key: string) {
  return parseLocalDateKey(key).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

type Summary = {
  exerciseId: string;
  sessions: number;
  last: ExerciseLog;
  best: ExerciseLog | null;
};

function summarize(logs: ExerciseLog[]): Summary[] {
  const byId = new Map<string, ExerciseLog[]>();
  for (const log of logs) {
    const list = byId.get(log.exerciseId);
    if (list) list.push(log);
    else byId.set(log.exerciseId, [log]);
  }
  const rows: Summary[] = [];
  for (const [exerciseId, list] of byId) {
    if (!getCatalogExercise(exerciseId)) continue;
    const metric = progressMetric(exerciseId);
    let best: ExerciseLog | null = null;
    for (const l of list) {
      const v = metricValue(l, metric);
      if (v !== null && (!best || v > metricValue(best, metric)!)) best = l;
    }
    rows.push({ exerciseId, sessions: list.length, last: list[list.length - 1]!, best });
  }
  return rows.sort((a, b) => b.last.date.localeCompare(a.last.date));
}

function monthLabel(key: string) {
  return parseLocalDateKey(key).toLocaleDateString(undefined, {
    month: "long",
    year: "numeric",
  });
}

function signed(n: number, unit: string) {
  const r = Math.round(n * 100) / 100;
  return `${r > 0 ? "+" : ""}${r} ${unit}`;
}

function Stat({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="rounded-xl bg-muted/60 px-3 py-2.5">
      <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
      <p className="mt-0.5 truncate text-[17px] font-semibold tabular-nums">{value}</p>
      {hint ? (
        <p className="truncate text-[11px] text-muted-foreground">{hint}</p>
      ) : null}
    </div>
  );
}

function BackLink({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="-mr-1 mt-4 flex items-center gap-0.5 rounded-lg px-1.5 py-1 text-[13px] font-semibold text-primary"
    >
      <ChevronLeft className="size-4" aria-hidden />
      {label}
    </Link>
  );
}

function matchesQuery(exerciseId: string, query: string) {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  const exercise = getCatalogExercise(exerciseId);
  if (!exercise) return false;
  return [exercise.name, exercise.focus, ...exercise.muscles]
    .join(" ")
    .toLowerCase()
    .includes(q);
}

function Overview({
  logs,
  hasAnyLogs,
  query,
  muscle,
  rangeLabel,
  onMuscleChange,
  detailHref,
}: {
  /** Logs inside the selected date range, oldest first. */
  logs: ExerciseLog[];
  hasAnyLogs: boolean;
  query: string;
  muscle: MuscleGroup | null;
  rangeLabel: string;
  onMuscleChange: (muscle: MuscleGroup | null) => void;
  detailHref: (exerciseId: string) => string;
}) {
  const summaries = useMemo(() => summarize(logs), [logs]);
  const visible = summaries.filter(
    (s) =>
      (!muscle || getCatalogExercise(s.exerciseId)?.muscles.includes(muscle)) &&
      matchesQuery(s.exerciseId, query),
  );
  const daysTrained = useMemo(() => new Set(logs.map((l) => l.date)).size, [logs]);
  const lastDate = logs[logs.length - 1]?.date;

  if (!hasAnyLogs) {
    return (
      <section className="rounded-2xl bg-muted px-4 py-8 text-center">
        <IconTile icon={Dumbbell} tone="lime" className="mx-auto mb-3" />
        <p className="text-[15px] font-semibold">No exercises logged yet</p>
        <p className="mx-auto mt-1 max-w-[260px] text-[13px] text-muted-foreground">
          Tick exercises off on Today, or tap one to log the weight you lifted.
        </p>
        <Link
          href="/"
          className="mt-4 inline-flex h-10 items-center rounded-xl bg-primary px-4 text-[13px] font-semibold text-primary-foreground"
        >
          Go to Today
        </Link>
      </section>
    );
  }

  return (
    <>
      <div className="grid grid-cols-3 gap-2">
        <Stat label="Days" value={String(daysTrained)} hint="trained" />
        <Stat label="Exercises" value={String(summaries.length)} hint="logged" />
        <Stat
          label="Last"
          value={lastDate ? relativeDayLabel(lastDate) : "—"}
          hint="session"
        />
      </div>

      <TagFilterBar value={muscle} onChange={onMuscleChange} />

      {visible.length === 0 ? (
        <p className="rounded-2xl bg-muted px-4 py-6 text-center text-[13px] text-muted-foreground">
          {summaries.length === 0
            ? `No sessions logged in ${rangeLabel.toLowerCase()}.`
            : query.trim()
              ? `No logged exercises match “${query.trim()}”.`
              : "Nothing logged for this muscle in this range."}
        </p>
      ) : (
        <ul className="divide-y divide-border/60 overflow-hidden rounded-2xl bg-card ring-1 ring-border/80">
          {visible.map((s) => {
            const exercise = getCatalogExercise(s.exerciseId)!;
            const primary = MUSCLE_STYLE[exercise.muscles[0]!];
            const lastLine = formatPerformed(s.last);
            return (
              <li key={s.exerciseId}>
                <Link
                  href={detailHref(s.exerciseId)}
                  className="flex min-h-16 items-center gap-3 py-2.5 pl-4 pr-2 active:bg-muted/60"
                >
                  <IconTile icon={primary.icon} tone={primary.tone} />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[15px] font-medium leading-snug">
                      {exercise.name}
                    </span>
                    <span className="mt-0.5 block truncate text-[12px] text-muted-foreground tabular-nums">
                      {relativeDayLabel(s.last.date)}
                      {lastLine ? ` · ${lastLine}` : ""}
                    </span>
                  </span>
                  <span className="shrink-0 text-right">
                    {s.best ? (
                      <span className="flex items-center justify-end gap-1 text-[14px] font-semibold tabular-nums">
                        <Trophy className="size-3.5 text-amber-400" aria-hidden />
                        {metricValue(s.best, progressMetric(s.exerciseId))}{" "}
                        {progressMetric(s.exerciseId).unit}
                      </span>
                    ) : null}
                    <span className="block text-[11px] text-muted-foreground">
                      {s.sessions} session{s.sessions === 1 ? "" : "s"}
                    </span>
                  </span>
                  <ChevronRight className="size-4 shrink-0 text-muted-foreground" aria-hidden />
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}

function ExerciseHistory({
  exerciseId,
  logs,
  hasLogsOutsideRange,
  rangeLabel,
}: {
  exerciseId: string;
  /** Logs for this exercise inside the date range, oldest first. */
  logs: ExerciseLog[];
  hasLogsOutsideRange: boolean;
  rangeLabel: string;
}) {
  const { user } = useAuth();
  const [pendingDelete, setPendingDelete] = useState<ExerciseLog | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const metric = progressMetric(exerciseId);
  const cardio = isCardioExercise(exerciseId);
  const value = (l: ExerciseLog) => metricValue(l, metric);
  const measured = logs.filter((l) => value(l) !== null);
  const last = logs[logs.length - 1] ?? null;
  const lastValue = last ? value(last) : null;
  const best = measured.reduce<ExerciseLog | null>(
    (top, l) => (!top || value(l)! > value(top)! ? l : top),
    null,
  );
  const change =
    measured.length > 1
      ? value(measured[measured.length - 1]!)! - value(measured[0]!)!
      : null;

  const months = useMemo(() => {
    const groups: { key: string; label: string; rows: ExerciseLog[] }[] = [];
    for (const row of [...logs].reverse()) {
      const key = row.date.slice(0, 7);
      const group = groups[groups.length - 1];
      if (group?.key === key) group.rows.push(row);
      else groups.push({ key, label: monthLabel(row.date), rows: [row] });
    }
    return groups;
  }, [logs]);

  async function confirmDelete() {
    if (!user || !pendingDelete) return;
    setDeleteError(null);
    try {
      await setExerciseDone(user.uid, {
        date: pendingDelete.date,
        exerciseId,
        workoutId: pendingDelete.workoutId,
        done: false,
      });
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : "Couldn’t delete log.");
    } finally {
      setPendingDelete(null);
    }
  }

  if (logs.length === 0) {
    return (
      <p className="rounded-2xl bg-muted px-4 py-8 text-center text-[13px] text-muted-foreground">
        {hasLogsOutsideRange
          ? `No ${catalogExerciseName(exerciseId)} sessions in ${rangeLabel.toLowerCase()}. Pick a wider range.`
          : `No sessions logged for ${catalogExerciseName(exerciseId)} yet. Log it from Today.`}
      </p>
    );
  }

  return (
    <>
      <div className="grid grid-cols-3 gap-2">
        <Stat
          label="Last"
          value={lastValue !== null ? `${lastValue} ${metric.unit}` : "—"}
          hint={last ? relativeDayLabel(last.date) : undefined}
        />
        <Stat
          label={cardio ? "Longest" : "Best"}
          value={best ? `${value(best)} ${metric.unit}` : "—"}
          hint={best ? relativeDayLabel(best.date) : `${metric.empty} yet`}
        />
        <Stat
          label="Change"
          value={change !== null ? signed(change, metric.unit) : "—"}
          hint={`${logs.length} session${logs.length === 1 ? "" : "s"}`}
        />
      </div>

      <section className="rounded-2xl bg-card p-3 ring-1 ring-border/80">
        <h2 className="mb-2 px-1 text-[13px] font-semibold">{metric.label}</h2>
        <ExerciseWeightChart logs={logs} metric={metric} />
      </section>

      {deleteError ? (
        <p className="rounded-xl bg-destructive/10 px-3 py-2 text-[13px] text-destructive" role="alert">
          {deleteError}
        </p>
      ) : null}

      <h2 className="mt-1 px-1 text-[13px] font-semibold">Sessions</h2>
      {months.map((month) => (
        <section
          key={month.key}
          className="overflow-hidden rounded-2xl bg-card ring-1 ring-border/80"
        >
          <div className="flex items-center justify-between border-b border-border/80 bg-muted/40 px-4 py-2">
            <h3 className="text-[12px] font-semibold uppercase tracking-wider text-muted-foreground">
              {month.label}
            </h3>
            <span className="text-[11px] text-muted-foreground tabular-nums">
              {month.rows.length} {month.rows.length === 1 ? "session" : "sessions"}
            </span>
          </div>
          <ul className="divide-y divide-border/60">
            {month.rows.map((row) => {
              const d = parseLocalDateKey(row.date);
              const idx = logs.indexOf(row);
              const current = value(row);
              const older = logs
                .slice(0, idx)
                .reverse()
                .find((l) => value(l) !== null);
              const delta =
                current !== null && older ? current - value(older)! : null;
              const isBest = best !== null && row.id === best.id;
              return (
                <li key={row.id} className="flex items-center gap-3 py-2.5 pl-4 pr-2">
                  <div className="flex w-10 shrink-0 flex-col items-center rounded-lg bg-muted py-1">
                    <span className="text-[15px] font-semibold leading-none tabular-nums">
                      {d.getDate()}
                    </span>
                    <span className="mt-0.5 text-[10px] font-medium uppercase opacity-70">
                      {d.toLocaleDateString(undefined, { weekday: "short" })}
                    </span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="flex items-center gap-1.5 text-[15px] font-semibold tabular-nums">
                      {current !== null ? (
                        <>
                          {current}
                          <span className="-ml-1 text-[12px] font-medium text-muted-foreground">
                            {metric.unit}
                          </span>
                        </>
                      ) : (
                        <span className="text-muted-foreground">{metric.empty}</span>
                      )}
                      {isBest ? (
                        <Trophy className="size-3.5 text-amber-400" aria-label="Best" />
                      ) : null}
                    </p>
                    <p className="text-[11px] text-muted-foreground tabular-nums">
                      {cardio
                        ? formatCardio(row, { withDuration: false, withDistance: true }) ||
                          "Checked off"
                        : row.sets !== null && row.reps !== null
                          ? `${row.sets} × ${row.reps}`
                          : "Checked off"}
                    </p>
                  </div>
                  {delta !== null && delta !== 0 ? (
                    <span
                      className={cn(
                        "inline-flex shrink-0 items-center gap-0.5 text-[12px] font-semibold tabular-nums",
                        delta > 0 ? "text-primary" : "text-rose-400",
                      )}
                    >
                      {delta > 0 ? (
                        <TrendingUp className="size-3.5" aria-hidden />
                      ) : (
                        <TrendingDown className="size-3.5" aria-hidden />
                      )}
                      {signed(delta, metric.unit)}
                    </span>
                  ) : null}
                  <button
                    type="button"
                    aria-label={`Delete log on ${row.date}`}
                    onClick={() => setPendingDelete(row)}
                    className="grid size-9 shrink-0 place-items-center rounded-lg text-muted-foreground active:bg-muted active:text-destructive"
                  >
                    <Trash2 className="size-4" aria-hidden />
                  </button>
                </li>
              );
            })}
          </ul>
        </section>
      ))}

      <AlertDialog
        open={pendingDelete !== null}
        onOpenChange={(open) => {
          if (!open) setPendingDelete(null);
        }}
      >
        <AlertDialogContent className="max-w-[calc(100%-2rem)] rounded-2xl sm:max-w-sm">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this session?</AlertDialogTitle>
            <AlertDialogDescription>
              {pendingDelete
                ? `${catalogExerciseName(exerciseId)} on ${relativeDayLabel(pendingDelete.date)}${
                    formatPerformed(pendingDelete)
                      ? ` (${formatPerformed(pendingDelete)})`
                      : ""
                  } will be removed and unticked on that day.`
                : null}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction variant="destructive" onClick={() => void confirmDelete()}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

function LogFilters({
  showSearch,
  query,
  onQueryChange,
  range,
  customFrom,
  customTo,
  today,
  onParams,
}: {
  showSearch: boolean;
  query: string;
  onQueryChange: (q: string) => void;
  range: RangeId;
  customFrom: string;
  customTo: string;
  today: string;
  onParams: (next: Record<string, string | null>) => void;
}) {
  return (
    <div className="sticky top-[calc(env(safe-area-inset-top)+3.75rem)] z-10 -mx-4 space-y-2 bg-background/95 px-4 pb-2 backdrop-blur-md">
      {showSearch ? (
        <div className="relative">
          <IconImage
            icon={Search}
            className="pointer-events-none absolute left-2.5 top-1/2 size-5 -translate-y-1/2"
          />
          <Input
            type="search"
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            placeholder="Search logged exercises"
            aria-label="Search logged exercises"
            className="h-10 rounded-xl bg-muted/80 pl-9 pr-3 text-[15px] dark:bg-muted/80"
            autoCapitalize="off"
            autoCorrect="off"
            enterKeyHint="search"
          />
        </div>
      ) : null}
      <div
        role="radiogroup"
        aria-label="Date range"
        className="grid grid-cols-6 gap-1 rounded-xl bg-muted p-1"
      >
        {RANGE_PRESETS.map((p) => (
          <button
            key={p.id}
            type="button"
            role="radio"
            aria-checked={range === p.id}
            onClick={() =>
              onParams(
                p.id === "custom"
                  ? { range: p.id, from: customFrom, to: customTo }
                  : { range: p.id, from: null, to: null },
              )
            }
            className={cn(
              "rounded-lg py-1.5 text-[12px] font-semibold transition-colors",
              range === p.id
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground",
            )}
          >
            {p.label}
          </button>
        ))}
      </div>
      {range === "custom" ? (
        <div className="grid grid-cols-2 gap-2">
          <label className="text-[11px] font-medium text-muted-foreground">
            From
            <Input
              type="date"
              value={customFrom}
              max={today}
              onChange={(e) => e.target.value && onParams({ from: e.target.value })}
              className="mt-1 h-10 rounded-xl text-[14px]"
            />
          </label>
          <label className="text-[11px] font-medium text-muted-foreground">
            To
            <Input
              type="date"
              value={customTo}
              max={today}
              onChange={(e) => e.target.value && onParams({ to: e.target.value })}
              className="mt-1 h-10 rounded-xl text-[14px]"
            />
          </label>
        </div>
      ) : null}
    </div>
  );
}

export function ExerciseLogScreen() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading: authLoading } = useAuth();
  const { logs, loading: logsLoading, error } = useAllExerciseLogs();
  const [guideOpen, setGuideOpen] = useState(false);
  const today = localDateKey();

  const rawId = searchParams.get("exercise");
  const exercise = rawId ? getCatalogExercise(rawId) ?? null : null;
  const loading = authLoading || (Boolean(user) && logsLoading);

  const rawMuscle = searchParams.get("muscle");
  const muscle = isMuscleTag(rawMuscle) ? rawMuscle : null;
  const urlQuery = searchParams.get("q") ?? "";
  // Local draft so typing never waits on the URL round-trip.
  const [query, setQuery] = useState(urlQuery);
  const [prevUrlQuery, setPrevUrlQuery] = useState(urlQuery);
  if (urlQuery !== prevUrlQuery) {
    setPrevUrlQuery(urlQuery);
    setQuery(urlQuery);
  }

  const rawRange = searchParams.get("range");
  const range: RangeId = RANGE_PRESETS.some((p) => p.id === rawRange)
    ? (rawRange as RangeId)
    : DEFAULT_RANGE;
  const rawFrom = searchParams.get("from");
  const rawTo = searchParams.get("to");
  const customFrom = rawFrom && DATE_RE.test(rawFrom) ? rawFrom : daysAgo(30);
  const customTo = rawTo && DATE_RE.test(rawTo) ? rawTo : today;

  const { from, to, rangeLabel } = useMemo(() => {
    if (range === "custom") {
      const [a, b] =
        customFrom <= customTo ? [customFrom, customTo] : [customTo, customFrom];
      return { from: a, to: b, rangeLabel: `${shortDate(a)} – ${shortDate(b)}` };
    }
    const preset = RANGE_PRESETS.find((p) => p.id === range)!;
    if (preset.days === null) {
      return { from: "0000-01-01", to: "9999-12-31", rangeLabel: "All time" };
    }
    return {
      from: daysAgo(preset.days),
      to: today,
      rangeLabel: preset.days === 365 ? "Last 12 months" : `Last ${preset.days} days`,
    };
  }, [range, customFrom, customTo, today]);

  const inRange = useMemo(
    () => logs.filter((l) => l.date >= from && l.date <= to),
    [logs, from, to],
  );
  const exerciseLogs = useMemo(
    () => (exercise ? inRange.filter((l) => l.exerciseId === exercise.id) : []),
    [inRange, exercise],
  );
  const exerciseHasAnyLogs = exercise
    ? logs.some((l) => l.exerciseId === exercise.id)
    : false;

  function hrefWith(next: Record<string, string | null>) {
    const params = new URLSearchParams(searchParams.toString());
    for (const [k, v] of Object.entries(next)) {
      if (v === null || v === "") params.delete(k);
      else params.set(k, v);
    }
    if (params.get("range") === DEFAULT_RANGE) params.delete("range");
    const qs = params.toString();
    return qs ? `${EXERCISE_LOG_HREF}?${qs}` : EXERCISE_LOG_HREF;
  }

  function replaceParams(next: Record<string, string | null>) {
    router.replace(hrefWith(next), { scroll: false });
  }

  return (
    <div className="flex flex-col pb-6">
      <AppHeader
        title={exercise ? exercise.name : "Exercise log"}
        subtitle={
          loading || !user
            ? exercise?.focus ?? "Weights and sessions"
            : exercise
              ? `${exercise.focus} · ${rangeLabel}`
              : `${rangeLabel} · ${inRange.length} log${inRange.length === 1 ? "" : "s"}`
        }
        action={
          exercise ? (
            <BackLink href={hrefWith({ exercise: null })} label="All" />
          ) : (
            <BackLink href="/you" label="You" />
          )
        }
      />

      <div className="flex flex-col gap-3 px-4 pt-1">
        {!authLoading && !user ? (
          <section className="rounded-2xl bg-card px-4 py-4 ring-1 ring-border/80">
            <p className="text-[13px] text-muted-foreground">
              Sign in to see your exercise log.
            </p>
            <div className="mt-3">
              <GoogleSignInButton />
            </div>
          </section>
        ) : null}

        {error ? (
          <p className="rounded-xl bg-destructive/10 px-3 py-2 text-[13px] text-destructive" role="alert">
            {error}
          </p>
        ) : null}

        {user && (loading || logs.length > 0) ? (
          <LogFilters
            showSearch={!exercise}
            query={query}
            onQueryChange={(q) => {
              setQuery(q);
              replaceParams({ q: q.trim() || null });
            }}
            range={range}
            customFrom={customFrom}
            customTo={customTo}
            today={today}
            onParams={replaceParams}
          />
        ) : null}

        {loading ? (
          <div className="space-y-3">
            <div className="grid grid-cols-3 gap-2">
              <Skeleton className="h-[68px] rounded-xl" />
              <Skeleton className="h-[68px] rounded-xl" />
              <Skeleton className="h-[68px] rounded-xl" />
            </div>
            <Skeleton className="h-64 w-full rounded-2xl" />
          </div>
        ) : user && exercise ? (
          <>
            <ExerciseHistory
              exerciseId={exercise.id}
              logs={exerciseLogs}
              hasLogsOutsideRange={exerciseHasAnyLogs}
              rangeLabel={rangeLabel}
            />
            <button
              type="button"
              onClick={() => setGuideOpen(true)}
              className="flex items-center gap-3 rounded-2xl bg-card px-4 py-3 text-left ring-1 ring-border/80 active:bg-muted/60"
            >
              <IconTile icon={BookOpen} tone="violet" />
              <span className="min-w-0 flex-1 text-[14px] font-medium">
                How to do {exercise.name}
              </span>
              <ChevronRight className="size-4 text-muted-foreground" aria-hidden />
            </button>
          </>
        ) : user ? (
          <Overview
            logs={inRange}
            hasAnyLogs={logs.length > 0}
            query={query}
            muscle={muscle}
            rangeLabel={rangeLabel}
            onMuscleChange={(m) => replaceParams({ muscle: m })}
            detailHref={(id) => hrefWith({ exercise: id })}
          />
        ) : null}
      </div>

      <ExerciseDrawer
        exercise={guideOpen ? exercise : null}
        open={guideOpen && exercise !== null}
        onOpenChange={setGuideOpen}
      />
    </div>
  );
}
