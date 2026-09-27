import {
  collection,
  deleteDoc,
  deleteField,
  doc,
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
import { DAYS } from "@/data/plan";
import { isCatalogExerciseId } from "@/lib/catalog";
import type { WeekdayKey } from "@/lib/dates";
import { WEEKDAY_KEYS } from "@/lib/dates";
import { getFirebaseDb } from "@/lib/firebase";

export type Workout = {
  id: string;
  name: string;
  exerciseIds: string[];
  sourceTemplate: string | null;
};

export type Schedule = Record<WeekdayKey, string | null> & {
  updatedAt?: unknown;
};

export type ExerciseLog = {
  id: string;
  date: string;
  exerciseId: string;
  workoutId: string | null;
  done: boolean;
};

export function emptySchedule(): Schedule {
  return {
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

export type Profile = {
  heightCm: number | null;
  targetKg: number | null;
};

export const EMPTY_PROFILE: Profile = { heightCm: null, targetKg: null };

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
      });
    },
    (err) => onError?.(err),
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
      for (const key of WEEKDAY_KEYS) {
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
  day: WeekdayKey,
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
      onData(
        snap.docs.map((d) => {
          const data = d.data();
          return {
            id: d.id,
            date: String(data.date ?? date),
            exerciseId: String(data.exerciseId ?? ""),
            workoutId:
              typeof data.workoutId === "string" ? data.workoutId : null,
            done: data.done !== false,
          };
        }),
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
      onData(
        snap.docs.map((d) => {
          const data = d.data();
          return {
            id: d.id,
            date: String(data.date ?? ""),
            exerciseId: String(data.exerciseId ?? ""),
            workoutId:
              typeof data.workoutId === "string" ? data.workoutId : null,
            done: data.done !== false,
          };
        }),
      );
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
  },
) {
  const ref = logRef(uid, input.date, input.exerciseId);
  if (!input.done) {
    await deleteDoc(ref);
    return;
  }
  await setDoc(
    ref,
    {
      date: input.date,
      exerciseId: input.exerciseId,
      workoutId: input.workoutId,
      done: true,
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
  for (const key of WEEKDAY_KEYS) {
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
  for (const key of WEEKDAY_KEYS) {
    if (schedule[key] === workoutId) patch[key] = null;
  }
  batch.set(scheduleRef(uid), patch, { merge: true });
  await batch.commit();
}
