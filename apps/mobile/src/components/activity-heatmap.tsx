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

/** Weeks per visual row. ≥16 keeps a 3-month window on one row. */
const WEEKS_PER_ROW = 16;

const LEVEL: Record<ActivityIntensity, string> = {
  0: "bg-foreground/[0.08]",
  1: "bg-primary/45",
  2: "bg-primary",
};

const CELL = "h-2.5 w-full min-w-0 rounded-[2px]";
const CELL_FIXED = "size-2.5 rounded-[2px]";
const CELL_GAP = "gap-[2px]";
const MONTH_GAP = "w-1.5 shrink-0";

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

/** Month-start indices in a row (includes 0). */
function monthStartIndices(
  row: string[][],
  rangeStartKey: string,
): Set<number> {
  const set = new Set<number>();
  let prev = "";
  row.forEach((col, i) => {
    const key = weekMonthKey(col, rangeStartKey);
    if (i === 0 || key !== prev) {
      set.add(i);
      prev = key;
    }
  });
  return set;
}

/** Labels to show; skip ones closer than 2 weeks (except row start). */
function labelIndices(monthStarts: Set<number>): Set<number> {
  const candidates = Array.from(monthStarts).sort((a, b) => a - b);
  const kept = new Set<number>();
  let last = -Infinity;
  for (const i of candidates) {
    if (i === 0 || i - last >= 2) {
      kept.add(i);
      last = i;
    }
  }
  return kept;
}

function chunkWeeks(columns: string[][]): string[][][] {
  if (columns.length <= WEEKS_PER_ROW) return [columns];
  const rows: string[][][] = [];
  for (let i = 0; i < columns.length; i += WEEKS_PER_ROW) {
    rows.push(columns.slice(i, i + WEEKS_PER_ROW));
  }
  return rows;
}

function HeatmapRow({
  row,
  colsInRow,
  rangeStartKey,
  intensityByDate,
  todayKey,
  fill,
}: {
  row: string[][];
  colsInRow: number;
  rangeStartKey: string;
  intensityByDate: Map<string, ActivityIntensity>;
  todayKey: string;
  fill: boolean;
}) {
  const monthStarts = monthStartIndices(row, rangeStartKey);
  const labels = labelIndices(monthStarts);

  // Pad so partial last rows keep the same week width as full rows.
  const slots: (string[] | null)[] = Array.from(
    { length: colsInRow },
    (_, i) => row[i] ?? null,
  );

  return (
    <div className="w-full">
      <div className={cn("flex w-full", CELL_GAP)}>
        {slots.map((col, i) => (
          <Fragment key={col?.[0] ?? `pad-${i}`}>
            {monthStarts.has(i) && i > 0 ? (
              <div className={MONTH_GAP} aria-hidden />
            ) : null}
            <div
              className={cn(
                "flex min-w-0 flex-1 flex-col",
                CELL_GAP,
                !col && "invisible",
              )}
            >
              {(col ?? Array.from({ length: 7 }, () => "")).map((key, day) => {
                if (!col) {
                  return (
                    <span
                      key={day}
                      className={fill ? CELL : CELL_FIXED}
                      aria-hidden
                    />
                  );
                }
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
                      fill ? CELL : CELL_FIXED,
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
        ))}
      </div>

      <div className={cn("mt-1 flex w-full overflow-visible", CELL_GAP)}>
        {slots.map((col, i) => (
          <Fragment key={`label-${col?.[0] ?? i}`}>
            {monthStarts.has(i) && i > 0 ? (
              <div className={MONTH_GAP} aria-hidden />
            ) : null}
            <div className="relative h-3.5 min-w-0 flex-1">
              {col && labels.has(i) ? (
                <span className="absolute left-0 top-0 whitespace-nowrap text-[10px] font-medium text-muted-foreground">
                  {weekMonthLabel(col, rangeStartKey)}
                </span>
              ) : null}
            </div>
          </Fragment>
        ))}
      </div>
    </div>
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

  const rows = useMemo(() => chunkWeeks(columns), [columns]);
  const multi = columns.length > WEEKS_PER_ROW;
  const colsInRow = multi ? WEEKS_PER_ROW : Math.max(columns.length, 1);
  const rangeStartKey = localDateKey(rangeStart);
  const todayKey = localDateKey();

  const end = rangeEnd ?? new Date();
  const caption =
    rangeCaption ?? `Last 3 months · ${formatRangeLabel(rangeStart, end)}`;

  return (
    <div className="w-full">
      {showRangeLabel ? (
        <p className="mb-2.5 text-[11px] leading-snug text-muted-foreground">
          {caption}
        </p>
      ) : null}

      <div className={cn("flex w-full flex-col", multi ? "gap-4" : "gap-0")}>
        {rows.map((row) => (
          <HeatmapRow
            key={row[0]?.[0] ?? "row"}
            row={row}
            colsInRow={colsInRow}
            rangeStartKey={rangeStartKey}
            intensityByDate={intensityByDate}
            todayKey={todayKey}
            fill={fill || multi}
          />
        ))}
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
          weeks={Math.min(weeks, WEEKS_PER_ROW)}
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
