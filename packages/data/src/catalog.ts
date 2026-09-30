import { CARDIO_EXERCISES } from "./cardio";
import {
  DAYS,
  type Exercise,
  type MuscleGroup,
} from "./plan";
import { MACHINES, type Machine } from "./machines";

const BY_ID = new Map<string, Exercise>();
for (const day of DAYS) {
  for (const exercise of day.exercises) {
    BY_ID.set(exercise.id, exercise);
  }
}
for (const exercise of CARDIO_EXERCISES) {
  BY_ID.set(exercise.id, exercise);
}

export const MUSCLE_TAGS: { id: MuscleGroup; label: string }[] = [
  { id: "legs", label: "Legs" },
  { id: "chest", label: "Chest" },
  { id: "back", label: "Back" },
  { id: "shoulders", label: "Shoulders" },
  { id: "biceps", label: "Biceps" },
  { id: "triceps", label: "Triceps" },
  { id: "core", label: "Core" },
  { id: "cardio", label: "Cardio" },
];

export function getCatalogExercise(id: string): Exercise | undefined {
  return BY_ID.get(id);
}

export function isCardioExercise(id: string): boolean {
  return Boolean(BY_ID.get(id)?.cardio);
}

export type CardioMetric = "speedKmh" | "inclinePct" | "level";

/** Which machine settings apply beyond duration, e.g. speed + incline on a treadmill. */
export function cardioMetrics(id: string): CardioMetric[] {
  const spec = BY_ID.get(id)?.cardio;
  if (!spec) return [];
  return (["speedKmh", "inclinePct", "level"] as const).filter(
    (k) => spec[k] !== undefined,
  );
}

export type CardioValues = {
  durationMin: number | null;
  speedKmh?: number | null;
  inclinePct?: number | null;
  level?: number | null;
};

export function cardioDistanceKm(v: CardioValues): number | null {
  if (v.durationMin == null || v.speedKmh == null) return null;
  return Math.round(((v.speedKmh * v.durationMin) / 60) * 100) / 100;
}

/** e.g. "20 min · 4.5 km/h · 2% incline"; pass `withDuration: false` for the extras only. */
export function formatCardio(
  v: CardioValues,
  { withDuration = true, withDistance = false } = {},
): string {
  const parts: string[] = [];
  if (withDuration && v.durationMin != null) parts.push(`${v.durationMin} min`);
  if (v.speedKmh != null) parts.push(`${v.speedKmh} km/h`);
  if (v.inclinePct) parts.push(`${v.inclinePct}% incline`);
  if (v.level != null) parts.push(`level ${v.level}`);
  const km = withDistance ? cardioDistanceKm(v) : null;
  if (km !== null) parts.push(`${km} km`);
  return parts.join(" · ");
}

/** Catalog default target, e.g. "3 × 15" or "20 min · 4.5 km/h". */
export function catalogTargetLabel(exercise: Exercise): string {
  return exercise.cardio
    ? formatCardio(exercise.cardio)
    : `${exercise.sets} × ${exercise.reps}`;
}

/** The number tracked for progress: minutes for cardio, kg for lifts. */
export type ProgressMetric = {
  field: "weightKg" | "durationMin";
  unit: "kg" | "min";
  label: string;
  empty: string;
};

const WEIGHT_METRIC: ProgressMetric = {
  field: "weightKg",
  unit: "kg",
  label: "Weight lifted",
  empty: "No weight",
};

const TIME_METRIC: ProgressMetric = {
  field: "durationMin",
  unit: "min",
  label: "Time",
  empty: "No time",
};

export function progressMetric(exerciseId: string): ProgressMetric {
  return isCardioExercise(exerciseId) ? TIME_METRIC : WEIGHT_METRIC;
}

export function metricValue(
  log: { weightKg: number | null; durationMin: number | null },
  metric: ProgressMetric,
): number | null {
  return log[metric.field];
}

export function catalogExerciseName(id: string): string {
  return BY_ID.get(id)?.name ?? id;
}

export function allCatalogExercises(): Exercise[] {
  return Array.from(BY_ID.values());
}

export function isCatalogExerciseId(id: string): boolean {
  return BY_ID.has(id);
}

export function isMuscleTag(value: string | null): value is MuscleGroup {
  return MUSCLE_TAGS.some((t) => t.id === value);
}

export function filterExercisesByTag(
  exercises: Exercise[],
  tag: MuscleGroup | null,
): Exercise[] {
  if (!tag) return exercises;
  return exercises.filter((e) => e.muscles.includes(tag));
}

function matchesQuery(haystack: string, query: string): boolean {
  return haystack.toLowerCase().includes(query);
}

function exerciseSearchText(exercise: Exercise): string {
  return [
    exercise.name,
    exercise.focus,
    exercise.tip ?? "",
    exercise.avoid ?? "",
    ...exercise.muscles,
    ...exercise.steps,
  ].join(" ");
}

function machineSearchText(machine: Machine): string {
  return [
    machine.name,
    machine.aka ?? "",
    machine.howToFind,
    ...machine.setup,
  ].join(" ");
}

/** Local catalog search across exercises and machines. */
export function filterExercisesByQuery(
  exercises: Exercise[],
  query: string,
): Exercise[] {
  const q = query.trim().toLowerCase();
  if (!q) return exercises;
  return exercises.filter((e) => matchesQuery(exerciseSearchText(e), q));
}

export function filterMachinesByQuery(
  machines: Machine[],
  query: string,
): Machine[] {
  const q = query.trim().toLowerCase();
  if (!q) return machines;
  return machines.filter((m) => matchesQuery(machineSearchText(m), q));
}

export function searchCatalog(query: string): {
  exercises: Exercise[];
  machines: Machine[];
} {
  const q = query.trim();
  if (!q) return { exercises: [], machines: [] };

  return {
    exercises: filterExercisesByQuery(allCatalogExercises(), q),
    machines: filterMachinesByQuery(MACHINES, q),
  };
}
