export const EXERCISE_LOG_HREF = "/report/exercises";
export const WEIGHT_LOG_HREF = "/report/weight";

export function exerciseLogHref(exerciseId?: string) {
  return exerciseId
    ? `${EXERCISE_LOG_HREF}?exercise=${encodeURIComponent(exerciseId)}`
    : EXERCISE_LOG_HREF;
}
