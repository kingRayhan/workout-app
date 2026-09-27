"use client";

import { useMemo, useState } from "react";
import { ActivityHeatmapGrid } from "@/components/activity-heatmap";
import { ActivityHeatmapSkeleton } from "@/components/skeletons";
import { WeightReport } from "@/components/weight-report";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { useActivity } from "@/hooks/use-user-data";
import { useAuth } from "@/lib/auth";
import {
  formatRangeLabel,
  localDateKey,
  parseLocalDateKey,
  RANGE_PRESETS,
  resolveRangePreset,
  type RangePreset,
} from "@/lib/dates";
import { cn } from "@/lib/utils";

function StatTile({
  label,
  value,
  hint,
}: {
  label: string;
  value: string | number;
  hint?: string;
}) {
  return (
    <div className="rounded-xl bg-muted/60 px-3 py-2.5">
      <p className="text-[11px] font-medium text-muted-foreground">{label}</p>
      <p className="mt-0.5 text-[20px] font-semibold tracking-tight tabular-nums">
        {value}
      </p>
      {hint ? (
        <p className="mt-0.5 text-[11px] text-muted-foreground">{hint}</p>
      ) : null}
    </div>
  );
}

function WeeklyBars({
  weekly,
}: {
  weekly: { weekStart: string; checks: number; activeDays: number }[];
}) {
  const max = Math.max(0, ...weekly.map((w) => w.checks));

  if (weekly.length === 0 || max === 0) {
    return (
      <p className="py-6 text-center text-[13px] text-muted-foreground">
        No checks in this range yet.
      </p>
    );
  }

  return (
    <div className="flex h-28 items-end gap-1 overflow-x-auto pb-1 pt-2">
      {weekly.map((w) => {
        const height = Math.max(4, Math.round((w.checks / max) * 100));
        const label = parseLocalDateKey(w.weekStart).toLocaleDateString(
          undefined,
          { month: "short", day: "numeric" },
        );
        return (
          <div
            key={w.weekStart}
            className="flex min-w-5 flex-1 flex-col items-center gap-1"
            title={`${label}: ${w.checks} checks · ${w.activeDays} active days`}
          >
            <span className="text-[9px] tabular-nums text-muted-foreground">
              {w.checks || ""}
            </span>
            <div
              className="w-full max-w-6 rounded-t-sm bg-primary/80"
              style={{ height: `${height}%` }}
            />
          </div>
        );
      })}
    </div>
  );
}

export function ActivityReport() {
  const { user, loading: authLoading } = useAuth();
  const [preset, setPreset] = useState<RangePreset>("3m");
  const [customStart, setCustomStart] = useState(() => {
    const d = new Date();
    d.setMonth(d.getMonth() - 3);
    return localDateKey(d);
  });
  const [customEnd, setCustomEnd] = useState(() => localDateKey());

  const window = useMemo(
    () =>
      resolveRangePreset(
        preset,
        preset === "custom"
          ? { start: customStart, end: customEnd }
          : undefined,
      ),
    [preset, customStart, customEnd],
  );

  const activity = useActivity(window);
  const { stats, loading, error, start, end } = activity;

  if (authLoading) {
    return (
      <div className="space-y-3" aria-busy="true">
        <Skeleton className="h-8 w-full rounded-xl" />
        <div className="grid grid-cols-2 gap-2">
          <Skeleton className="h-16 rounded-xl" />
          <Skeleton className="h-16 rounded-xl" />
          <Skeleton className="h-16 rounded-xl" />
          <Skeleton className="h-16 rounded-xl" />
        </div>
        <ActivityHeatmapSkeleton weeks={14} />
      </div>
    );
  }

  if (!user) {
    return (
      <p className="text-[13px] leading-snug text-muted-foreground">
        Sign in to see training reports and activity.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      <div
        className="flex gap-1.5 overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        role="listbox"
        aria-label="Date range"
      >
        {RANGE_PRESETS.map((p) => {
          const active = preset === p.id;
          return (
            <button
              key={p.id}
              type="button"
              role="option"
              aria-selected={active}
              onClick={() => setPreset(p.id)}
              className={cn(
                "shrink-0 rounded-full px-3 py-1.5 text-[12px] font-semibold transition-colors",
                active
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground active:bg-muted/80",
              )}
            >
              {p.label}
            </button>
          );
        })}
      </div>

      {preset === "custom" ? (
        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1">
            <Label htmlFor="report-from" className="text-[11px]">
              From
            </Label>
            <Input
              id="report-from"
              type="date"
              value={customStart}
              max={customEnd}
              onChange={(e) => setCustomStart(e.target.value)}
              className="h-10"
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="report-to" className="text-[11px]">
              To
            </Label>
            <Input
              id="report-to"
              type="date"
              value={customEnd}
              min={customStart}
              max={localDateKey()}
              onChange={(e) => setCustomEnd(e.target.value)}
              className="h-10"
            />
          </div>
        </div>
      ) : null}

      <p className="text-[12px] text-muted-foreground">
        {formatRangeLabel(start, end)}
      </p>

      {error ? (
        <p className="text-[13px] text-destructive" role="alert">
          {error}
        </p>
      ) : null}

      {loading ? (
        <div className="grid grid-cols-2 gap-2" aria-busy="true">
          <Skeleton className="h-16 rounded-xl" />
          <Skeleton className="h-16 rounded-xl" />
          <Skeleton className="h-16 rounded-xl" />
          <Skeleton className="h-16 rounded-xl" />
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-2">
          <StatTile
            label="Active days"
            value={stats.activeDays}
            hint={`${stats.partialDays} partial · ${stats.fullDays} full`}
          />
          <StatTile
            label="Full workouts"
            value={stats.fullDays}
            hint="Scheduled day completed"
          />
          <StatTile
            label="Checks"
            value={stats.totalChecks}
            hint="Todolist ticks"
          />
          <StatTile
            label="Streak"
            value={stats.streak}
            hint={stats.streak === 1 ? "day" : "days ending now"}
          />
        </div>
      )}

      <WeightReport start={start} end={end} />

      <div>
        <h3 className="text-[12px] font-semibold text-foreground">
          Checks per week
        </h3>
        {loading ? (
          <Skeleton className="mt-2 h-28 w-full rounded-xl" />
        ) : (
          <WeeklyBars weekly={stats.weekly} />
        )}
      </div>

      <div>
        <h3 className="mb-2 text-[12px] font-semibold text-foreground">
          Activity
        </h3>
        <p className="mb-2 text-[11px] text-muted-foreground">
          Light = some checks · Bright = full scheduled workout
        </p>
        {loading ? (
          <ActivityHeatmapSkeleton weeks={Math.min(activity.weeks, 16)} fill />
        ) : (
          <ActivityHeatmapGrid
            keys={activity.keys}
            intensityByDate={activity.intensityByDate}
            rangeStart={start}
            rangeEnd={end}
            fill
            showLegend
          />
        )}
      </div>
    </div>
  );
}
