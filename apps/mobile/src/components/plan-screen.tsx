"use client";

import Link from "next/link";
import { useState } from "react";
import { AppHeader } from "@/components/app-header";
import { CreateWorkoutSheet } from "@/components/create-workout-sheet";
import { GoogleSignInButton } from "@/components/google-sign-in-button";
import { ScheduleDaySheet } from "@/components/schedule-day-sheet";
import { WorkoutDrawer } from "@/components/workout-drawer";
import { ChevronRight, Repeat } from "lucide-react";
import { IconTile } from "@/components/icon-tile";
import { PlanSkeleton } from "@/components/skeletons";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useSchedule, useWorkouts } from "@/hooks/use-user-data";
import { useAuth } from "@/lib/auth";
import { WEEKDAY_KEYS, WEEKDAY_LABELS } from "@/lib/dates";
import {
  createWorkout,
  deleteWorkoutAndUnschedule,
  importTrainerPlan,
  setScheduleDay,
  type ScheduleSlot,
  type Workout,
} from "@/lib/user-data";
import { cn } from "@/lib/utils";

export function PlanScreen() {
  const { user, loading: authLoading } = useAuth();
  const { workouts, loading: workoutsLoading } = useWorkouts();
  const { schedule, loading: scheduleLoading } = useSchedule();
  const [createOpen, setCreateOpen] = useState(false);
  const [editing, setEditing] = useState<Workout | null>(null);
  const [detailId, setDetailId] = useState<string | null>(null);
  const detailWorkout = workouts.find((w) => w.id === detailId) ?? null;
  const [scheduleDay, setScheduleDayState] = useState<ScheduleSlot | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [banner, setBanner] = useState<string | null>(null);

  const dataLoading = workoutsLoading || scheduleLoading;
  const showSkeleton = authLoading || (Boolean(user) && dataLoading);

  async function onImport() {
    if (!user) return;
    setBusy(true);
    setBanner(null);
    try {
      const n = await importTrainerPlan(user.uid, workouts);
      setBanner(
        n === 0
          ? "Trainer days already imported."
          : `Imported ${n} workout${n === 1 ? "" : "s"}.`,
      );
    } catch (err) {
      setBanner(err instanceof Error ? err.message : "Import failed.");
    } finally {
      setBusy(false);
    }
  }

  async function onSchedulePick(workoutId: string | null) {
    if (!user || !scheduleDay) return;
    try {
      await setScheduleDay(user.uid, scheduleDay, workoutId);
    } catch (err) {
      setBanner(err instanceof Error ? err.message : "Couldn’t update schedule.");
    }
  }

  async function onQuickDailyWalk() {
    if (!user) return;
    setBusy(true);
    setBanner(null);
    try {
      const id = await createWorkout(user.uid, {
        name: "Daily walk",
        exerciseIds: ["treadmill-walk"],
      });
      await setScheduleDay(user.uid, "daily", id);
      setBanner("Daily walk added — it now shows on Today every day.");
    } catch (err) {
      setBanner(err instanceof Error ? err.message : "Couldn’t add the daily walk.");
    } finally {
      setBusy(false);
    }
  }

  async function onConfirmDelete() {
    if (!user || !deleteId) return;
    setBusy(true);
    try {
      await deleteWorkoutAndUnschedule(user.uid, schedule, deleteId);
      setDeleteId(null);
      setDetailId(null);
    } catch (err) {
      setBanner(err instanceof Error ? err.message : "Couldn’t delete.");
    } finally {
      setBusy(false);
    }
  }

  function workoutName(id: string | null) {
    if (!id) return "Rest";
    return workouts.find((w) => w.id === id)?.name ?? "Missing workout";
  }

  return (
    <div className="flex flex-col pb-4">
      <AppHeader title="Plan" subtitle="Workouts & schedule" />

      <div className="flex flex-col gap-3 px-4 pt-1">
        {showSkeleton ? <PlanSkeleton /> : null}

        {!authLoading && !user ? (
          <section className="rounded-2xl bg-muted px-4 py-4">
            <h2 className="text-[17px] font-semibold tracking-tight">
              Build your week
            </h2>
            <p className="mt-1 text-[13px] leading-snug text-muted-foreground">
              Sign in to create workouts and put them on weekdays.
            </p>
            <div className="mt-3">
              <GoogleSignInButton />
            </div>
          </section>
        ) : null}

        {user && !dataLoading ? (
          <>
            {banner ? (
              <p className="rounded-xl bg-muted px-3 py-2 text-[13px] text-foreground">
                {banner}
              </p>
            ) : null}

            <section className="rounded-2xl bg-card px-4 py-3.5 ring-1 ring-border/80">
              <div className="flex items-center justify-between gap-2">
                <h2 className="text-[13px] font-semibold">Workouts</h2>
                <Button
                  size="sm"
                  className="h-8 rounded-lg font-semibold"
                  onClick={() => setCreateOpen(true)}
                >
                  New
                </Button>
              </div>

              {workouts.length === 0 ? (
                <div className="mt-3 space-y-3">
                  <p className="text-[13px] text-muted-foreground">
                    None yet. Import the trainer plan or build your own.
                  </p>
                  <Button
                    className="h-10 w-full rounded-xl font-semibold"
                    disabled={busy}
                    onClick={() => void onImport()}
                  >
                    Import trainer plan
                  </Button>
                </div>
              ) : (
                <ul className="mt-2">
                  {workouts.map((w, i) => {
                    const days = [
                      ...(schedule.daily === w.id ? ["Every day"] : []),
                      ...WEEKDAY_KEYS.filter((d) => schedule[d] === w.id).map(
                        (d) => WEEKDAY_LABELS[d],
                      ),
                    ];
                    return (
                      <li key={w.id}>
                        {i > 0 ? <Separator className="my-1" /> : null}
                        <button
                          type="button"
                          className="-mx-2 flex min-h-12 w-[calc(100%+1rem)] items-center gap-2 rounded-xl px-2 py-1.5 text-left active:bg-muted/60"
                          onClick={() => setDetailId(w.id)}
                        >
                          <span className="min-w-0 flex-1">
                            <span className="block truncate text-[15px] font-medium">
                              {w.name}
                            </span>
                            <span className="block text-[12px] text-muted-foreground">
                              {w.exerciseIds.length} exercises
                              {days.length ? ` · ${days.join(", ")}` : ""}
                            </span>
                          </span>
                          <ChevronRight
                            className="size-4 shrink-0 text-muted-foreground"
                            aria-hidden
                          />
                        </button>
                      </li>
                    );
                  })}
                  <li className="pt-2">
                    <Button
                      variant="outline"
                      className="h-10 w-full rounded-xl"
                      disabled={busy}
                      onClick={() => void onImport()}
                    >
                      Import missing trainer days
                    </Button>
                  </li>
                </ul>
              )}
            </section>

            <section className="overflow-hidden rounded-2xl bg-card ring-1 ring-border/80">
              <div className="px-4 py-3">
                <h2 className="text-[13px] font-semibold">Schedule</h2>
                <p className="mt-0.5 text-[12px] text-muted-foreground">
                  Tap a day to assign a workout. Put daily habits like a
                  treadmill walk under Every day.
                </p>
              </div>
              <Separator />
              <button
                type="button"
                className="flex min-h-14 w-full items-center gap-3 bg-amber-500/5 px-4 py-2 text-left active:bg-muted/60"
                onClick={() => setScheduleDayState("daily")}
              >
                <IconTile icon={Repeat} tone="amber" size="sm" />
                <span className="min-w-0 flex-1">
                  <span className="block text-[15px] font-medium">Every day</span>
                  <span className="block text-[12px] text-muted-foreground">
                    Shows on Today alongside each day’s workout
                  </span>
                </span>
                <span
                  className={cn(
                    "max-w-[40%] truncate text-[13px]",
                    schedule.daily ? "font-medium text-foreground" : "text-muted-foreground",
                  )}
                >
                  {schedule.daily ? workoutName(schedule.daily) : "None"}
                </span>
              </button>
              <Separator />
              <ul>
                {WEEKDAY_KEYS.map((day, i) => (
                  <li key={day}>
                    {i > 0 ? <Separator /> : null}
                    <button
                      type="button"
                      className="flex min-h-12 w-full items-center justify-between px-4 text-left active:bg-muted/60"
                      onClick={() => setScheduleDayState(day)}
                    >
                      <span className="text-[15px] font-medium">
                        {WEEKDAY_LABELS[day]}
                      </span>
                      <span className="max-w-[60%] truncate text-[13px] text-muted-foreground">
                        {workoutName(schedule[day])}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            </section>
          </>
        ) : null}

        <Link
          href="/catalog"
          className="flex min-h-12 items-center justify-between rounded-2xl bg-card px-4 py-3 ring-1 ring-border/80 active:bg-muted/60"
        >
          <span className="text-[15px] font-semibold">
            Browse exercise catalog
          </span>
          <span className="text-primary" aria-hidden>
            →
          </span>
        </Link>
      </div>

      <WorkoutDrawer
        workout={detailWorkout}
        schedule={schedule}
        open={detailWorkout !== null}
        onOpenChange={(open) => {
          if (!open) setDetailId(null);
        }}
        onEdit={(w) => {
          setDetailId(null);
          setEditing(w);
        }}
        onDelete={(w) => setDeleteId(w.id)}
      />
      <CreateWorkoutSheet
        key={editing?.id ?? "new"}
        open={createOpen || editing !== null}
        onOpenChange={(open) => {
          if (!open) {
            setCreateOpen(false);
            setEditing(null);
          }
        }}
        workout={editing}
      />
      <ScheduleDaySheet
        open={scheduleDay !== null}
        onOpenChange={(open) => {
          if (!open) setScheduleDayState(null);
        }}
        day={scheduleDay}
        workouts={workouts}
        selectedId={scheduleDay ? schedule[scheduleDay] : null}
        onSelect={(id) => void onSchedulePick(id)}
        onQuickAdd={() => void onQuickDailyWalk()}
      />

      <AlertDialog
        open={deleteId !== null}
        onOpenChange={(open) => {
          if (!open) setDeleteId(null);
        }}
      >
        <AlertDialogContent className="max-w-[calc(100%-2rem)] rounded-2xl sm:max-w-sm">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete workout?</AlertDialogTitle>
            <AlertDialogDescription>
              It will be removed from any scheduled days.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              disabled={busy}
              onClick={() => void onConfirmDelete()}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
