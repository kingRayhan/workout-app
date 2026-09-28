import {
  collection,
  deleteDoc,
  deleteField,
  doc,
  FieldPath,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  type Unsubscribe,
  where,
  writeBatch,
} from "firebase/firestore";
import { DAYS, PLAN_META } from "@/data/plan";
import {
  formatCardio,
  getCatalogExercise,
  isCatalogExerciseId,
} from "@/lib/catalog";
import type { WeekdayKey } from "@/lib/dates";
import { WEEKDAY_KEYS } from "@/lib/dates";
import { getFirebaseDb } from "@/lib/firebase";

/** Machine cardio numbers; all `null` for lifts. */
export type CardioFields = {
  durationMin: number | null;
  speedKmh: number | null;
  inclinePct: number | null;
  level: number | null;
};

export type ExerciseSettings = CardioFields & {
  sets: number;
  reps: number;
  /** Working weight; `null` for bodyweight or unset. */
  weightKg: number | null;
  restSec: number | null;
};

export type Workout = {
  id: string;
  name: string;
  exerciseIds: string[];
  /** Overrides keyed by exercise id; missing ids use catalog defaults. */
  settings: Record<string, ExerciseSettings>;
  sourceTemplate: string | null;
};

export const SETTINGS_LIMITS = {
  sets: { min: 1, max: 20 },
  reps: { min: 1, max: 100 },
  weightKg: { min: 0, max: 500 },
  restSec: { min: 0, max: 600 },
  durationMin: { min: 1, max: 240 },
  speedKmh: { min: 0.5, max: 25 },
  inclinePct: { min: 0, max: 20 },
  level: { min: 1, max: 30 },
} as const;

export const NO_CARDIO: CardioFields = {
  durationMin: null,
  speedKmh: null,
  inclinePct: null,
  level: null,
};

export function defaultExerciseSettings(exerciseId: string): ExerciseSettings {
  const exercise = getCatalogExercise(exerciseId);
  const cardio = exercise?.cardio;
  return {
    sets: exercise?.sets ?? PLAN_META.sets,
    reps: exercise?.reps ?? PLAN_META.reps,
    weightKg: null,
    restSec: null,
    durationMin: cardio?.durationMin ?? null,
    speedKmh: cardio?.speedKmh ?? null,
    inclinePct: cardio?.inclinePct ?? null,
    level: cardio?.level ?? null,
  };
}

export function resolveExerciseSettings(
  workout: Pick<Workout, "settings"> | null | undefined,
  exerciseId: string,
): ExerciseSettings {
  return workout?.settings[exerciseId] ?? defaultExerciseSettings(exerciseId);
}

export function formatRest(sec: number) {
  if (sec < 60) return `${sec}s`;
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return s ? `${m}m ${s}s` : `${m}m`;
}

/** e.g. "3 × 12 · 40 kg · 90s rest" or "20 min · 4.5 km/h" */
export function formatExerciseTargets(s: ExerciseSettings) {
  if (s.durationMin !== null) return formatCardio(s);
  const parts = [`${s.sets} × ${s.reps}`];
  if (s.weightKg !== null) parts.push(`${s.weightKg} kg`);
  if (s.restSec !== null) parts.push(`${formatRest(s.restSec)} rest`);
  return parts.join(" · ");
}

function intInRange(v: unknown, min: number, max: number) {
  return typeof v === "number" && Number.isInteger(v) && v >= min && v <= max
    ? v
    : null;
}

function numInRange(v: unknown, min: number, max: number) {
  const n = finiteOrNull(v);
  return n !== null && n >= min && n <= max ? n : null;
}

function parseCardio(data: Record<string, unknown>): CardioFields {
  const { durationMin, speedKmh, inclinePct, level } = SETTINGS_LIMITS;
  return {
    durationMin: intInRange(data.durationMin, durationMin.min, durationMin.max),
    speedKmh: numInRange(data.speedKmh, speedKmh.min, speedKmh.max),
    inclinePct: numInRange(data.inclinePct, inclinePct.min, inclinePct.max),
    level: intInRange(data.level, level.min, level.max),
  };
}

/** Throws on out-of-range values; rounds speed to 0.1 and incline to 0.5. */
function normalizeCardio(v: CardioFields): CardioFields {
  const { durationMin, speedKmh, inclinePct, level } = SETTINGS_LIMITS;
  const bad = (n: number | null, min: number, max: number) =>
    n !== null && (!Number.isFinite(n) || n < min || n > max);
  if (
    v.durationMin !== null &&
    intInRange(v.durationMin, durationMin.min, durationMin.max) === null
  ) {
    throw new Error(`Time must be ${durationMin.min}–${durationMin.max} min.`);
  }
  if (bad(v.speedKmh, speedKmh.min, speedKmh.max)) {
    throw new Error(`Speed must be ${speedKmh.min}–${speedKmh.max} km/h.`);
  }
  if (bad(v.inclinePct, inclinePct.min, inclinePct.max)) {
    throw new Error(`Incline must be ${inclinePct.min}–${inclinePct.max}%.`);
  }
  if (v.level !== null && intInRange(v.level, level.min, level.max) === null) {
    throw new Error(`Level must be ${level.min}–${level.max}.`);
  }
  return {
    durationMin: v.durationMin,
    speedKmh: v.speedKmh === null ? null : Math.round(v.speedKmh * 10) / 10,
    inclinePct: v.inclinePct === null ? null : Math.round(v.inclinePct * 2) / 2,
    level: v.level,
  };
}

function parseExerciseSettings(raw: unknown): ExerciseSettings | null {
  if (!raw || typeof raw !== "object") return null;
  const data = raw as Record<string, unknown>;
  const { sets, reps, weightKg, restSec } = SETTINGS_LIMITS;
  const s = intInRange(data.sets, sets.min, sets.max);
  const r = intInRange(data.reps, reps.min, reps.max);
  if (s === null || r === null) return null;
  return {
    sets: s,
    reps: r,
    weightKg: numInRange(data.weightKg, weightKg.min, weightKg.max),
    restSec: intInRange(data.restSec, restSec.min, restSec.max),
    ...parseCardio(data),
  };
}

function parseSettingsMap(raw: unknown): Record<string, ExerciseSettings> {
  if (!raw || typeof raw !== "object") return {};
  const out: Record<string, ExerciseSettings> = {};
  for (const [id, value] of Object.entries(raw)) {
    if (!isCatalogExerciseId(id)) continue;
    const parsed = parseExerciseSettings(value);
    if (parsed) out[id] = parsed;
  }
  return out;
}

/** A weekday, or `daily` for the workout shown on every day. */
export type ScheduleSlot = WeekdayKey | "daily";

export const SCHEDULE_SLOTS: ScheduleSlot[] = ["daily", ...WEEKDAY_KEYS];

export type Schedule = Record<ScheduleSlot, string | null> & {
  updatedAt?: unknown;
};

/** What was actually done; fields are `null` on plain check-offs. */
export type PerformedSet = CardioFields & {
  sets: number | null;
  reps: number | null;
  weightKg: number | null;
};

export type ExerciseLog = PerformedSet & {
  id: string;
  date: string;
  exerciseId: string;
  workoutId: string | null;
  done: boolean;
};

function parseLog(
  id: string,
  data: Record<string, unknown>,
  fallbackDate = "",
): ExerciseLog {
  const { sets, reps, weightKg } = SETTINGS_LIMITS;
  return {
    id,
    date: String(data.date ?? fallbackDate),
    exerciseId: String(data.exerciseId ?? ""),
    workoutId: typeof data.workoutId === "string" ? data.workoutId : null,
    done: data.done !== false,
    sets: intInRange(data.sets, sets.min, sets.max),
    reps: intInRange(data.reps, reps.min, reps.max),
    weightKg: numInRange(data.weightKg, weightKg.min, weightKg.max),
    ...parseCardio(data),
  };
}

/** e.g. "38 kg · 3 × 15" or "20 min · 4.5 km/h · 1.5 km"; `null` when the log has no numbers. */
export function formatPerformed(p: PerformedSet) {
  if (p.durationMin !== null) return formatCardio(p, { withDistance: true });
  const parts: string[] = [];
  if (p.weightKg !== null) parts.push(`${p.weightKg} kg`);
  if (p.sets !== null && p.reps !== null) parts.push(`${p.sets} × ${p.reps}`);
  return parts.length ? parts.join(" · ") : null;
}

export function emptySchedule(): Schedule {
  return {
    daily: null,
    mon: null,
    tue: null,
    wed: null,
    thu: null,
    fri: null,
    sat: null,
    sun: null,
  };
}

function workoutsCol(uid: string) {
  return collection(getFirebaseDb(), "users", uid, "workouts");
}

function scheduleRef(uid: string) {
  return doc(getFirebaseDb(), "users", uid, "schedule", "current");
}

function logsCol(uid: string) {
  return collection(getFirebaseDb(), "users", uid, "logs");
}

function logRef(uid: string, date: string, exerciseId: string) {
  return doc(getFirebaseDb(), "users", uid, "logs", `${date}_${exerciseId}`);
}

function bodyWeightsCol(uid: string) {
  return collection(getFirebaseDb(), "users", uid, "bodyWeights");
}

function profileRef(uid: string) {
  return doc(getFirebaseDb(), "users", uid, "profile", "main");
}

export type TourStatus = "completed" | "skipped";

export type Profile = {
  heightCm: number | null;
  targetKg: number | null;
  tourStatus: TourStatus | null;
};

export const EMPTY_PROFILE: Profile = {
  heightCm: null,
  targetKg: null,
  tourStatus: null,
};

function finiteOrNull(v: unknown) {
  return typeof v === "number" && Number.isFinite(v) ? v : null;
}

export function subscribeProfile(
  uid: string,
  onData: (profile: Profile) => void,
  onError?: (err: Error) => void,
): Unsubscribe {
  return onSnapshot(
    profileRef(uid),
    (snap) => {
      const data = snap.exists() ? snap.data() : {};
      onData({
        heightCm: finiteOrNull(data.heightCm),
        targetKg: finiteOrNull(data.targetKg),
        tourStatus:
          data.tourStatus === "completed" || data.tourStatus === "skipped"
            ? data.tourStatus
            : null,
      });
    },
    (err) => onError?.(err),
  );
}

/** Pass `null` to show the tour again on the next visit to Today. */
export async function setTourStatus(uid: string, status: TourStatus | null) {
  await setDoc(
    profileRef(uid),
    {
      tourStatus: status ?? deleteField(),
      tourUpdatedAt: serverTimestamp(),
    },
    { merge: true },
  );
}

export async function setTargetKg(uid: string, kg: number | null) {
  if (kg !== null && (!Number.isFinite(kg) || kg < 20 || kg > 400)) {
    throw new Error("Enter a target between 20 and 400 kg.");
  }
  await setDoc(
    profileRef(uid),
    {
      targetKg: kg === null ? deleteField() : Math.round(kg * 10) / 10,
      updatedAt: serverTimestamp(),
    },
    { merge: true },
  );
}

export async function setHeightCm(uid: string, heightCm: number) {
  if (!Number.isFinite(heightCm) || heightCm < 100 || heightCm > 250) {
    throw new Error("Enter a height between 100 and 250 cm.");
  }
  await setDoc(
    profileRef(uid),
    { heightCm: Math.round(heightCm), updatedAt: serverTimestamp() },
    { merge: true },
  );
}

export type BodyWeightEntry = {
  date: string;
  kg: number;
};

export function subscribeBodyWeightsInRange(
  uid: string,
  startDate: string,
  endDate: string,
  onData: (entries: BodyWeightEntry[]) => void,
  onError?: (err: Error) => void,
): Unsubscribe {
  const q = query(
    bodyWeightsCol(uid),
    where("date", ">=", startDate),
    where("date", "<=", endDate),
  );
  return onSnapshot(
    q,
    (snap) => {
      const entries = snap.docs
        .map((d) => {
          const data = d.data();
          return { date: String(data.date ?? d.id), kg: Number(data.kg) };
        })
        .filter((e) => Number.isFinite(e.kg))
        .sort((a, b) => a.date.localeCompare(b.date));
      onData(entries);
    },
    (err) => onError?.(err),
  );
}

/** Pass `null` to clear the entry for that day. */
export async function setBodyWeight(
  uid: string,
  date: string,
  kg: number | null,
) {
  const ref = doc(bodyWeightsCol(uid), date);
  if (kg === null) {
    await deleteDoc(ref);
    return;
  }
  if (!Number.isFinite(kg) || kg < 20 || kg > 400) {
    throw new Error("Enter a weight between 20 and 400 kg.");
  }
  await setDoc(ref, {
    date,
    kg: Math.round(kg * 10) / 10,
    updatedAt: serverTimestamp(),
  });
}

export function subscribeWorkouts(
  uid: string,
  onData: (workouts: Workout[]) => void,
  onError?: (err: Error) => void,
): Unsubscribe {
  const q = query(workoutsCol(uid), orderBy("createdAt", "asc"));
  return onSnapshot(
    q,
    (snap) => {
      const rows: Workout[] = snap.docs.map((d) => {
        const data = d.data();
        return {
          id: d.id,
          name: String(data.name ?? ""),
          exerciseIds: Array.isArray(data.exerciseIds)
            ? data.exerciseIds.filter(
                (id): id is string =>
                  typeof id === "string" && isCatalogExerciseId(id),
              )
            : [],
          settings: parseSettingsMap(data.exerciseSettings),
          sourceTemplate:
            typeof data.sourceTemplate === "string"
              ? data.sourceTemplate
              : null,
        };
      });
      onData(rows);
    },
    (err) => onError?.(err),
  );
}

export async function createWorkout(
  uid: string,
  input: {
    name: string;
    exerciseIds: string[];
    sourceTemplate?: string | null;
  },
): Promise<string> {
  const name = input.name.trim().slice(0, 60);
  if (!name) throw new Error("Name your workout.");
  const exerciseIds = input.exerciseIds.filter(isCatalogExerciseId).slice(0, 40);
  if (exerciseIds.length === 0) {
    throw new Error("Add at least one exercise.");
  }
  const ref = doc(workoutsCol(uid));
  await setDoc(ref, {
    name,
    exerciseIds,
    sourceTemplate: input.sourceTemplate ?? null,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return ref.id;
}

export async function updateWorkout(
  uid: string,
  workoutId: string,
  input: {
    name: string;
    exerciseIds: string[];
  },
): Promise<void> {
  const name = input.name.trim().slice(0, 60);
  if (!name) throw new Error("Name your workout.");
  const exerciseIds = input.exerciseIds.filter(isCatalogExerciseId).slice(0, 40);
  if (exerciseIds.length === 0) {
    throw new Error("Add at least one exercise.");
  }
  await updateDoc(doc(workoutsCol(uid), workoutId), {
    name,
    exerciseIds,
    updatedAt: serverTimestamp(),
  });
}

/** Pass `null` to reset the exercise back to catalog defaults. */
export async function setExerciseSettings(
  uid: string,
  workoutId: string,
  exerciseId: string,
  settings: ExerciseSettings | null,
): Promise<void> {
  if (!isCatalogExerciseId(exerciseId)) throw new Error("Unknown exercise.");
  let value: ExerciseSettings | ReturnType<typeof deleteField> = deleteField();
  if (settings) {
    const { sets, reps, weightKg, restSec } = SETTINGS_LIMITS;
    const s = intInRange(settings.sets, sets.min, sets.max);
    const r = intInRange(settings.reps, reps.min, reps.max);
    if (s === null) throw new Error(`Sets must be ${sets.min}–${sets.max}.`);
    if (r === null) throw new Error(`Reps must be ${reps.min}–${reps.max}.`);
    const w = settings.weightKg;
    if (w !== null && (!Number.isFinite(w) || w < weightKg.min || w > weightKg.max)) {
      throw new Error(`Weight must be ${weightKg.min}–${weightKg.max} kg.`);
    }
    const rest =
      settings.restSec === null
        ? null
        : intInRange(settings.restSec, restSec.min, restSec.max);
    if (settings.restSec !== null && rest === null) {
      throw new Error(`Rest must be ${restSec.min}–${restSec.max} seconds.`);
    }
    value = {
      sets: s,
      reps: r,
      weightKg: w === null ? null : Math.round(w * 4) / 4,
      restSec: rest,
      ...normalizeCardio(settings),
    };
  }
  await updateDoc(
    doc(workoutsCol(uid), workoutId),
    new FieldPath("exerciseSettings", exerciseId),
    value,
    "updatedAt",
    serverTimestamp(),
  );
}

export async function deleteWorkout(uid: string, workoutId: string) {
  await deleteDoc(doc(workoutsCol(uid), workoutId));
}

/** Import Day 1–3 as workouts; skips templates that already exist. */
export async function importTrainerPlan(
  uid: string,
  existing: Workout[],
): Promise<number> {
  const have = new Set(
    existing
      .map((w) => w.sourceTemplate)
      .filter((t): t is string => typeof t === "string"),
  );
  let created = 0;
  for (const day of DAYS) {
    const template = `trainer-day-${day.id}`;
    if (have.has(template)) continue;
    const ref = doc(workoutsCol(uid));
    await setDoc(ref, {
      name: day.title,
      exerciseIds: day.exercises.map((e) => e.id),
      sourceTemplate: template,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    created += 1;
  }
  return created;
}

export function subscribeSchedule(
  uid: string,
  onData: (schedule: Schedule) => void,
  onError?: (err: Error) => void,
): Unsubscribe {
  return onSnapshot(
    scheduleRef(uid),
    (snap) => {
      if (!snap.exists()) {
        onData(emptySchedule());
        return;
      }
      const data = snap.data();
      const next = emptySchedule();
      for (const key of SCHEDULE_SLOTS) {
        const v = data[key];
        next[key] = typeof v === "string" ? v : null;
      }
      onData(next);
    },
    (err) => onError?.(err),
  );
}

export async function setScheduleDay(
  uid: string,
  day: ScheduleSlot,
  workoutId: string | null,
) {
  await setDoc(
    scheduleRef(uid),
    {
      [day]: workoutId,
      updatedAt: serverTimestamp(),
    },
    { merge: true },
  );
}

export function subscribeLogsForDate(
  uid: string,
  date: string,
  onData: (logs: ExerciseLog[]) => void,
  onError?: (err: Error) => void,
): Unsubscribe {
  const q = query(logsCol(uid), where("date", "==", date));
  return onSnapshot(
    q,
    (snap) => {
      onData(snap.docs.map((d) => parseLog(d.id, d.data(), date)));
    },
    (err) => onError?.(err),
  );
}

/** Every completed log for one exercise, newest first. */
export function subscribeExerciseHistory(
  uid: string,
  exerciseId: string,
  onData: (logs: ExerciseLog[]) => void,
  onError?: (err: Error) => void,
): Unsubscribe {
  const q = query(logsCol(uid), where("exerciseId", "==", exerciseId));
  return onSnapshot(
    q,
    (snap) => {
      onData(
        snap.docs
          .map((d) => parseLog(d.id, d.data()))
          .filter((l) => l.done && l.date)
          .sort((a, b) => b.date.localeCompare(a.date)),
      );
    },
    (err) => onError?.(err),
  );
}

export function subscribeLogsInRange(
  uid: string,
  startDate: string,
  endDate: string,
  onData: (logs: ExerciseLog[]) => void,
  onError?: (err: Error) => void,
): Unsubscribe {
  const q = query(
    logsCol(uid),
    where("date", ">=", startDate),
    where("date", "<=", endDate),
  );
  return onSnapshot(
    q,
    (snap) => {
      onData(snap.docs.map((d) => parseLog(d.id, d.data())));
    },
    (err) => onError?.(err),
  );
}

export async function setExerciseDone(
  uid: string,
  input: {
    date: string;
    exerciseId: string;
    workoutId: string | null;
    done: boolean;
    performed?: PerformedSet;
  },
) {
  const ref = logRef(uid, input.date, input.exerciseId);
  if (!input.done) {
    await deleteDoc(ref);
    return;
  }
  let performed: Partial<PerformedSet> = {};
  if (input.performed) {
    const { sets, reps, weightKg } = SETTINGS_LIMITS;
    const p = input.performed;
    if (p.sets !== null && intInRange(p.sets, sets.min, sets.max) === null) {
      throw new Error(`Sets must be ${sets.min}–${sets.max}.`);
    }
    if (p.reps !== null && intInRange(p.reps, reps.min, reps.max) === null) {
      throw new Error(`Reps must be ${reps.min}–${reps.max}.`);
    }
    if (
      p.weightKg !== null &&
      (!Number.isFinite(p.weightKg) ||
        p.weightKg < weightKg.min ||
        p.weightKg > weightKg.max)
    ) {
      throw new Error(`Weight must be ${weightKg.min}–${weightKg.max} kg.`);
    }
    performed = {
      sets: p.sets,
      reps: p.reps,
      weightKg: p.weightKg === null ? null : Math.round(p.weightKg * 4) / 4,
      ...normalizeCardio(p),
    };
  }
  await setDoc(
    ref,
    {
      date: input.date,
      exerciseId: input.exerciseId,
      workoutId: input.workoutId,
      done: true,
      ...performed,
      updatedAt: serverTimestamp(),
      createdAt: serverTimestamp(),
    },
    { merge: true },
  );
}

/** Clear schedule slots pointing at a deleted workout. */
export async function clearScheduleForWorkout(
  uid: string,
  schedule: Schedule,
  workoutId: string,
) {
  const patch: Record<string, string | null | ReturnType<typeof serverTimestamp>> =
    { updatedAt: serverTimestamp() };
  let touched = false;
  for (const key of SCHEDULE_SLOTS) {
    if (schedule[key] === workoutId) {
      patch[key] = null;
      touched = true;
    }
  }
  if (!touched) return;
  await setDoc(scheduleRef(uid), patch, { merge: true });
}

export async function deleteWorkoutAndUnschedule(
  uid: string,
  schedule: Schedule,
  workoutId: string,
) {
  const batch = writeBatch(getFirebaseDb());
  batch.delete(doc(workoutsCol(uid), workoutId));
  const patch: Record<string, unknown> = { updatedAt: serverTimestamp() };
  for (const key of SCHEDULE_SLOTS) {
    if (schedule[key] === workoutId) patch[key] = null;
  }
  batch.set(scheduleRef(uid), patch, { merge: true });
  await batch.commit();
}
