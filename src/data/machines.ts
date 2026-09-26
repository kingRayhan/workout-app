export type Machine = {
  id: string;
  name: string;
  aka?: string;
  image: string;
  howToFind: string;
  setup: string[];
  usedBy: string[];
};

export const MACHINES: Machine[] = [
  {
    id: "leg-press",
    name: "Leg press",
    aka: "45° sled",
    image: "/machines/leg-press.jpg",
    howToFind: "Large sled with a backrest and a big footplate. You sit and push the plate away.",
    setup: [
      "Adjust the seat so knees start comfortably bent.",
      "Feet about shoulder-width on the plate.",
      "Keep lower back and head against the pad.",
    ],
    usedBy: ["leg-press"],
  },
  {
    id: "leg-curl",
    name: "Leg curl",
    aka: "Seated or lying hamstring curl",
    image: "/machines/leg-curl.jpg",
    howToFind: "Machine with a pad behind the ankles/calves. You curl heels toward the body.",
    setup: [
      "Align knees with the machine’s pivot.",
      "Pad sits just above the heels.",
      "Hips stay pressed into the seat.",
    ],
    usedBy: ["leg-curl"],
  },
  {
    id: "leg-extension",
    name: "Leg extension",
    image: "/machines/leg-extension.jpg",
    howToFind: "Seated machine with a pad on the shins. You straighten the legs.",
    setup: [
      "Back firm against the pad.",
      "Ankles behind the roller pad.",
      "Extend until almost straight — don’t slam lockout.",
    ],
    usedBy: ["leg-extension"],
  },
  {
    id: "inner-thigh",
    name: "Inner thigh",
    aka: "Hip adduction",
    image: "/machines/inner-thigh.jpg",
    howToFind:
      "Seated machine with pads on the thighs. Adductor = squeeze inward; abductor = push outward. Same family of machines.",
    setup: [
      "Sit upright, pads against outer thighs.",
      "Start from a comfortable open position.",
      "Bring legs together, pause, return slowly.",
    ],
    usedBy: ["inner-thigh"],
  },
  {
    id: "outer-thigh",
    name: "Outer thigh",
    aka: "Hip abduction",
    image: "/machines/outer-thigh.jpg",
    howToFind: "Seated machine with pads on the inside of the thighs. You push the knees outward.",
    setup: [
      "Sit upright, pads against inner thighs.",
      "Push knees out under control.",
      "Pause and squeeze, then return.",
    ],
    usedBy: ["outer-thigh"],
  },
  {
    id: "dumbbells",
    name: "Dumbbells",
    image: "/machines/dumbbells.jpg",
    howToFind: "Free-weight rack. Pick a pair you can finish 12–15 clean reps with.",
    setup: [
      "Stand or sit tall — no swinging.",
      "Wrists neutral, elbows soft.",
      "Last reps should feel hard with clean form.",
    ],
    usedBy: [
      "side-raise",
      "front-raise",
      "shrugs",
      "incline-db-press",
      "pull-over",
      "hammer-curl",
    ],
  },
  {
    id: "shoulder-press",
    name: "Shoulder press machine",
    aka: "Front shoulder press",
    image: "/machines/shoulder-press.jpg",
    howToFind: "Seated press with handles starting near shoulder height.",
    setup: [
      "Seat so handles begin at about ear/shoulder level.",
      "Press up without slamming elbows locked.",
      "Lower under control.",
    ],
    usedBy: ["front-shoulder-press"],
  },
  {
    id: "cable-station",
    name: "Cable station",
    aka: "Cable crossover / dual pulley",
    image: "/machines/cable-station.jpg",
    howToFind: "Tall towers with adjustable pulleys. Use rope or straight bar attachments.",
    setup: [
      "Set pulley height for the move (face-height for face pulls, high for push-downs).",
      "Stand or kneel so the cable stays in line with the muscle.",
      "Control the return — don’t let the stack slam.",
    ],
    usedBy: ["face-pull", "overhead-extension", "push-down", "single-arm-low-row"],
  },
  {
    id: "chest-press",
    name: "Chest press machine",
    image: "/machines/chest-press.jpg",
    howToFind: "Seated press with handles roughly at mid-chest.",
    setup: [
      "Handles about mid-chest height.",
      "Shoulders stay packed — don’t roll forward.",
      "Push forward, return slowly.",
    ],
    usedBy: ["chest-press"],
  },
  {
    id: "machine-fly",
    name: "Machine fly",
    aka: "Pec deck",
    image: "/machines/machine-fly.jpg",
    howToFind: "Seated chest machine with arm pads or handles that arc together in front of you.",
    setup: [
      "Back flat on the pad.",
      "Bring arms together and squeeze the chest.",
      "Open slowly — don’t overstretch.",
    ],
    usedBy: ["machine-fly"],
  },
  {
    id: "dip-station",
    name: "Dip station",
    aka: "Parallel bars / P-dips",
    image: "/machines/dip-station.jpg",
    howToFind: "Two parallel bars you support your body on.",
    setup: [
      "Chest dips: lean slightly forward.",
      "Triceps dips: torso more upright.",
      "Don’t drop excessively deep — keep shoulders stable.",
    ],
    usedBy: ["chest-dips", "triceps-dips"],
  },
  {
    id: "incline-bench",
    name: "Incline bench",
    image: "/machines/incline-bench.jpg",
    howToFind: "Adjustable bench set to a moderate incline (about 30–45°).",
    setup: [
      "Moderate incline — not almost upright.",
      "Feet planted, shoulder blades on the pad.",
      "Used with dumbbells for incline press.",
    ],
    usedBy: ["incline-db-press"],
  },
  {
    id: "flat-bench",
    name: "Flat bench",
    image: "/machines/flat-bench.jpg",
    howToFind: "Flat pad bench. Used for pull-overs and some free-weight work.",
    setup: [
      "Lie with feet on the floor.",
      "For pull-over: one dumbbell above the chest.",
      "Don’t go deeper than shoulders allow.",
    ],
    usedBy: ["pull-over"],
  },
  {
    id: "t-bar-row",
    name: "T-bar row",
    aka: "Landmine / chest-supported T-bar",
    image: "/machines/t-bar-row.jpg",
    howToFind: "Bar pivoted at one end, or a chest-supported T-bar station.",
    setup: [
      "Neutral spine, hinge from the hips.",
      "Pull toward lower chest / upper abs.",
      "Squeeze the back, lower slowly.",
    ],
    usedBy: ["t-bar-row"],
  },
  {
    id: "lat-pulldown",
    name: "Lat pulldown",
    image: "/machines/lat-pulldown.jpg",
    howToFind: "Seated cable with a wide bar overhead and thigh pads.",
    setup: [
      "Grip slightly wider than shoulders.",
      "Pull to upper chest with chest up.",
      "Never pull behind the neck.",
    ],
    usedBy: ["front-lat-pulldown"],
  },
  {
    id: "seated-row",
    name: "Seated row",
    aka: "V-bar / low row",
    image: "/machines/seated-row.jpg",
    howToFind: "Seated cable or lever row with a V-handle or dual handles.",
    setup: [
      "Sit upright, knees soft.",
      "Pull to the abdomen / hip.",
      "Squeeze shoulder blades, return slowly.",
    ],
    usedBy: ["v-bar-row", "single-arm-low-row"],
  },
  {
    id: "hyperextension",
    name: "Hyperextension bench",
    aka: "45° back extension / Roman chair",
    image: "/machines/hyperextension.jpg",
    howToFind: "Angled bench with thigh pads and ankle hooks. You hinge at the hips.",
    setup: [
      "Hips on the pad, ankles locked in.",
      "Spine neutral — raise until roughly straight.",
      "Avoid excessive backward bend.",
    ],
    usedBy: ["hyperextension"],
  },
  {
    id: "barbell",
    name: "Barbell",
    image: "/machines/barbell.jpg",
    howToFind: "Straight Olympic bar from the rack.",
    setup: [
      "Elbows near the sides for curls.",
      "No hip swing — control the weight.",
      "Lower slowly after the squeeze.",
    ],
    usedBy: ["barbell-curl"],
  },
  {
    id: "preacher-curl",
    name: "Preacher curl bench",
    image: "/machines/preacher-curl.jpg",
    howToFind: "Angled arm pad (Scott bench) with a seat — often paired with an EZ bar.",
    setup: [
      "Upper arms firm on the pad.",
      "Curl up, squeeze, lower under control.",
      "Don’t slam into full elbow lockout.",
    ],
    usedBy: ["preacher-curl"],
  },
];

export function getMachine(id: string): Machine | undefined {
  return MACHINES.find((m) => m.id === id);
}

export function getMachineForExercise(exerciseId: string): Machine | undefined {
  return MACHINES.find((m) => m.usedBy.includes(exerciseId));
}
