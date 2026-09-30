import type { MuscleGroup } from "@workoutland/data/plan";

/** Shared 3D icons, copied into `public/` from `packages/data/assets`. */
export const ICONS = {
  logo: "/shortcuts/exercise.png",
  machines: "/shortcuts/catalog.png",
  workouts: "/icons/plan.png",
  aerobics: "/icons/heart.png",
  blog: "/icons/sparkles.png",
  play: "/icons/rocket.png",
  moves: "/shortcuts/exercise.png",
  days: "/icons/calendar.png",
  tip: "/icons/sparkles.png",
  avoid: "/icons/shield.png",
  target: "/icons/target.png",
  flame: "/icons/flame.png",
} as const;

export const MUSCLE_ICON: Record<MuscleGroup, string> = {
  legs: "/icons/footprints.png",
  chest: "/icons/shield.png",
  back: "/icons/mountain.png",
  shoulders: "/shortcuts/exercise.png",
  biceps: "/icons/biceps.png",
  triceps: "/icons/bolt.png",
  core: "/icons/core.png",
  cardio: "/icons/heart.png",
};
