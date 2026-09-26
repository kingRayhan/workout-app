import {
  DAYS,
  type Exercise,
  type MuscleGroup,
} from "@/data/plan";

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
