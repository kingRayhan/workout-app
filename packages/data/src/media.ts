/** Full-HD (1080p) form demos from free-exercise-db-with-videos (MIT). */
const HD = "https://pub-585d42eb1aa64a67aedf483ec328d3fe.r2.dev/exercise-videos/male";

export const EXERCISE_VIDEO: Record<string, string> = {
  "leg-press": `${HD}/sled-45-degree-leg-wide-press.mp4`,
  "leg-curl": `${HD}/lever-seated-leg-curl.mp4`,
  "leg-extension": `${HD}/lever-leg-extension.mp4`,
  "inner-thigh": `${HD}/lever-seated-hip-adduction.mp4`,
  "outer-thigh": `${HD}/lever-seated-hip-abduction.mp4`,
  "side-raise": `${HD}/dumbbell-lateral-raise.mp4`,
  "front-raise": `${HD}/dumbbell-front-raise.mp4`,
  "front-shoulder-press": `${HD}/smith-seated-shoulder-press.mp4`,
  "face-pull": `${HD}/cable-rear-delt-row-with-rope.mp4`,
  shrugs: `${HD}/dumbbell-shrug.mp4`,
  "incline-db-press": `${HD}/dumbbell-incline-bench-press.mp4`,
  "chest-press": `${HD}/lever-lying-chest-press.mp4`,
  "machine-fly": `${HD}/lever-pec-deck-fly.mp4`,
  "chest-dips": `${HD}/chest-dips.mp4`,
  // Closest HD demo available (no dedicated pullover clip in source DB)
  "pull-over": `${HD}/dumbbell-fly.mp4`,
  "overhead-extension": `${HD}/cable-rope-high-pulley-overhead-triceps-extension.mp4`,
  "push-down": `${HD}/cable-pushdown-rope-attachment.mp4`,
  "triceps-dips": `${HD}/bench-dips.mp4`,
  "t-bar-row": `${HD}/lever-t-bar-row.mp4`,
  "front-lat-pulldown": `${HD}/cable-pulldown.mp4`,
  "v-bar-row": `${HD}/cable-straight-back-seated-row-v-grip.mp4`,
  "single-arm-low-row": `${HD}/cable-one-arm-twisting-seated-row.mp4`,
  hyperextension: `${HD}/45-degree-hyperextension.mp4`,
  "barbell-curl": `${HD}/barbell-curl.mp4`,
  "preacher-curl": `${HD}/lever-preacher-curl.mp4`,
  "hammer-curl": `${HD}/dumbbell-cross-body-hammer-curl.mp4`,
  "shoulder-raise-machine": `${HD}/lever-lateral-raise.mp4`,
  "glute-kickback": `${HD}/lever-standing-rear-kick.mp4`,
  "smith-machine-squat": `${HD}/smith-chair-squat.mp4`,
  "triceps-machine-extension": `${HD}/lever-triceps-extension.mp4`,
  "power-rack-chinup": `${HD}/close-grip-chin-up.mp4`,
  "biceps-machine-curl": `${HD}/lever-preacher-curl.mp4`,
  "ab-machine-crunch": `${HD}/lever-seated-crunch-1.mp4`,
  // Closest HD demo available (no torso-rotation machine clip in source DB)
  "waist-rotary": `${HD}/cable-twist-up-down.mp4`,
  // Only a running clip exists in the source DB; used for every treadmill variant
  "treadmill-walk": `${HD}/treadmill-running.mp4`,
  "incline-walk": `${HD}/treadmill-running.mp4`,
  "treadmill-jog": `${HD}/treadmill-running.mp4`,
  "stationary-bike": `${HD}/stationary-bike.mp4`,
  elliptical: `${HD}/elliptical.mp4`,
  "jumping-jack": `${HD}/jumping-jack.mp4`,
  "bodyweight-squat": `${HD}/squat.mp4`,
  burpee: `${HD}/burpee.mp4`,
  "jump-rope": `${HD}/jump-rope.mp4`,
  // Feet match the open-hand jack; the plate stays at the chest.
  "disc-jumping-jack": `${HD}/jumping-jack.mp4`,
  // Same chest-held shape as a plate squat.
  "disc-squat": `${HD}/dumbbell-goblet-squat.mp4`,
};

/** @deprecated Prefer EXERCISE_VIDEO — kept so old imports don't break mid-refactor. */
export const EXERCISE_GIF = EXERCISE_VIDEO;

/** Primary machine id from `machines.ts` for each exercise. */
export const EXERCISE_MACHINE: Record<string, string> = {
  "leg-press": "leg-press",
  "leg-curl": "leg-curl",
  "leg-extension": "leg-extension",
  "inner-thigh": "inner-thigh",
  "outer-thigh": "outer-thigh",
  "side-raise": "dumbbells",
  "front-raise": "dumbbells",
  "front-shoulder-press": "shoulder-press",
  "face-pull": "cable-station",
  shrugs: "dumbbells",
  "incline-db-press": "incline-bench",
  "chest-press": "chest-press",
  "machine-fly": "machine-fly",
  "chest-dips": "dip-station",
  "pull-over": "flat-bench",
  "overhead-extension": "cable-station",
  "push-down": "cable-station",
  "triceps-dips": "dip-station",
  "t-bar-row": "t-bar-row",
  "front-lat-pulldown": "lat-pulldown",
  "v-bar-row": "seated-row",
  "single-arm-low-row": "seated-row",
  hyperextension: "hyperextension",
  "barbell-curl": "barbell",
  "preacher-curl": "preacher-curl",
  "hammer-curl": "dumbbells",
  "shoulder-raise-machine": "shoulder-raise-machine",
  "glute-kickback": "glute-machine",
  "smith-machine-squat": "smith-machine",
  "triceps-machine-extension": "triceps-machine",
  "power-rack-chinup": "power-rack",
  "biceps-machine-curl": "biceps-machine",
  "ab-machine-crunch": "ab-machine",
  "waist-rotary": "waist-rotary",
};

export const MEDIA_CREDIT =
  "Form videos: free-exercise-db-with-videos (MIT, 1080p). Machine photos: WNQ Fitness product photography (internal reference use) & Wikimedia Commons/Unsplash.";
