/** Device-local calendar helpers for Today / Activity / logs. */

export type WeekdayKey =
  | "mon"
  | "tue"
  | "wed"
  | "thu"
  | "fri"
  | "sat"
  | "sun";

export const WEEKDAY_KEYS: WeekdayKey[] = [
  "mon",
  "tue",
  "wed",
  "thu",
  "fri",
  "sat",
  "sun",
];

export const WEEKDAY_LABELS: Record<WeekdayKey, string> = {
  mon: "Mon",
  tue: "Tue",
  wed: "Wed",
  thu: "Thu",
  fri: "Fri",
  sat: "Sat",
  sun: "Sun",
};

export type RangePreset = "4w" | "3m" | "6m" | "1y" | "custom";

export const RANGE_PRESETS: { id: RangePreset; label: string }[] = [
  { id: "4w", label: "4 weeks" },
  { id: "3m", label: "3 months" },
  { id: "6m", label: "6 months" },
  { id: "1y", label: "Year" },
  { id: "custom", label: "Custom" },
];

const SUNDAY_FIRST: WeekdayKey[] = [
  "sun",
  "mon",
  "tue",
  "wed",
  "thu",
  "fri",
  "sat",
];

export function startOfLocalDay(date = new Date()): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

export function localDateKey(date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function weekdayKey(date = new Date()): WeekdayKey {
  return SUNDAY_FIRST[date.getDay()]!;
}

export function parseLocalDateKey(key: string): Date {
  const [y, m, d] = key.split("-").map(Number);
  return new Date(y!, m! - 1, d!);
}

/** "Today", "Yesterday", or e.g. "Sat, Sep 26". */
export function relativeDayLabel(key: string): string {
  const today = localDateKey();
  const y = parseLocalDateKey(today);
  y.setDate(y.getDate() - 1);
  if (key === today) return "Today";
  if (key === localDateKey(y)) return "Yesterday";
  return parseLocalDateKey(key).toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

/** Inclusive range of local date keys from `start` to `end`. */
export function dateKeyRange(start: Date, end: Date): string[] {
  const keys: string[] = [];
  const cursor = startOfLocalDay(start);
  const last = startOfLocalDay(end);
  while (cursor <= last) {
    keys.push(localDateKey(cursor));
    cursor.setDate(cursor.getDate() + 1);
  }
  return keys;
}

export type ActivityWindow = {
  start: Date;
  end: Date;
  /** Heatmap grid start (aligned to Sunday). */
  gridStart: Date;
  keys: string[];
  weeks: number;
};

/** Pad start back to Sunday so heatmap columns stay aligned. */
export function activityRangeWindow(
  rangeStart: Date,
  rangeEnd: Date = new Date(),
): ActivityWindow {
  const end = startOfLocalDay(rangeEnd);
  let start = startOfLocalDay(rangeStart);
  if (start > end) start = new Date(end);

  const gridStart = new Date(start);
  gridStart.setDate(gridStart.getDate() - gridStart.getDay());

  const keys = dateKeyRange(gridStart, end);
  const weeks = Math.ceil(keys.length / 7);

  return { start, end, gridStart, keys, weeks };
}

/** ~N weeks ending today, padded to start on Sunday. */
export function activityWindow(weeks = 12, today = new Date()): ActivityWindow {
  const end = startOfLocalDay(today);
  const start = new Date(end);
  start.setDate(start.getDate() - (weeks * 7 - 1));
  return activityRangeWindow(start, end);
}

/** Rolling calendar months ending today (default Activity range). */
export function monthsAgoWindow(
  months = 3,
  today = new Date(),
): ActivityWindow {
  const end = startOfLocalDay(today);
  const start = new Date(end);
  start.setMonth(start.getMonth() - months);
  start.setDate(start.getDate() + 1);
  return activityRangeWindow(start, end);
}

export function resolveRangePreset(
  preset: RangePreset,
  custom?: { start: string; end: string },
  today = new Date(),
): ActivityWindow {
  const end = startOfLocalDay(today);
  if (preset === "4w") return activityWindow(4, today);
  if (preset === "6m") return monthsAgoWindow(6, today);
  if (preset === "1y") return monthsAgoWindow(12, today);
  if (preset === "custom" && custom?.start && custom?.end) {
    return activityRangeWindow(
      parseLocalDateKey(custom.start),
      parseLocalDateKey(custom.end),
    );
  }
  // default + "3m"
  return monthsAgoWindow(3, today);
}

export function formatRangeLabel(start: Date, end: Date): string {
  const opts: Intl.DateTimeFormatOptions = { month: "short", day: "numeric" };
  const sameYear = start.getFullYear() === end.getFullYear();
  const startLabel = start.toLocaleDateString(
    undefined,
    sameYear ? opts : { ...opts, year: "numeric" },
  );
  const endLabel = end.toLocaleDateString(undefined, {
    ...opts,
    year: "numeric",
  });
  return `${startLabel} – ${endLabel}`;
}
