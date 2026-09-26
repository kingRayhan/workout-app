export type ExerciseExtra = {
  why: string;
  breathing: string;
  tempo: string;
  cautions: string[];
  mistakes: string[];
};

/** Extra coaching copy keyed by exercise id from `plan.ts`. */
export const EXERCISE_EXTRA: Record<string, ExerciseExtra> = {
  "leg-press": {
    why: "Builds quads, glutes, and hamstrings with a supported back — good volume without loading the spine like a squat.",
    breathing: "Inhale as you lower. Exhale as you press the plate away.",
    tempo: "2 sec down · brief pause · 1–2 sec up. No bouncing at the bottom.",
    cautions: [
      "Never lock the knees hard at the top — keep a soft bend.",
      "If your lower back peels off the pad, shorten the range.",
      "Use the safety stops; know where they are before you load heavy.",
    ],
    mistakes: [
      "Knees caving inward",
      "Heels lifting off the plate",
      "Partial reps that never reach a comfortable bend",
    ],
  },
  "leg-curl": {
    why: "Isolates the hamstrings — balances the quads from presses and extensions.",
    breathing: "Exhale as you curl. Inhale as you lower.",
    tempo: "Squeeze 1 sec at the top · 2–3 sec lower.",
    cautions: [
      "Keep hips glued to the pad the whole set.",
      "Stop if you feel a sharp pull behind the knee.",
      "Don't hyperextend the knees at the bottom.",
    ],
    mistakes: ["Swinging the weight", "Lifting hips to cheat", "Rushing the eccentric"],
  },
  "leg-extension": {
    why: "Targets the quads through a long range — finish with control, not lockout slam.",
    breathing: "Exhale as you extend. Inhale as you lower.",
    tempo: "Squeeze at the top · 2 sec lower.",
    cautions: [
      "Don't slam into full knee lockout — stop just short.",
      "If the knee feels pinchy, reduce load or range.",
      "Keep the back pressed into the pad.",
    ],
    mistakes: ["Throwing the weight up", "Using momentum", "Letting the stack crash"],
  },
  "inner-thigh": {
    why: "Trains adductors for hip stability and balanced leg development.",
    breathing: "Exhale as you squeeze in. Inhale as you open.",
    tempo: "Pause 1 sec when legs meet · return slowly.",
    cautions: [
      "Don't force a huge stretch on the first reps — warm into range.",
      "Stay upright; don't collapse the torso forward.",
      "Stop if you feel groin sharp pain (vs. muscle burn).",
    ],
    mistakes: ["Using too much weight and bouncing", "Rushing the open phase"],
  },
  "outer-thigh": {
    why: "Hits glute medius / outer hip — helps knee tracking and hip stability.",
    breathing: "Exhale as you push out. Inhale as you return.",
    tempo: "Pause and squeeze at the outside · slow return.",
    cautions: [
      "Keep the seat upright — don't lean back to cheat.",
      "Push through the pads with the thighs, not by twisting the torso.",
    ],
    mistakes: ["Partial outsides only", "Letting the stack yank you back"],
  },
  "side-raise": {
    why: "Builds the side delts for shoulder width — light weight, strict path.",
    breathing: "Exhale as you raise. Inhale as you lower.",
    tempo: "1–2 sec up to shoulder height · 2–3 sec down.",
    cautions: [
      "Stop at about shoulder height — going higher often shrugging traps.",
      "Soft elbows; don't lock arms straight.",
      "If shoulders ache at the top, shorten the arc slightly.",
    ],
    mistakes: ["Swinging / using hips", "Shrugging every rep", "Too heavy, too soon"],
  },
  "front-raise": {
    why: "Emphasizes the front delts — keep the torso still.",
    breathing: "Exhale raise · inhale lower.",
    tempo: "Controlled to shoulder height · slow lower.",
    cautions: [
      "Don't lean back to lift the weight.",
      "Avoid locking the elbows fully straight.",
      "Alternate arms if bilateral feels unstable.",
    ],
    mistakes: ["Leaning backward", "Swinging from the hips", "Going way above head height"],
  },
  "front-shoulder-press": {
    why: "Overhead strength for delts and triceps with machine support.",
    breathing: "Exhale press · inhale lower.",
    tempo: "Press smooth · lower under control — no bounce.",
    cautions: [
      "Don't slam elbows into lockout at the top.",
      "Keep ribs down — don't arch the low back hard.",
      "Handles should start near shoulder / ear height.",
    ],
    mistakes: ["Arching the back", "Partial presses only", "Bouncing off the bottom"],
  },
  "face-pull": {
    why: "Rear delts and upper back — balances pressing and helps shoulder health.",
    breathing: "Exhale pull · inhale return.",
    tempo: "Pull apart to the face · 2 sec return.",
    cautions: [
      "Elbows stay high — this is not a chest row.",
      "Don't yank the neck forward into the rope.",
      "Use a load you can control for all 15 reps.",
    ],
    mistakes: ['Pulling to the chest', "Elbows dropping low", "Using too much weight"],
  },
  shrugs: {
    why: "Isolates the traps — straight up and down only.",
    breathing: "Exhale shrug · inhale lower.",
    tempo: "Pause 1 sec at the top · slow lower.",
    cautions: [
      "Never roll the shoulders in circles under load.",
      "Keep arms long — don't bend elbows into a row.",
      "Neck stays neutral; don't jut the chin.",
    ],
    mistakes: ["Rolling shoulders", "Using bounce", "Turning it into a upright row"],
  },
  "incline-db-press": {
    why: "Upper-chest focus on a moderate incline with dumbbells.",
    breathing: "Inhale lower · exhale press.",
    tempo: "2 sec lower to upper chest · press up and slightly in.",
    cautions: [
      "Moderate incline (about 30–45°) — too steep becomes a shoulder press.",
      "Don't flare elbows extremely wide if shoulders complain.",
      "Control the dumbbells at the bottom; don't bounce off the chest.",
    ],
    mistakes: ["Incline too steep", "Flaring and pinching shoulders", "Uneven lockout"],
  },
  "chest-press": {
    why: "Machine press for chest and triceps with a stable path.",
    breathing: "Exhale press · inhale return.",
    tempo: "Smooth press · 2 sec return.",
    cautions: [
      "Don't let shoulders roll forward at the finish.",
      "Keep shoulder blades lightly packed into the pad.",
      "Stop short of painful end-range stretch.",
    ],
    mistakes: ["Shoulders shrugging forward", "Half reps", "Slamming the stack"],
  },
  "machine-fly": {
    why: "Isolates the chest through a hugging motion — feel the squeeze.",
    breathing: "Exhale squeeze in · inhale open.",
    tempo: "Squeeze 1 sec · open slowly without overstretching.",
    cautions: [
      "Don't force a deep stretch that hurts the front of the shoulder.",
      "Soft elbows — locked arms put stress on joints.",
      "Keep the back flat on the pad.",
    ],
    mistakes: ["Overstretching", "Using momentum", "Bending elbows more each rep"],
  },
  "chest-dips": {
    why: "Lower chest and triceps — lean forward to bias chest.",
    breathing: "Inhale lower · exhale press up.",
    tempo: "Controlled lower · strong press — no drop.",
    cautions: [
      "Keep shoulders stable — don't dump into the bottom.",
      "If shoulders hurt deep, shorten range or use assistance.",
      "Lean slightly forward for chest; upright = more triceps.",
    ],
    mistakes: ["Dropping too deep", "Swinging legs", "Shrugging into the ears"],
  },
  "pull-over": {
    why: "Stretches and works chest and lats with one dumbbell arc.",
    breathing: "Inhale as the weight goes back · exhale as you pull over.",
    tempo: "Slow both ways — never yank behind the head.",
    cautions: [
      "Only go as far as shoulders comfortably allow.",
      "Keep a slight bend in the elbows the whole time.",
      "Don't let the low back arch off the bench.",
    ],
    mistakes: ["Going too deep", "Bending elbows into a skull-crusher", "Using a huge dumbbell"],
  },
  "overhead-extension": {
    why: "Long-head triceps emphasis with elbows forward.",
    breathing: "Exhale extend · inhale lower.",
    tempo: "Full extension squeeze · slow return.",
    cautions: [
      "Elbows stay pointed forward — don't flare wildly.",
      "Don't let the cable yank elbows backward.",
      "Keep ribs down; avoid excessive low-back arch.",
    ],
    mistakes: ["Elbows drifting", "Partial lockouts only", "Using momentum"],
  },
  "push-down": {
    why: "Classic triceps finisher — elbows pinned to the sides.",
    breathing: "Exhale push down · inhale return.",
    tempo: "Full contract at bottom · controlled return.",
    cautions: [
      "Elbows stay close to the body — no swinging forward/back.",
      "Don't shrug the shoulders into the ears.",
      "Stop if the elbow joint (not the muscle) hurts.",
    ],
    mistakes: ["Elbows drifting", "Leaning into the stack", "Half reps"],
  },
  "triceps-dips": {
    why: "Triceps-biased dips — torso more upright than chest dips.",
    breathing: "Inhale lower · exhale press.",
    tempo: "Controlled depth · press through the palms.",
    cautions: [
      "Don't drop excessively deep — protect the shoulders.",
      "Keep the torso relatively upright vs. chest dips.",
      "Use assistance or shorter range if you can't control 15 clean reps.",
    ],
    mistakes: ["Excessive depth", "Flaring elbows out of control", "Kipping up"],
  },
  "t-bar-row": {
    why: "Thick mid-back and lat builder — hinge, then row.",
    breathing: "Exhale pull · inhale lower.",
    tempo: "Squeeze the back at the top · 2 sec lower.",
    cautions: [
      "Neutral spine — hinge from the hips, don't round the low back.",
      "Pull to lower chest / upper abs, not the neck.",
      "Don't yank with the lower back.",
    ],
    mistakes: ["Rounding the spine", "Using hip thrust to cheat", "Short-stroking the row"],
  },
  "front-lat-pulldown": {
    why: "Vertical pull for lat width — always to the front.",
    breathing: "Exhale pull · inhale release.",
    tempo: "Pull to upper chest · 2–3 sec release.",
    cautions: [
      "Never pull behind the neck — shoulder injury risk.",
      "Chest up; don't collapse into a crunch.",
      "Control the stack on the way up.",
    ],
    mistakes: ["Behind-the-neck pulls", "Using too much body English", "Partial range"],
  },
  "v-bar-row": {
    why: "Seated horizontal pull for mid-back and lats.",
    breathing: "Exhale pull · inhale return.",
    tempo: "Squeeze shoulder blades · slow return.",
    cautions: [
      "Sit tall — don't round the upper back.",
      "Pull to the abdomen, not up to the chin.",
      "Knees soft; don't lock them out hard.",
    ],
    mistakes: ["Rounding the back", "Leaning too far back to cheat", "Yanking the handle"],
  },
  "single-arm-low-row": {
    why: "Unilateral lat / mid-back work — fixes side-to-side imbalance.",
    breathing: "Exhale pull · inhale return.",
    tempo: "Pull to the hip · slow return — same pace both sides.",
    cautions: [
      "Don't rotate the whole torso to finish the rep.",
      "Keep the working shoulder from shrugging up.",
      "Match reps and load left and right.",
    ],
    mistakes: ["Twisting the body", "Shrugging", "Rushing the weaker side"],
  },
  hyperextension: {
    why: "Posterior chain: lower back, glutes, hamstrings — stop at straight, not past.",
    breathing: "Inhale lower · exhale raise.",
    tempo: "Smooth raise to roughly straight · controlled lower.",
    cautions: [
      "Avoid excessive backward bend at the top — stop near neutral/straight.",
      "Hips stay on the pad; don't slide.",
      "If the low back feels pinchy, shorten range or cross arms on chest (no plate yet).",
    ],
    mistakes: ["Hyperextending hard", "Using momentum", "Rounding on the way down"],
  },
  "barbell-curl": {
    why: "Classic biceps builder — elbows stay put.",
    breathing: "Exhale curl · inhale lower.",
    tempo: "Squeeze at top · 2–3 sec lower.",
    cautions: [
      "Don't swing the hips or lean back.",
      "Elbows stay near the sides — not drifting forward into a front raise.",
      "Full control on the way down; that's where growth happens.",
    ],
    mistakes: ["Body English", "Half curls", "Dropping the bar"],
  },
  "preacher-curl": {
    why: "Strict biceps isolation with arms supported on the pad.",
    breathing: "Exhale curl · inhale lower.",
    tempo: "Squeeze · lower under control — no slam.",
    cautions: [
      "Don't slam into full elbow lockout at the bottom.",
      "Upper arms stay glued to the pad.",
      "Use a load you can control for all 15 — ego curling tears tendons.",
    ],
    mistakes: ["Lockout slam", "Lifting elbows off the pad", "Partial top-only reps"],
  },
  "hammer-curl": {
    why: "Biceps plus brachialis / forearms — palms face each other.",
    breathing: "Exhale curl · inhale lower.",
    tempo: "Controlled up · slow down.",
    cautions: [
      "Elbows stay close; don't swing.",
      "Wrists stay neutral — don't bend them hard.",
      "Same tempo both arms if alternating.",
    ],
    mistakes: ["Swinging", "Turning into a regular curl mid-set", "Rushing reps"],
  },
};

export function getExerciseExtra(id: string): ExerciseExtra | undefined {
  return EXERCISE_EXTRA[id];
}
