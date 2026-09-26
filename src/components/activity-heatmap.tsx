"use client";

import { Fragment, useMemo } from "react";
import { ActivityHeatmapSkeleton } from "@/components/skeletons";
import {
  formatRangeLabel,
  localDateKey,
  parseLocalDateKey,
} from "@/lib/dates";
import {
  useActivity,
  type ActivityIntensity,
  type ActivityRangeInput,
} from "@/hooks/use-user-data";
import { useAuth } from "@/lib/auth";
import { cn } from "@/lib/utils";

const LEVEL: Record<ActivityIntensity, string> = {
  0: "bg-foreground/[0.08]",
  1: "bg-primary/45",
  2: "bg-primary",
};

function weekMonthKey(col: string[], rangeStartKey: string): string {
  const first = col.find((k) => k >= rangeStartKey) ?? col[0]!;
  const d = parseLocalDateKey(first);
  return `${d.getFullYear()}-${d.getMonth()}`;
}

function weekMonthLabel(col: string[], rangeStartKey: string): string {
  const first = col.find((k) => k >= rangeStartKey) ?? col[0]!;
  return parseLocalDateKey(first).toLocaleDateString(undefined, {
    month: "short",
  });
}

function MonthGap({ fill }: { fill: boolean }) {
  return (
    <div
      className={cn("shrink-0", fill ? "w-1.5" : "w-1")}
      aria-hidden
    />
  );
}

export function ActivityHeatmapGrid({
  keys,
  intensityByDate,
  rangeStart,
  rangeEnd,
  compact = false,
  fill = false,
  showRangeLabel = false,
  rangeCaption,
  showLegend = false,
}: {
  keys: string[];
  intensityByDate: Map<string, ActivityIntensity>;
  rangeStart: Date;
  rangeEnd?: Date;
  compact?: boolean;
  fill?: boolean;
  showRangeLabel?: boolean;
  rangeCaption?: string;
  showLegend?: boolean;
}) {
  const columns = useMemo(() => {
    const cols: string[][] = [];
    for (let i = 0; i < keys.length; i += 7) {
      cols.push(keys.slice(i, i + 7));
    }
    return cols;
  }, [keys]);

  const rangeStartKey = localDateKey(rangeStart);

  const monthStarts = useMemo(() => {
    const set = new Set<number>();
    let prev = "";
    columns.forEach((col, i) => {
      const key = weekMonthKey(col, rangeStartKey);
      if (key !== prev) {
        set.add(i);
        prev = key;
      }
    });
    return set;
  }, [columns, rangeStartKey]);

  const end = rangeEnd ?? new Date();
  const caption =
    rangeCaption ?? `Last 3 months · ${formatRangeLabel(rangeStart, end)}`;
  const cellGap = "gap-[3px]";
  const todayKey = localDateKey();

  return (
    <div className="w-full">
      {showRangeLabel ? (
        <p className="mb-2.5 text-[11px] leading-snug text-muted-foreground">
          {caption}
        </p>
      ) : null}

      {/* Equal-width week columns; thin spacers only at month boundaries */}
      <div className={cn("flex w-full", cellGap, !fill && "overflow-x-auto")}>
        {columns.map((col, colIndex) => {
          const isMonthStart = monthStarts.has(colIndex);
          return (
            <Fragment key={col[0]}>
              {isMonthStart && colIndex > 0 ? <MonthGap fill={fill} /> : null}
              <div
                className={cn(
                  "flex flex-col",
                  cellGap,
                  fill ? "min-w-0 flex-1" : "w-3 shrink-0",
                )}
              >
                {col.map((key) => {
                  const inRange = key >= rangeStartKey;
                  const level = inRange ? (intensityByDate.get(key) ?? 0) : 0;
                  const d = parseLocalDateKey(key);
                  const title = d.toLocaleDateString(undefined, {
                    weekday: "short",
                    month: "short",
                    day: "numeric",
                  });
                  return (
                    <span
                      key={key}
                      title={inRange ? title : undefined}
                      className={cn(
                        "rounded-[3px]",
                        fill ? "aspect-square w-full" : "size-3",
                        inRange ? LEVEL[level] : "opacity-0",
                        key === todayKey &&
                          inRange &&
                          "outline outline-1 outline-offset-0 outline-foreground/55",
                      )}
                      aria-hidden={!inRange}
                      aria-label={
                        inRange ? `${title}: level ${level}` : undefined
                      }
                    />
                  );
                })}
              </div>
            </Fragment>
          );
        })}
      </div>

      <div className={cn("mt-1.5 flex w-full overflow-visible", cellGap)}>
        {columns.map((col, colIndex) => {
          const isMonthStart = monthStarts.has(colIndex);
          return (
            <Fragment key={`label-${col[0]}`}>
              {isMonthStart && colIndex > 0 ? <MonthGap fill={fill} /> : null}
              <div
                className={cn(
                  "relative h-3 overflow-visible",
                  fill ? "min-w-0 flex-1" : "w-3 shrink-0",
                )}
              >
                {isMonthStart ? (
                  <span className="absolute left-0 top-0 whitespace-nowrap text-[10px] font-medium text-muted-foreground">
                    {weekMonthLabel(col, rangeStartKey)}
                  </span>
                ) : null}
              </div>
            </Fragment>
          );
        })}
      </div>

      {(showLegend || (!compact && !fill)) && (
        <div className="mt-2.5 flex items-center justify-end gap-1.5 text-[10px] text-muted-foreground">
          <span>Less</span>
          <span className={cn("size-2.5 rounded-[2px]", LEVEL[0])} />
          <span className={cn("size-2.5 rounded-[2px]", LEVEL[1])} />
          <span className={cn("size-2.5 rounded-[2px]", LEVEL[2])} />
          <span>More</span>
        </div>
      )}
    </div>
  );
}

/** Fetches activity for `range` (default last 3 months) and renders the grid. */
export function ActivityHeatmap({
  range = { months: 3 },
  compact = false,
  fill = false,
  showRangeLabel = false,
  showLegend = false,
}: {
  range?: ActivityRangeInput;
  compact?: boolean;
  fill?: boolean;
  showRangeLabel?: boolean;
  showLegend?: boolean;
}) {
  const { user, loading: authLoading } = useAuth();
  const { keys, intensityByDate, loading, weeks, start, end } =
    useActivity(range);

  if (authLoading || (user && loading)) {
    return (
      <div className="w-full">
        {showRangeLabel ? (
          <p className="mb-2.5 text-[11px] text-muted-foreground">
            Last 3 months
          </p>
        ) : null}
        <ActivityHeatmapSkeleton
          weeks={Math.min(weeks, 14)}
          compact={compact || fill}
          fill={fill}
        />
      </div>
    );
  }

  if (!user) return null;

  return (
    <ActivityHeatmapGrid
      keys={keys}
      intensityByDate={intensityByDate}
      rangeStart={start}
      rangeEnd={end}
      compact={compact}
      fill={fill}
      showRangeLabel={showRangeLabel}
      showLegend={showLegend}
      rangeCaption={`Last 3 months · ${formatRangeLabel(start, end)}`}
    />
  );
}
