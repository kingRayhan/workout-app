import type { Exercise } from "./plan";

export type AerobicGroupId = "open" | "disc" | "hard" | "rope";

/** A floor move. `videoHint` explains how the gym version uses the clip. */
export type AerobicExercise = Exercise & {
  videoHint?: string;
};

export type AerobicGroup = {
  id: AerobicGroupId;
  label: string;
  blurb: string;
  exercises: AerobicExercise[];
};

function round(
  exercise: Omit<AerobicExercise, "sets" | "reps" | "cardio"> & { durationMin?: number },
): AerobicExercise {
  const { durationMin = 1, ...rest } = exercise;
  return { ...rest, sets: 1, reps: 1, cardio: { durationMin } };
}

/**
 * Floor aerobics, including the light-plate rounds a gym class actually runs.
 * Kept out of `CARDIO_EXERCISES` so machine cardio and the mobile logger stay unchanged.
 */
export const AEROBIC_GROUPS: AerobicGroup[] = [
  {
    id: "open",
    label: "Open hand",
    blurb: "No plate. This is the warm-up block before the disc comes out.",
    exercises: [
      round({
        id: "step-touch",
        name: "Step touch",
        focus: "Easy side step to start the round",
        muscles: ["cardio"],
        steps: [
          "Stand tall, feet together.",
          "Step one foot out to the side and tap the other foot next to it.",
          "Step back the other way.",
          "Let the arms swing with the step.",
          "Keep it easy for about 30 seconds, then move on.",
        ],
        avoid: "Leaning the whole body over the stepping foot.",
        tip: "Stay on the balls of the feet so the tap stays light.",
      }),
      round({
        id: "jumping-jack",
        name: "Jumping jacks",
        focus: "Full-body warm-up, empty hands",
        muscles: ["cardio"],
        steps: [
          "Stand tall, feet together, arms at your sides.",
          "Jump the feet out wide as the arms swing up overhead.",
          "Jump back to the start.",
          "Land softly on the balls of the feet, knees slightly bent.",
          "Work 20–30 seconds, then rest the same amount.",
        ],
        avoid: "Locking the knees on the landing, or slapping the feet down.",
        tip: "Step the feet out if you want the same pattern with less impact.",
      }),
      round({
        id: "high-knees",
        name: "High knees",
        focus: "Quick knees, heart rate up",
        muscles: ["cardio", "legs"],
        steps: [
          "Stand tall and jog in place.",
          "Drive one knee up toward hip height, then the other.",
          "Pump the opposite arm with each knee.",
          "Stay on the balls of the feet.",
          "Work 20–30 seconds. Lift the knees lower if you need to.",
        ],
        avoid: "Leaning back, or kicking the heels up behind you.",
        tip: "A hand at hip height gives you a target for the knee.",
      }),
      round({
        id: "butt-kicks",
        name: "Butt kicks",
        focus: "Heels to the glutes, light on the feet",
        muscles: ["cardio", "legs"],
        steps: [
          "Jog in place with a tall chest.",
          "Kick one heel up toward the glute, then the other.",
          "Keep the knees pointing down, not swinging forward.",
          "Arms stay loose.",
          "Work 20–30 seconds.",
        ],
        avoid: "Arching the lower back to reach the heel.",
        tip: "Think of flicking the heel up, not throwing the whole leg.",
      }),
      round({
        id: "bodyweight-squat",
        name: "Bodyweight squat",
        focus: "Legs and glutes, no plate",
        muscles: ["legs", "core"],
        steps: [
          "Stand with feet about shoulder width, toes turned slightly out.",
          "Reach both arms forward for balance.",
          "Sit the hips back and down until the thighs are near parallel.",
          "Drive through the whole foot to stand tall.",
          "Work about 30 seconds, or 10 slow reps, then rest.",
        ],
        avoid: "Letting the knees cave in, or dropping the chest toward the floor.",
        tip: "If the heels lift, turn the toes out a little more and sit back.",
      }),
    ],
  },
  {
    id: "disc",
    label: "With a disc",
    blurb: "A light plate, usually 2.5 kg to start. Hold it with both hands unless the move says otherwise.",
    exercises: [
      round({
        id: "disc-jumping-jack",
        name: "Disc jumping jack",
        focus: "Jumping jack with a plate at the chest",
        muscles: ["cardio", "core"],
        videoHint: "Keep the plate at your chest. The feet jump the same way as this clip.",
        steps: [
          "Hold a light plate with both hands in front of your chest, elbows in.",
          "Start with the feet together.",
          "Jump the feet out wide. The plate stays at the chest.",
          "Jump the feet back in.",
          "Land softly. Work 20–30 seconds.",
        ],
        avoid: "Throwing the plate overhead, or letting it pull you forward.",
        tip: "If the coach calls the overhead version, lift the plate as the feet go out and bring it back to the chest as the feet come in.",
      }),
      round({
        id: "disc-squat",
        name: "Disc squat",
        focus: "Squat with the plate held at the chest",
        muscles: ["legs", "core"],
        videoHint: "Hold your plate at the chest, the same place as the weight in this clip.",
        steps: [
          "Hold the plate with both hands at your chest, close to the body.",
          "Feet about shoulder width, toes slightly out.",
          "Sit the hips back and down. The plate stays at the chest.",
          "Drive through the whole foot to stand.",
          "Work about 30 seconds, or 10 slow reps.",
        ],
        avoid: "Pushing the plate away from the chest, or letting the knees cave in.",
        tip: "A heavier plate makes the squat harder. Stay with a light one until the depth is easy.",
      }),
      round({
        id: "disc-front-raise",
        name: "Disc front raise",
        focus: "Shoulders, plate lifts to shoulder height",
        muscles: ["shoulders"],
        steps: [
          "Hold the plate with both hands in front of the thighs, arms almost straight.",
          "Lift the plate to shoulder height. Elbows stay soft.",
          "Lower it back to the thighs with control.",
          "Keep the ribs down so the lower back does not arch.",
          "Work 10–15 slow reps.",
        ],
        avoid: "Swinging the plate up with the hips, or lifting it past the shoulders.",
        tip: "If the shoulders shrug toward the ears, use a lighter plate.",
      }),
      round({
        id: "disc-press",
        name: "Disc press",
        focus: "Press the plate from the chest to overhead",
        muscles: ["shoulders", "triceps"],
        steps: [
          "Hold the plate at your chest, both hands on the rim or the faces.",
          "Brace the stomach and press the plate overhead until the arms are straight.",
          "Lower it back to the chest.",
          "Keep the ribs stacked over the hips.",
          "Work 10–15 reps.",
        ],
        avoid: "Flaring the ribs and leaning back to get the plate up.",
        tip: "Finish with the plate over the shoulders, not out in front of the face.",
      }),
      round({
        id: "disc-twist",
        name: "Disc twist",
        focus: "Waist turns with the plate at the chest",
        muscles: ["core"],
        steps: [
          "Hold the plate at your chest. Feet about hip width.",
          "Turn the shoulders to one side. Hips stay facing forward.",
          "Come back to the middle, then turn the other way.",
          "The plate moves with the chest, not as a swing.",
          "Work 20–30 seconds, smooth turns.",
        ],
        avoid: "Yanking the plate around, or letting the knees twist with it.",
        tip: "A small bend in the knees makes it easier to keep the hips still.",
      }),
      round({
        id: "disc-side-bend",
        name: "Disc side bend",
        focus: "Side bend with the plate overhead",
        muscles: ["core"],
        steps: [
          "Hold the plate overhead with both hands, arms straight.",
          "Bend slowly to one side until you feel the opposite side of the waist.",
          "Come back to tall, then bend the other way.",
          "Keep the plate stacked over the shoulders.",
          "Work 8–10 bends each side.",
        ],
        avoid: "Bending forward, or dropping the plate in front of the face.",
        tip: "If overhead feels shaky, hold the plate at the chest and do the same side bend.",
      }),
      round({
        id: "disc-lunge",
        name: "Disc lunge",
        focus: "Forward lunge, plate at the chest",
        muscles: ["legs", "core"],
        steps: [
          "Hold the plate at your chest.",
          "Step one foot forward and lower the back knee toward the floor.",
          "Front knee stays over the ankle.",
          "Push through the front foot to stand, then switch legs.",
          "Work 8–10 steps each side.",
        ],
        avoid: "Letting the front knee shoot far past the toes, or dropping the plate.",
        tip: "A shorter step is fine. The chest stays up because the plate is there.",
      }),
    ],
  },
  {
    id: "hard",
    label: "Harder",
    blurb: "Short bursts after the disc block. Stop a rep early if your form falls apart.",
    exercises: [
      round({
        id: "mountain-climber",
        name: "Mountain climber",
        focus: "Plank with quick knees",
        muscles: ["core", "cardio"],
        steps: [
          "Set your hands under the shoulders and step back to a straight plank.",
          "Drive one knee toward the chest, then switch.",
          "Hips stay level. Don't bounce them up.",
          "Keep the hands planted.",
          "Work 20–30 seconds.",
        ],
        avoid: "Letting the hips sag, or hopping both feet at once.",
        tip: "Slow the knees down if the plank starts to break.",
      }),
      round({
        id: "burpee",
        name: "Burpee",
        focus: "Full body, short and hard",
        muscles: ["cardio", "legs", "core"],
        steps: [
          "Stand, then squat and place both hands on the floor.",
          "Jump or step the feet back into a straight plank.",
          "Jump or step the feet back in toward the hands.",
          "Stand and reach overhead.",
          "Work 20–30 seconds. Step the feet if the jump feels too hard.",
        ],
        avoid: "Letting the hips sag in the plank, or rushing so the hands miss the floor.",
        tip: "Skip the push-up and the jump until the squat-to-plank part feels smooth.",
      }),
    ],
  },
  {
    id: "rope",
    label: "Rope",
    blurb: "Needs a rope. Same idea as the other rounds: short work, then rest.",
    exercises: [
      round({
        id: "jump-rope",
        name: "Jump rope",
        durationMin: 2,
        focus: "Cardio with a rope",
        muscles: ["cardio", "legs"],
        steps: [
          "Hold the handles with a relaxed grip, rope resting behind the heels.",
          "Turn the rope with the wrists, not the shoulders.",
          "Jump just high enough to clear the rope, one bounce per turn.",
          "Stay on the balls of the feet, elbows close to the ribs.",
          "Start with 30–60 seconds and rest as long as you need.",
        ],
        avoid: "Donkey-kicking the heels back, or swinging the arms in big circles.",
        tip: "If you trip, shorten the rope until the handles reach your armpits when you stand on the middle.",
      }),
    ],
  },
];

export const AEROBIC_EXERCISES: AerobicExercise[] = AEROBIC_GROUPS.flatMap((group) => group.exercises);

const BY_ID = new Map(AEROBIC_EXERCISES.map((exercise) => [exercise.id, exercise]));

export function getAerobicExercise(id: string): AerobicExercise | undefined {
  return BY_ID.get(id);
}

export function getAerobicGroup(exerciseId: string): AerobicGroup | undefined {
  return AEROBIC_GROUPS.find((group) => group.exercises.some((exercise) => exercise.id === exerciseId));
}
