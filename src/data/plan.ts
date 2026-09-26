export type MuscleGroup =
  | "legs"
  | "shoulders"
  | "chest"
  | "triceps"
  | "back"
  | "biceps"
  | "core";

export type Exercise = {
  id: string;
  name: string;
  sets: number;
  reps: number;
  focus: string;
  steps: string[];
  avoid?: string;
  tip?: string;
  muscles: MuscleGroup[];
};

export type WorkoutDay = {
  id: 1 | 2 | 3;
  title: string;
  subtitle: string;
  exercises: Exercise[];
};

export const PLAN_META = {
  name: "Trainer routine",
  sets: 3,
  reps: 15,
  weightRule:
    "Last few reps should be hard with clean form. Easy 15 → bump the load. Can't hit 12–15 clean → drop it. Controlled movement beats heavy weight.",
} as const;

export const DAYS: WorkoutDay[] = [
  {
    id: 1,
    title: "Legs + shoulders",
    subtitle: "Quads, glutes, delts, traps",
    exercises: [
      {
        id: "leg-press",
        name: "Leg press",
        sets: 3,
        reps: 15,
        focus: "Quads, glutes, hamstrings",
        muscles: ["legs"],
        steps: [
          "Sit with back and head against the pad.",
          "Feet about shoulder-width apart.",
          "Lower until knees are comfortably bent.",
          "Push through the whole foot to return.",
          "Don't lock the knees at the top.",
        ],
        avoid: "Knees collapsing inward.",
      },
      {
        id: "leg-curl",
        name: "Leg curl",
        sets: 3,
        reps: 15,
        focus: "Hamstrings",
        muscles: ["legs"],
        steps: [
          "Keep hips against the seat.",
          "Curl heels toward the body.",
          "Squeeze the hamstrings.",
          "Return slowly.",
        ],
        avoid: "Swinging the weight.",
      },
      {
        id: "leg-extension",
        name: "Leg extension",
        sets: 3,
        reps: 15,
        focus: "Quads",
        muscles: ["legs"],
        steps: [
          "Sit firmly against the backrest.",
          "Ankles behind the pad.",
          "Extend until almost straight.",
          "Squeeze the quads, then lower slowly.",
        ],
        avoid: "Throwing the weight up.",
      },
      {
        id: "inner-thigh",
        name: "Inner thigh",
        sets: 3,
        reps: 15,
        focus: "Inner thighs / adductors",
        muscles: ["legs"],
        steps: [
          "Sit with legs against the pads.",
          "Bring legs together under control.",
          "Pause briefly, then return slowly.",
        ],
      },
      {
        id: "outer-thigh",
        name: "Outer thigh",
        sets: 3,
        reps: 15,
        focus: "Glutes and outer hip",
        muscles: ["legs"],
        steps: [
          "Sit upright.",
          "Push knees outward.",
          "Pause and squeeze, then return slowly.",
        ],
      },
      {
        id: "side-raise",
        name: "Side raise",
        sets: 3,
        reps: 15,
        focus: "Side delts",
        muscles: ["shoulders"],
        steps: [
          "Stand tall with dumbbells at your sides.",
          "Raise arms sideways to about shoulder height.",
          "Lower slowly.",
        ],
        avoid: "Swinging the dumbbells.",
      },
      {
        id: "front-raise",
        name: "Front raise",
        sets: 3,
        reps: 15,
        focus: "Front delts",
        muscles: ["shoulders"],
        steps: [
          "Hold dumbbells in front of the thighs.",
          "Raise one or both arms forward to about shoulder height.",
          "Lower slowly.",
        ],
        avoid: "Leaning backward.",
      },
      {
        id: "front-shoulder-press",
        name: "Front shoulder press",
        sets: 3,
        reps: 15,
        focus: "Shoulders / triceps",
        muscles: ["shoulders", "triceps"],
        steps: [
          "Seat so handles start near shoulder level.",
          "Press up without slamming the elbows locked.",
          "Lower under control.",
        ],
      },
      {
        id: "face-pull",
        name: "Face pull",
        sets: 3,
        reps: 15,
        focus: "Rear delts, upper back",
        muscles: ["shoulders", "back"],
        steps: [
          "Cable around face height.",
          "Pull the rope toward the face with elbows high.",
          "Hands finish near the sides of the face.",
          "Return slowly.",
        ],
        tip: 'Think "pull apart," not "pull to chest."',
      },
      {
        id: "shrugs",
        name: "Shrugs",
        sets: 3,
        reps: 15,
        focus: "Traps",
        muscles: ["shoulders", "back"],
        steps: [
          "Weights beside the body.",
          "Raise shoulders straight up, pause, lower slowly.",
        ],
        avoid: "Rolling the shoulders in circles.",
      },
      {
        id: "shoulder-raise-machine",
        name: "Shoulder raise machine",
        sets: 3,
        reps: 15,
        focus: "Side delts",
        muscles: ["shoulders"],
        steps: [
          "Sit upright, upper arms against the pads.",
          "Raise out to shoulder height, pause.",
          "Lower slowly under control.",
        ],
        avoid: "Shrugging to help the lift.",
      },
      {
        id: "glute-kickback",
        name: "Glute kickback",
        sets: 3,
        reps: 15,
        focus: "Glutes",
        muscles: ["legs"],
        steps: [
          "Brace on the handles, core tight.",
          "Push the leg back and up, squeeze the glute.",
          "Return slowly without arching the lower back.",
        ],
        avoid: "Using momentum instead of the glute.",
      },
      {
        id: "smith-machine-squat",
        name: "Smith machine squat",
        sets: 3,
        reps: 15,
        focus: "Quads, glutes",
        muscles: ["legs"],
        steps: [
          "Bar racked at about upper-chest height.",
          "Feet slightly forward, unrack and brace.",
          "Squat to a comfortable depth, drive back up.",
        ],
        avoid: "Letting the knees cave inward.",
      },
    ],
  },
  {
    id: 2,
    title: "Chest + triceps",
    subtitle: "Press, fly, dips, isolation",
    exercises: [
      {
        id: "incline-db-press",
        name: "Incline DB press",
        sets: 3,
        reps: 15,
        focus: "Upper chest",
        muscles: ["chest"],
        steps: [
          "Moderate incline.",
          "Start near upper chest.",
          "Press up and slightly in, lower under control.",
        ],
      },
      {
        id: "chest-press",
        name: "Chest press",
        sets: 3,
        reps: 15,
        focus: "Chest, triceps",
        muscles: ["chest", "triceps"],
        steps: [
          "Handles roughly mid-chest.",
          "Push forward without letting shoulders roll forward.",
          "Return slowly.",
        ],
      },
      {
        id: "machine-fly",
        name: "Machine fly",
        sets: 3,
        reps: 15,
        focus: "Chest",
        muscles: ["chest"],
        steps: [
          "Back against the pad.",
          "Bring handles together, squeeze the chest.",
          "Open slowly.",
        ],
        avoid: "Overstretching or using momentum.",
      },
      {
        id: "chest-dips",
        name: "Chest dips",
        sets: 3,
        reps: 15,
        focus: "Lower chest + triceps",
        muscles: ["chest", "triceps"],
        steps: [
          "Lean slightly forward.",
          "Lower under control, push back up.",
          "Keep shoulders stable.",
        ],
      },
      {
        id: "pull-over",
        name: "Pull-over",
        sets: 3,
        reps: 15,
        focus: "Chest + lats",
        muscles: ["chest", "back"],
        steps: [
          "Lie on a bench, one dumbbell above the chest.",
          "Move it slowly behind the head, then pull back over the chest.",
        ],
        avoid: "Going deeper than your shoulders allow.",
      },
      {
        id: "overhead-extension",
        name: "Overhead extension",
        sets: 3,
        reps: 15,
        focus: "Triceps (long head)",
        muscles: ["triceps"],
        steps: [
          "Elbows pointed forward.",
          "Extend, squeeze triceps, return slowly.",
        ],
      },
      {
        id: "push-down",
        name: "Push-down",
        sets: 3,
        reps: 15,
        focus: "Triceps",
        muscles: ["triceps"],
        steps: [
          "Elbows close to the body.",
          "Push down, fully contract, return slowly.",
        ],
        avoid: "Elbows drifting forward and back.",
      },
      {
        id: "triceps-dips",
        name: "Triceps dips",
        sets: 3,
        reps: 15,
        focus: "Triceps",
        muscles: ["triceps"],
        steps: [
          "Torso relatively upright.",
          "Bend elbows to lower, push through the palms.",
          "Don't drop excessively deep.",
        ],
      },
      {
        id: "triceps-machine-extension",
        name: "Triceps machine extension",
        sets: 3,
        reps: 15,
        focus: "Triceps",
        muscles: ["triceps"],
        steps: [
          "Upper arms braced against the pad.",
          "Extend the arms fully, squeeze the triceps.",
          "Return under control.",
        ],
        avoid: "Flaring the elbows out.",
      },
    ],
  },
  {
    id: 3,
    title: "Back + biceps",
    subtitle: "Rows, pulldowns, curls",
    exercises: [
      {
        id: "t-bar-row",
        name: "T-bar row",
        sets: 3,
        reps: 15,
        focus: "Mid-back, lats",
        muscles: ["back"],
        steps: [
          "Neutral spine, hinge from the hips.",
          "Pull toward lower chest / upper abs.",
          "Squeeze the back, lower slowly.",
        ],
      },
      {
        id: "front-lat-pulldown",
        name: "Front lat pulldown",
        sets: 3,
        reps: 15,
        focus: "Lats",
        muscles: ["back"],
        steps: [
          "Grip slightly wider than shoulders.",
          "Pull to upper chest with chest up.",
          "Release slowly.",
        ],
        avoid: "Pulling behind the neck.",
      },
      {
        id: "power-rack-chinup",
        name: "Power rack chin-up",
        sets: 3,
        reps: 15,
        focus: "Lats, biceps",
        muscles: ["back", "biceps"],
        steps: [
          "Grip the pull-up bar at the top of the rack, palms facing you.",
          "Pull your chin over the bar, squeeze the lats.",
          "Lower under control to a full hang.",
        ],
        avoid: "Kipping or swinging for momentum.",
      },
      {
        id: "v-bar-row",
        name: "V-bar row",
        sets: 3,
        reps: 15,
        focus: "Mid-back / lats",
        muscles: ["back"],
        steps: [
          "Sit upright, knees slightly bent.",
          "Pull V-handle to the abdomen.",
          "Squeeze shoulder blades, return slowly.",
        ],
      },
      {
        id: "single-arm-low-row",
        name: "Single-arm low row",
        sets: 3,
        reps: 15,
        focus: "Lats + mid-back",
        muscles: ["back"],
        steps: [
          "Torso stable.",
          "Pull one arm toward the hip without rotating the whole body.",
          "Return slowly.",
        ],
      },
      {
        id: "hyperextension",
        name: "Hyperextension",
        sets: 3,
        reps: 15,
        focus: "Lower back, glutes, hamstrings",
        muscles: ["back", "legs", "core"],
        steps: [
          "Hips secure on the pad, spine neutral.",
          "Lower the torso, then raise until roughly straight.",
        ],
        avoid: "Excessive backward bend.",
      },
      {
        id: "barbell-curl",
        name: "Barbell curl",
        sets: 3,
        reps: 15,
        focus: "Biceps",
        muscles: ["biceps"],
        steps: [
          "Elbows near the sides.",
          "Curl up, squeeze, lower slowly.",
        ],
        avoid: "Swinging the body.",
      },
      {
        id: "preacher-curl",
        name: "Preacher curl",
        sets: 3,
        reps: 15,
        focus: "Biceps",
        muscles: ["biceps"],
        steps: [
          "Upper arms firm on the pad.",
          "Curl up, squeeze, lower under control.",
        ],
        avoid: "Slamming into full elbow lockout.",
      },
      {
        id: "hammer-curl",
        name: "Hammer curl",
        sets: 3,
        reps: 15,
        focus: "Biceps + brachialis / forearms",
        muscles: ["biceps"],
        steps: [
          "Palms facing each other.",
          "Curl up with elbows close, lower slowly.",
        ],
      },
      {
        id: "biceps-machine-curl",
        name: "Biceps machine curl",
        sets: 3,
        reps: 15,
        focus: "Biceps",
        muscles: ["biceps"],
        steps: [
          "Upper arms flat on the pad, elbows aligned with the pivot.",
          "Curl the handles up, squeeze at the top.",
          "Lower slowly — don't let the stack drop.",
        ],
      },
      {
        id: "ab-machine-crunch",
        name: "Ab machine crunch",
        sets: 3,
        reps: 15,
        focus: "Abs",
        muscles: ["core"],
        steps: [
          "Sit with the pad against your upper chest, feet secured.",
          "Crunch forward, squeeze the abs at the bottom.",
          "Return slowly — don't let momentum do the work.",
        ],
      },
      {
        id: "waist-rotary",
        name: "Waist rotary",
        sets: 3,
        reps: 15,
        focus: "Obliques / core",
        muscles: ["core"],
        steps: [
          "Sit tall, hips square and stable.",
          "Rotate the torso under control to one side, then the other.",
          "Keep the movement smooth — don't jerk into the turn.",
        ],
        avoid: "Using the arms to yank the rotation.",
      },
    ],
  },
];

export function getDay(id: number): WorkoutDay | undefined {
  return DAYS.find((d) => d.id === id);
}

export function getExercise(
  dayId: number,
  exerciseId: string,
): Exercise | undefined {
  return getDay(dayId)?.exercises.find((e) => e.id === exerciseId);
}
