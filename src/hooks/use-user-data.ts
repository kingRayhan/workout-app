"use client";

import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/lib/auth";
import {
  activityRangeWindow,
  activityWindow,
  localDateKey,
  monthsAgoWindow,
  parseLocalDateKey,
  weekdayKey,
  type ActivityWindow,
  type WeekdayKey,
} from "@/lib/dates";
import {
  EMPTY_PROFILE,
  emptySchedule,
  subscribeBodyWeightsInRange,
  subscribeLogsForDate,
  subscribeLogsInRange,
  subscribeProfile,
  subscribeSchedule,
  subscribeWorkouts,
  type BodyWeightEntry,
  type ExerciseLog,
  type Profile,
  type Schedule,
  type Workout,
} from "@/lib/user-data";

/** Body-weight entries between two date keys (inclusive), oldest first. */
export function useBodyWeights(startKey: string, endKey: string) {
  const { user } = useAuth();
  const [entries, setEntries] = useState<BodyWeightEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setEntries([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    return subscribeBodyWeightsInRange(
      user.uid,
      startKey,
      endKey,
      (rows) => {
        setEntries(rows);
        setLoading(false);
        setError(null);
      },
      (err) => {
        setError(err.message);
        setLoading(false);
      },
    );
  }, [user, startKey, endKey]);

  return { entries, loading, error };
}

/** Body-weight entry for `date` plus the most recent earlier entry (for the delta). */
export function useBodyWeight(date: string) {
  const start = useMemo(() => {
    const d = parseLocalDateKey(date);
    d.setDate(d.getDate() - 365);
    return localDateKey(d);
  }, [date]);
  const { entries, loading, error } = useBodyWeights(start, date);

  const current = entries.find((e) => e.date === date) ?? null;
  const previous =
    [...entries].reverse().find((e) => e.date < date) ?? null;

  return { current, previous, entries, loading, error };
}

/** Every body-weight entry the user has logged, oldest first. */
export function useAllBodyWeights() {
  return useBodyWeights("0000-01-01", "9999-12-31");
}

export function useProfile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile>(EMPTY_PROFILE);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setProfile(EMPTY_PROFILE);
      setLoading(false);
      return;
    }
    setLoading(true);
    return subscribeProfile(
      user.uid,
      (next) => {
        setProfile(next);
        setLoading(false);
      },
      () => setLoading(false),
    );
  }, [user]);

  return { profile, loading };
}

export function useWorkouts() {
  const { user } = useAuth();
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setWorkouts([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    return subscribeWorkouts(
      user.uid,
      (rows) => {
        setWorkouts(rows);
        setLoading(false);
        setError(null);
      },
      (err) => {
        setError(err.message);
        setLoading(false);
      },
    );
  }, [user]);

  return { workouts, loading, error };
}

export function useSchedule() {
  const { user } = useAuth();
  const [schedule, setSchedule] = useState<Schedule>(emptySchedule);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setSchedule(emptySchedule());
      setLoading(false);
      return;
    }
    setLoading(true);
    return subscribeSchedule(
      user.uid,
      (next) => {
        setSchedule(next);
        setLoading(false);
        setError(null);
      },
      (err) => {
        setError(err.message);
        setLoading(false);
      },
    );
  }, [user]);

  return { schedule, loading, error };
}

/** Todolist for `dateKey` (defaults to today). */
export function useTodayTodolist(dateKey?: string) {
  const { user } = useAuth();
  const { workouts, loading: workoutsLoading } = useWorkouts();
  const { schedule, loading: scheduleLoading } = useSchedule();
  const date = dateKey ?? localDateKey();
  const day = weekdayKey(parseLocalDateKey(date));
  const [logs, setLogs] = useState<ExerciseLog[]>([]);
  const [logsLoading, setLogsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setLogs([]);
      setLogsLoading(false);
      return;
    }
    setLogsLoading(true);
    return subscribeLogsForDate(
      user.uid,
      date,
      (rows) => {
        setLogs(rows);
        setLogsLoading(false);
        setError(null);
      },
      (err) => {
        setError(err.message);
        setLogsLoading(false);
      },
    );
  }, [user, date]);

  const workoutId = schedule[day];
  const workout = useMemo(
    () => workouts.find((w) => w.id === workoutId) ?? null,
    [workouts, workoutId],
  );

  const doneIds = useMemo(() => {
    const set = new Set<string>();
    for (const log of logs) {
      if (log.done) set.add(log.exerciseId);
    }
    return set;
  }, [logs]);

  return {
    date,
    weekday: day,
    workout,
    workoutId,
    doneIds,
    logs,
    loading: workoutsLoading || scheduleLoading || logsLoading,
    error,
  };
}

export type ActivityIntensity = 0 | 1 | 2;

export type ActivityRangeInput =
  | { weeks: number }
  | { months: number }
  | { start: Date; end: Date }
  | ActivityWindow;

function toWindow(input: ActivityRangeInput): ActivityWindow {
  if ("gridStart" in input && "keys" in input) {
    return input;
  }
  if ("months" in input) {
    return monthsAgoWindow(input.months);
  }
  if ("weeks" in input) {
    return activityWindow(input.weeks);
  }
  return activityRangeWindow(input.start, input.end);
}

export type ActivityStats = {
  activeDays: number;
  fullDays: number;
  partialDays: number;
  totalChecks: number;
  /** Longest consecutive active-day streak ending in-range (or 0). */
  streak: number;
  weekly: { weekStart: string; checks: number; activeDays: number }[];
};

export function useActivity(range: ActivityRangeInput = { months: 3 }) {
  const { user } = useAuth();
  const { workouts } = useWorkouts();
  const { schedule } = useSchedule();
  const window = useMemo(() => toWindow(range), [
    // serialize for stable deps
    "keys" in range && "gridStart" in range
      ? `${localDateKey(range.start)}_${localDateKey(range.end)}`
      : "months" in range
        ? `m${range.months}`
        : "weeks" in range
          ? `w${range.weeks}`
          : `${localDateKey(range.start)}_${localDateKey(range.end)}`,
  ]);
  const [logs, setLogs] = useState<ExerciseLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setLogs([]);
      setLoading(false);
      return;
    }
    const start = localDateKey(window.gridStart);
    const end = localDateKey(window.end);
    setLoading(true);
    return subscribeLogsInRange(
      user.uid,
      start,
      end,
      (rows) => {
        setLogs(rows);
        setLoading(false);
        setError(null);
      },
      (err) => {
        setError(err.message);
        setLoading(false);
      },
    );
  }, [user, window.gridStart, window.end]);

  const byDate = useMemo(() => {
    const map = new Map<string, number>();
    for (const log of logs) {
      if (!log.done) continue;
      map.set(log.date, (map.get(log.date) ?? 0) + 1);
    }
    return map;
  }, [logs]);

  const workoutById = useMemo(() => {
    const map = new Map<string, Workout>();
    for (const w of workouts) map.set(w.id, w);
    return map;
  }, [workouts]);

  const intensityByDate = useMemo(() => {
    const map = new Map<string, ActivityIntensity>();
    for (const key of window.keys) {
      // Only score days inside the requested range (not Sunday padding)
      if (key < localDateKey(window.start)) {
        map.set(key, 0);
        continue;
      }
      const n = byDate.get(key) ?? 0;
      if (n === 0) {
        map.set(key, 0);
        continue;
      }
      const day = weekdayKey(parseLocalDateKey(key)) as WeekdayKey;
      const wid = schedule[day];
      const required = wid ? (workoutById.get(wid)?.exerciseIds.length ?? 0) : 0;
      if (required > 0 && n >= required) map.set(key, 2);
      else map.set(key, 1);
    }
    return map;
  }, [window.keys, window.start, byDate, schedule, workoutById]);

  const stats = useMemo((): ActivityStats => {
    const rangeStart = localDateKey(window.start);
    let activeDays = 0;
    let fullDays = 0;
    let partialDays = 0;
    let totalChecks = 0;

    const weeklyMap = new Map<
      string,
      { checks: number; activeDays: number }
    >();

    for (const key of window.keys) {
      if (key < rangeStart) continue;
      const level = intensityByDate.get(key) ?? 0;
      const checks = byDate.get(key) ?? 0;
      totalChecks += checks;
      if (level > 0) activeDays += 1;
      if (level === 2) fullDays += 1;
      if (level === 1) partialDays += 1;

      const d = parseLocalDateKey(key);
      const weekStart = new Date(d);
      weekStart.setDate(weekStart.getDate() - weekStart.getDay());
      const wk = localDateKey(weekStart);
      const bucket = weeklyMap.get(wk) ?? { checks: 0, activeDays: 0 };
      bucket.checks += checks;
      if (level > 0) bucket.activeDays += 1;
      weeklyMap.set(wk, bucket);
    }

    // Current streak ending today (or most recent day in range)
    let streak = 0;
    const cursor = new Date(window.end);
    while (cursor >= window.start) {
      const key = localDateKey(cursor);
      const level = intensityByDate.get(key) ?? 0;
      if (level === 0) break;
      streak += 1;
      cursor.setDate(cursor.getDate() - 1);
    }

    const weekly = Array.from(weeklyMap.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([weekStart, v]) => ({ weekStart, ...v }));

    return {
      activeDays,
      fullDays,
      partialDays,
      totalChecks,
      streak,
      weekly,
    };
  }, [window, intensityByDate, byDate]);

  return {
    keys: window.keys,
    start: window.start,
    end: window.end,
    weeks: window.weeks,
    intensityByDate,
    countsByDate: byDate,
    stats,
    loading,
    error,
  };
}
