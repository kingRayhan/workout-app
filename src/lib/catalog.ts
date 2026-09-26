import {
  DAYS,
  type Exercise,
  type MuscleGroup,
} from "@/data/plan";
import { MACHINES, type Machine } from "@/data/machines";

const BY_ID = new Map<string, Exercise>();
for (const day of DAYS) {
  for (const exercise of day.exercises) {
    BY_ID.set(exercise.id, exercise);
  }
}

export const MUSCLE_TAGS: { id: MuscleGroup; label: string }[] = [
  { id: "legs", label: "Legs" },
  { id: "chest", label: "Chest" },
  { id: "back", label: "Back" },
  { id: "shoulders", label: "Shoulders" },
  { id: "biceps", label: "Biceps" },
  { id: "triceps", label: "Triceps" },
  { id: "core", label: "Core" },
];

export function getCatalogExercise(id: string): Exercise | undefined {
  return BY_ID.get(id);
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
