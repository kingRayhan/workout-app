"use client";

import {
  ChevronLeft,
  Minus,
  Scale,
  Trash2,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useMemo, useState } from "react";
import { AppHeader } from "@/components/app-header";
import { BMI_TEXT } from "@/components/bmi-gauge";
import { GoogleSignInButton } from "@/components/google-sign-in-button";
import { IconTile, SectionTitle } from "@/components/icon-tile";
import { TargetProgress } from "@/components/target-progress";
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
import { WeightSparkline } from "@/components/weight-sparkline";
import { useAllBodyWeights, useProfile } from "@/hooks/use-user-data";
import { useAuth } from "@/lib/auth";
import { bmi, bmiCategory } from "@/lib/bmi";
import { localDateKey, parseLocalDateKey } from "@/lib/dates";
import { round1 } from "@/lib/units";
import { setBodyWeight, type BodyWeightEntry } from "@/lib/user-data";
import { cn } from "@/lib/utils";

export const WEIGHT_REPORT_HREF = "/report/weight";

const PRESETS = [
  { id: "7d", label: "7D", days: 7 },
  { id: "30d", label: "30D", days: 30 },
  { id: "90d", label: "90D", days: 90 },
  { id: "1y", label: "1Y", days: 365 },
  { id: "all", label: "All", days: null },
  { id: "custom", label: "Custom", days: null },
] as const;

type RangeId = (typeof PRESETS)[number]["id"];
const DEFAULT_RANGE: RangeId = "30d";
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

type Row = BodyWeightEntry & { delta: number | null };

function shortDate(key: string, withYear = false) {
  return parseLocalDateKey(key).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    ...(withYear ? { year: "numeric" } : {}),
  });
}

function monthLabel(key: string) {
  return parseLocalDateKey(key).toLocaleDateString(undefined, {
    month: "long",
    year: "numeric",
  });
}

function daysAgo(n: number) {
  const d = new Date();
  d.setDate(d.getDate() - (n - 1));
  return localDateKey(d);
}

function signed(n: number) {
  const r = round1(n);
  return `${r > 0 ? "+" : ""}${r}`;
}

function trendIcon(delta: number) {
  return delta > 0.05 ? TrendingUp : delta < -0.05 ? TrendingDown : Minus;
}

function Stat({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="rounded-xl bg-muted/60 px-3 py-2.5">
      <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
      <p className="mt-0.5 text-[17px] font-semibold tabular-nums">{value}</p>
      {hint ? <p className="text-[11px] text-muted-foreground">{hint}</p> : null}
    </div>
  );
}

export function WeightTrendScreen() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading: authLoading } = useAuth();
  const { entries, loading: entriesLoading, error } = useAllBodyWeights();
  const { profile } = useProfile();
  const [pendingDelete, setPendingDelete] = useState<BodyWeightEntry | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const loading = authLoading || (Boolean(user) && entriesLoading);
  const today = localDateKey();

  const rawRange = searchParams.get("range");
  const range: RangeId = PRESETS.some((p) => p.id === rawRange)
    ? (rawRange as RangeId)
    : DEFAULT_RANGE;
  const rawFrom = searchParams.get("from");
  const rawTo = searchParams.get("to");
  const customFrom = rawFrom && DATE_RE.test(rawFrom) ? rawFrom : daysAgo(30);
  const customTo = rawTo && DATE_RE.test(rawTo) ? rawTo : today;

  const replaceParams = useCallback(
    (next: Record<string, string | null>) => {
      const params = new URLSearchParams(searchParams.toString());
      for (const [k, v] of Object.entries(next)) {
        if (v === null) params.delete(k);
        else params.set(k, v);
      }
      if (params.get("range") === DEFAULT_RANGE) params.delete("range");
      const qs = params.toString();
      router.replace(qs ? `${WEIGHT_REPORT_HREF}?${qs}` : WEIGHT_REPORT_HREF, {
        scroll: false,
      });
    },
    [router, searchParams],
  );

  const { from, to, rangeLabel } = useMemo(() => {
    if (range === "custom") {
      const [a, b] = customFrom <= customTo ? [customFrom, customTo] : [customTo, customFrom];
      return { from: a, to: b, rangeLabel: `${shortDate(a, true)} – ${shortDate(b, true)}` };
    }
    if (range === "all") {
      return { from: entries[0]?.date ?? today, to: today, rangeLabel: "All time" };
    }
    const preset = PRESETS.find((p) => p.id === range)!;
    const days = preset.days!;
    return {
      from: daysAgo(days),
      to: today,
      rangeLabel: days === 365 ? "Last 12 months" : `Last ${days} days`,
    };
  }, [range, customFrom, customTo, entries, today]);

  const inRange = useMemo(
    () => entries.filter((e) => e.date >= from && e.date <= to),
    [entries, from, to],
  );

  const months = useMemo(() => {
    const rows: Row[] = inRange.map((e) => {
      const idx = entries.indexOf(e);
      return { ...e, delta: idx > 0 ? e.kg - entries[idx - 1]!.kg : null };
    });
    const groups: { key: string; label: string; rows: Row[] }[] = [];
    for (const row of rows.reverse()) {
      const key = row.date.slice(0, 7);
      const last = groups[groups.length - 1];
      if (last?.key === key) last.rows.push(row);
      else groups.push({ key, label: monthLabel(row.date), rows: [row] });
    }
    return groups;
  }, [entries, inRange]);

  const latest = entries[entries.length - 1] ?? null;
  const beforeLatest = entries[entries.length - 2] ?? null;
  const latestDelta = latest && beforeLatest ? latest.kg - beforeLatest.kg : null;
  const latestBmi = latest && profile.heightCm ? bmi(latest.kg, profile.heightCm) : null;
  const category = latestBmi !== null ? bmiCategory(latestBmi) : null;

  const rangeFirst = inRange[0];
  const rangeLast = inRange[inRange.length - 1];
  const rangeChange =
    rangeFirst && rangeLast && inRange.length > 1 ? rangeLast.kg - rangeFirst.kg : null;
  const avg = inRange.length
    ? inRange.reduce((s, e) => s + e.kg, 0) / inRange.length
    : null;
  const low = inRange.length ? inRange.reduce((a, b) => (b.kg < a.kg ? b : a)) : null;
  const high = inRange.length ? inRange.reduce((a, b) => (b.kg > a.kg ? b : a)) : null;

  async function confirmDelete() {
    if (!user || !pendingDelete) return;
    setDeleteError(null);
    try {
      await setBodyWeight(user.uid, pendingDelete.date, null);
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : "Couldn’t delete entry.");
    } finally {
      setPendingDelete(null);
    }
  }

  const LatestTrend = latestDelta !== null ? trendIcon(latestDelta) : null;

  return (
    <div className="flex flex-col pb-6">
      <AppHeader
        title="Weight trend"
        subtitle={rangeLabel}
        action={
          <Link
            href="/"
            className="-mr-1 mt-4 flex items-center gap-0.5 rounded-lg px-1.5 py-1 text-[13px] font-semibold text-primary"
          >
            <ChevronLeft className="size-4" aria-hidden />
            Today
          </Link>
        }
      />

      <div className="flex flex-col gap-3 px-4 pt-1">
        {!authLoading && !user ? (
          <section className="rounded-2xl bg-card px-4 py-4 ring-1 ring-border/80">
            <p className="text-[13px] text-muted-foreground">
              Sign in to see your weight trend.
            </p>
            <div className="mt-3">
              <GoogleSignInButton />
            </div>
          </section>
        ) : null}

        {error || deleteError ? (
          <p className="rounded-xl bg-destructive/10 px-3 py-2 text-[13px] text-destructive" role="alert">
            {deleteError ?? error}
          </p>
        ) : null}

        {user ? (
          <div className="flex flex-col gap-2">
            <div
              role="radiogroup"
              aria-label="Date range"
              className="grid grid-cols-6 gap-1 rounded-xl bg-muted p-1"
            >
              {PRESETS.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  role="radio"
                  aria-checked={range === p.id}
                  onClick={() =>
                    replaceParams(
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
                    onChange={(e) =>
                      e.target.value && replaceParams({ from: e.target.value })
                    }
                    className="mt-1 h-10 rounded-xl text-[14px]"
                  />
                </label>
                <label className="text-[11px] font-medium text-muted-foreground">
                  To
                  <Input
                    type="date"
                    value={customTo}
                    max={today}
                    onChange={(e) =>
                      e.target.value && replaceParams({ to: e.target.value })
                    }
                    className="mt-1 h-10 rounded-xl text-[14px]"
                  />
                </label>
              </div>
            ) : null}
          </div>
        ) : null}

        {loading ? (
          <>
            <Skeleton className="h-64 w-full rounded-2xl" />
            <div className="grid grid-cols-2 gap-2">
              {Array.from({ length: 4 }, (_, i) => (
                <Skeleton key={i} className="h-[68px] rounded-xl" />
              ))}
            </div>
          </>
        ) : null}

        {user && !loading && !latest ? (
          <section className="rounded-2xl bg-muted px-4 py-8 text-center">
            <IconTile icon={Scale} tone="amber" className="mx-auto mb-3 size-12 rounded-2xl" />
            <p className="text-[17px] font-semibold tracking-tight">No weigh-ins yet</p>
            <p className="mx-auto mt-1.5 max-w-[16rem] text-[13px] leading-snug text-muted-foreground">
              Log your weight from the Body weight card on Today.
            </p>
          </section>
        ) : null}

        {user && !loading && latest ? (
          <section className="rounded-2xl bg-card px-4 py-3.5 ring-1 ring-border/80">
            <SectionTitle icon={Scale} tone="amber">
              Body weight
            </SectionTitle>
            <div className="mt-1.5 flex items-end justify-between gap-3">
              <div>
                <p className="text-[26px] font-semibold leading-none tracking-tight tabular-nums">
                  {latest.kg}
                  <span className="ml-1 text-[14px] font-medium text-muted-foreground">kg</span>
                </p>
                <p className="mt-1 flex items-center gap-1 text-[12px] text-muted-foreground">
                  {LatestTrend ? <LatestTrend className="size-3.5" aria-hidden /> : null}
                  {latestDelta !== null && beforeLatest
                    ? `${signed(latestDelta)} kg since ${shortDate(beforeLatest.date)}`
                    : latest.date === today
                      ? "Logged today"
                      : `Last logged ${shortDate(latest.date)}`}
                </p>
              </div>
              {latestBmi !== null && category ? (
                <div className="text-right">
                  <p className="text-[11px] text-muted-foreground">BMI</p>
                  <p className="text-[15px] font-semibold tabular-nums">{latestBmi}</p>
                  <p className={cn("text-[11px] font-medium", BMI_TEXT[category.id])}>
                    {category.label}
                  </p>
                </div>
              ) : null}
            </div>

            <div className="mt-3">
              <WeightSparkline
                entries={entries}
                startDate={from}
                endDate={to}
                targetKg={profile.targetKg}
                label={rangeLabel}
                showAxis
                className="h-44"
              />
            </div>

            <TargetProgress
              className="mt-3"
              targetKg={profile.targetKg}
              currentKg={latest.kg}
              startKg={entries[0]?.kg ?? null}
            />
          </section>
        ) : null}

        {user && !loading && latest ? (
          <div className="grid grid-cols-2 gap-2">
            <Stat
              label="Change"
              value={rangeChange !== null ? `${signed(rangeChange)} kg` : "—"}
              hint={rangeFirst ? `Since ${shortDate(rangeFirst.date)}` : "No logs in range"}
            />
            <Stat
              label="Average"
              value={avg !== null ? `${round1(avg)} kg` : "—"}
              hint={`${inRange.length} ${inRange.length === 1 ? "log" : "logs"}`}
            />
            <Stat
              label="Lowest"
              value={low ? `${low.kg} kg` : "—"}
              hint={low ? shortDate(low.date) : undefined}
            />
            <Stat
              label="Highest"
              value={high ? `${high.kg} kg` : "—"}
              hint={high ? shortDate(high.date) : undefined}
            />
          </div>
        ) : null}

        {user && !loading && latest && inRange.length === 0 ? (
          <p className="rounded-2xl bg-muted px-4 py-6 text-center text-[13px] text-muted-foreground">
            No weigh-ins between {shortDate(from, true)} and {shortDate(to, true)}.
          </p>
        ) : null}

        {user && !loading && months.length ? (
          <h2 className="mt-1 px-1 text-[13px] font-semibold">Weight log</h2>
        ) : null}

        {user && !loading
          ? months.map((month) => (
              <section
                key={month.key}
                className="overflow-hidden rounded-2xl bg-card ring-1 ring-border/80"
              >
                <div className="flex items-center justify-between border-b border-border/80 bg-muted/40 px-4 py-2">
                  <h3 className="text-[12px] font-semibold uppercase tracking-wider text-muted-foreground">
                    {month.label}
                  </h3>
                  <span className="text-[11px] text-muted-foreground tabular-nums">
                    {month.rows.length} {month.rows.length === 1 ? "log" : "logs"}
                  </span>
                </div>
                <ul className="divide-y divide-border/60">
                  {month.rows.map((row) => {
                    const d = parseLocalDateKey(row.date);
                    const rowBmi = profile.heightCm ? bmi(row.kg, profile.heightCm) : null;
                    const cat = rowBmi !== null ? bmiCategory(rowBmi) : null;
                    const TrendIcon = row.delta !== null ? trendIcon(row.delta) : null;
                    return (
                      <li key={row.date} className="flex items-center gap-3 py-2.5 pl-4 pr-2">
                        <div
                          className={cn(
                            "flex w-10 shrink-0 flex-col items-center rounded-lg py-1",
                            row.date === today ? "bg-primary/15 text-primary" : "bg-muted text-foreground",
                          )}
                        >
                          <span className="text-[15px] font-semibold leading-none tabular-nums">
                            {d.getDate()}
                          </span>
                          <span className="mt-0.5 text-[10px] font-medium uppercase opacity-70">
                            {d.toLocaleDateString(undefined, { weekday: "short" })}
                          </span>
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-[15px] font-semibold tabular-nums">
                            {row.kg}
                            <span className="ml-0.5 text-[12px] font-medium text-muted-foreground">kg</span>
                          </p>
                          {TrendIcon && row.delta !== null ? (
                            <p className="flex items-center gap-1 text-[11px] text-muted-foreground tabular-nums">
                              <TrendIcon className="size-3" aria-hidden />
                              {signed(row.delta)} kg
                            </p>
                          ) : (
                            <p className="text-[11px] text-muted-foreground">First log</p>
                          )}
                        </div>
                        {rowBmi !== null && cat ? (
                          <div className="text-right">
                            <p className={cn("text-[13px] font-semibold tabular-nums", BMI_TEXT[cat.id])}>
                              {rowBmi}
                            </p>
                            <p className="text-[10px] text-muted-foreground">BMI</p>
                          </div>
                        ) : null}
                        <button
                          type="button"
                          aria-label={`Delete ${row.kg} kg on ${row.date}`}
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
            ))
          : null}
      </div>

      <AlertDialog
        open={pendingDelete !== null}
        onOpenChange={(open) => {
          if (!open) setPendingDelete(null);
        }}
      >
        <AlertDialogContent className="max-w-[calc(100%-2rem)] rounded-2xl sm:max-w-sm">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this weigh-in?</AlertDialogTitle>
            <AlertDialogDescription>
              {pendingDelete
                ? `${pendingDelete.kg} kg on ${shortDate(pendingDelete.date, true)} will be removed.`
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
    </div>
  );
}
