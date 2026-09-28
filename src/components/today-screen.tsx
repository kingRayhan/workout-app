"use client";

import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  restrictToParentElement,
  restrictToVerticalAxis,
} from "@dnd-kit/modifiers";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { ActivityHeatmap } from "@/components/activity-heatmap";
import { AppHeader } from "@/components/app-header";
import { BodyWeightCard } from "@/components/body-weight-card";
import { GoogleSignInButton } from "@/components/google-sign-in-button";
import { TodolistSkeleton } from "@/components/skeletons";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ExerciseDrawer } from "@/components/exercise-drawer";
import {
  ExerciseLogPanel,
  targetsToPerformed,
} from "@/components/exercise-log-panel";
import { OnboardingTour } from "@/components/onboarding-tour";
import { useProfile, useTodayTodolist } from "@/hooks/use-user-data";
import { useAuth } from "@/lib/auth";
import {
  IconImage,
  IconTile,
  MUSCLE_STYLE,
  SectionTitle,
  TONE_TEXT,
  TONE_TILE,
  type Tone,
} from "@/components/icon-tile";
import type { Exercise, MuscleGroup } from "@/data/plan";
import {
  catalogExerciseName,
  getCatalogExercise,
  isCardioExercise,
  MUSCLE_TAGS,
} from "@/lib/catalog";
import { localDateKey, WEEKDAY_LABELS } from "@/lib/dates";
import { EXERCISE_LOG_HREF, WEIGHT_LOG_HREF } from "@/lib/routes";
import {
  formatExerciseTargets,
  formatPerformed,
  resolveExerciseSettings,
  setExerciseDone,
  setTourStatus,
  updateWorkout,
  type ExerciseLog,
  type ExerciseSettings,
  type TourStatus,
  type Workout,
} from "@/lib/user-data";
import { cn } from "@/lib/utils";
import {
  ArrowDownUp,
  BedDouble,
  CalendarPlus,
  ChartColumn,
  Check,
  ChevronLeft,
  ChevronRight,
  Eye,
  Flame,
  GripVertical,
  ListChecks,
  LogIn,
  PartyPopper,
  Repeat,
  type LucideIcon,
} from "lucide-react";

/** How far ahead the day switcher can preview. */
const MAX_FUTURE_DAYS = 6;

function SortableRow({
  id,
  enabled,
  className,
  children,
}: {
  id: string;
  enabled: boolean;
  className?: string;
  /** Receives the drag handle (or `null` when not reordering). */
  children: (handle: React.ReactNode) => React.ReactNode;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id, disabled: !enabled });

  const handle = enabled ? (
    <button
      type="button"
      ref={setActivatorNodeRef}
      {...attributes}
      {...listeners}
      aria-label={`Reorder ${catalogExerciseName(id)}`}
      className="mr-2 grid size-10 shrink-0 touch-none cursor-grab place-items-center rounded-lg text-muted-foreground active:cursor-grabbing active:bg-muted active:text-foreground"
    >
      <GripVertical className="size-5" aria-hidden />
    </button>
  ) : null;

  return (
    <li
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={cn(
        className,
        "relative bg-card",
        isDragging && "z-10 rounded-xl shadow-lg ring-1 ring-primary/40",
      )}
    >
      {children(handle)}
    </li>
  );
}

function DaySwitcher({
  selected,
  offset,
  onChange,
}: {
  selected: Date;
  offset: number;
  onChange: (offset: number) => void;
}) {
  const relative =
    offset === 0
      ? "Today"
      : offset === -1
        ? "Yesterday"
        : offset === 1
          ? "Tomorrow"
          : selected.toLocaleDateString(undefined, { weekday: "long" });
  const dateLabel = selected.toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
  });

  return (
    <div data-tour="day-switcher" className="flex items-center gap-1">
      <Button
        variant="ghost"
        size="icon"
        className="size-10 rounded-xl"
        aria-label="Previous day"
        onClick={() => onChange(offset - 1)}
      >
        <ChevronLeft className="size-5" />
      </Button>
      <button
        type="button"
        className="min-w-0 flex-1 rounded-xl py-1 text-center active:bg-muted/60 disabled:active:bg-transparent"
        onClick={() => onChange(0)}
        disabled={offset === 0}
        aria-label={offset === 0 ? undefined : "Back to today"}
      >
        <span
          className={cn(
            "flex items-center justify-center gap-1.5 text-[15px] font-semibold leading-tight",
            offset === 0 && "text-primary",
            offset > 0 && "text-sky-400",
          )}
        >
          <span
            className={cn(
              "size-1.5 rounded-full",
              offset === 0 ? "bg-primary" : offset > 0 ? "bg-sky-400" : "bg-muted-foreground",
            )}
            aria-hidden
          />
          {relative}
        </span>
        <span className="block text-[12px] text-muted-foreground">
          {dateLabel}
          {offset !== 0 ? " · tap for today" : ""}
        </span>
      </button>
      <Button
        variant="ghost"
        size="icon"
        className="size-10 rounded-xl"
        aria-label="Next day"
        disabled={offset >= MAX_FUTURE_DAYS}
        onClick={() => onChange(offset + 1)}
      >
        <ChevronRight className="size-5" />
      </Button>
    </div>
  );
}

type OrderStatus = "idle" | "saving" | "saved" | "error";

function ChecklistCard({
  workout,
  eyebrow,
  icon,
  tone,
  isFuture,
  doneIds,
  logById,
  onToggle,
  onPeek,
  dataTour,
}: {
  workout: Workout;
  eyebrow: string;
  icon: LucideIcon;
  tone: Tone;
  isFuture: boolean;
  doneIds: Set<string>;
  logById: Map<string, ExerciseLog>;
  onToggle: (workout: Workout, exerciseId: string, next: boolean) => void;
  onPeek: (workout: Workout, exercise: Exercise, targets: ExerciseSettings) => void;
  dataTour?: string;
}) {
  const { user } = useAuth();
  const [sorting, setSorting] = useState(false);
  const [orderStatus, setOrderStatus] = useState<OrderStatus>("idle");
  const savedOrder = workout.exerciseIds;
  const savedOrderKey = `${workout.id}:${savedOrder.join("|")}`;
  // Optimistic order, dropped once the snapshot catches up (key changes).
  const [pendingOrder, setPendingOrder] = useState<{ key: string; order: string[] } | null>(
    null,
  );
  const order = pendingOrder?.key === savedOrderKey ? pendingOrder.order : savedOrder;
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 120, tolerance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  async function onReorder(event: DragEndEvent) {
    const { active, over } = event;
    if (!user || !over || active.id === over.id) return;
    const next = arrayMove(
      order,
      order.indexOf(String(active.id)),
      order.indexOf(String(over.id)),
    );
    setPendingOrder({ key: savedOrderKey, order: next });
    setOrderStatus("saving");
    try {
      await updateWorkout(user.uid, workout.id, {
        name: workout.name,
        exerciseIds: next,
      });
      setOrderStatus("saved");
    } catch {
      setPendingOrder(null);
      setOrderStatus("error");
    }
  }

  const total = order.length;
  const doneCount = order.filter((id) => doneIds.has(id)).length;
  const allDone = !isFuture && total > 0 && doneCount === total;
  const muscles = useMemo(() => {
    const seen = new Set<MuscleGroup>();
    for (const id of workout.exerciseIds) {
      for (const m of getCatalogExercise(id)?.muscles ?? []) seen.add(m);
    }
    return MUSCLE_TAGS.map((t) => t.id).filter((m) => seen.has(m));
  }, [workout.exerciseIds]);

  return (
    <section
      data-tour={dataTour}
      className="animate-rise overflow-hidden rounded-2xl bg-card ring-1 ring-border/80"
    >
      <div className="flex items-start gap-3 px-4 pt-3.5 pb-3">
        <IconTile
          icon={allDone ? PartyPopper : isFuture ? Eye : icon}
          tone={allDone ? "lime" : isFuture ? "sky" : tone}
        />
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
            {isFuture ? `Preview · ${eyebrow}` : eyebrow}
          </p>
          <h2 className="mt-0.5 text-[17px] font-semibold leading-tight tracking-tight">
            {workout.name}
          </h2>
          {muscles.length ? (
            <div className="mt-2 flex flex-wrap gap-1">
              {muscles.map((m) => {
                const style = MUSCLE_STYLE[m];
                return (
                  <span
                    key={m}
                    className={cn(
                      "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium",
                      TONE_TILE[style.tone],
                    )}
                  >
                    <IconImage icon={style.icon} className="size-3.5" />
                    {style.label}
                  </span>
                );
              })}
            </div>
          ) : null}
        </div>
        {total > 0 ? (
          <div className="text-right">
            <p
              className={cn(
                "text-[20px] font-semibold leading-none tabular-nums",
                allDone ? "text-primary" : "text-foreground",
              )}
            >
              {isFuture ? total : `${doneCount}/${total}`}
            </p>
            <p className="mt-1 text-[11px] text-muted-foreground">
              {isFuture ? "exercises" : allDone ? "all done" : "done"}
            </p>
            {total > 1 ? (
              <button
                type="button"
                onClick={() => {
                  setSorting((s) => !s);
                  setOrderStatus("idle");
                }}
                aria-pressed={sorting}
                className={cn(
                  "mt-2 inline-flex h-7 items-center gap-1 rounded-full px-2.5 text-[11px] font-semibold transition-colors",
                  sorting
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground active:bg-muted/80",
                )}
              >
                {sorting ? (
                  <>
                    <Check className="size-3" aria-hidden />
                    Done
                  </>
                ) : (
                  <>
                    <ArrowDownUp className="size-3" aria-hidden />
                    Reorder
                  </>
                )}
              </button>
            ) : null}
          </div>
        ) : null}
      </div>
      {sorting ? (
        <p
          className={cn(
            "mx-4 mb-3 rounded-xl bg-muted/60 px-3 py-2 text-[12px] text-muted-foreground",
            orderStatus === "saved" && "text-primary",
            orderStatus === "error" && "text-destructive",
          )}
          aria-live="polite"
        >
          {orderStatus === "saving"
            ? "Saving order…"
            : orderStatus === "saved"
              ? `Order saved to ${workout.name}`
              : orderStatus === "error"
                ? "Couldn’t save the new order"
                : `Drag ⋮⋮ to reorder. Saves to your ${workout.name} plan.`}
        </p>
      ) : null}
      {total > 0 && !isFuture ? (
        <div className="mx-4 mb-3 h-1.5 overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-primary transition-[width] duration-500"
            style={{ width: `${(doneCount / total) * 100}%` }}
          />
        </div>
      ) : null}
      {!sorting && total > 0 && (isFuture || doneCount === 0) ? (
        <p className="mx-4 mb-3 text-[12px] leading-snug text-muted-foreground">
          {isFuture
            ? "Open any exercise to read how to do it. You can log it once this day arrives."
            : order.some((id) => !isCardioExercise(id))
              ? "Tap a row to log it. “3 sets of 15” means 15 reps, rest, then repeat — 3 times."
              : "Tap a row to log the time and speed you actually did."}
        </p>
      ) : null}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        modifiers={[restrictToVerticalAxis, restrictToParentElement]}
        onDragEnd={(e) => void onReorder(e)}
      >
        <SortableContext items={order} strategy={verticalListSortingStrategy}>
          <ul className="relative border-t border-border/80">
            {order.map((id) => {
              const checked = doneIds.has(id);
              const isNext =
                !checked &&
                !isFuture &&
                !sorting &&
                order.find((candidate) => !doneIds.has(candidate)) === id;
              const name = catalogExerciseName(id);
              const exerciseMuscles = getCatalogExercise(id)?.muscles ?? [];
              const primary = exerciseMuscles[0] ? MUSCLE_STYLE[exerciseMuscles[0]] : null;
              const targets = resolveExerciseSettings(workout, id);
              const log = logById.get(id);
              const loggedLine = checked && log ? formatPerformed(log) : null;
              return (
                <SortableRow
                  key={id}
                  id={id}
                  enabled={sorting}
                  className="border-b border-border/60 last:border-b-0"
                >
                  {(handle) => (
                    <div
                      className={cn(
                        "flex min-h-14 items-center",
                        checked && "bg-primary/8",
                        isNext && "bg-primary/5",
                      )}
                    >
                      <label
                        className={cn(
                          "flex min-h-14 shrink-0 items-center self-stretch pl-4 pr-1",
                          isFuture ? "cursor-default" : "cursor-pointer",
                        )}
                      >
                        <Checkbox
                          checked={checked}
                          disabled={isFuture}
                          onCheckedChange={(v) => onToggle(workout, id, v === true)}
                          aria-label={`Mark ${name} done`}
                          className="size-5 rounded-md"
                        />
                      </label>
                      <button
                        type="button"
                        disabled={sorting}
                        onClick={() => {
                          if (checked && !isFuture) {
                            onToggle(workout, id, false);
                            return;
                          }
                          const exercise = getCatalogExercise(id);
                          if (exercise) onPeek(workout, exercise, targets);
                        }}
                        aria-label={checked && !isFuture ? `Undo ${name}` : undefined}
                        className={cn(
                          "flex min-h-14 min-w-0 flex-1 items-center gap-3 py-2 pl-2 text-left",
                          handle ? "pr-0" : "pr-4 active:bg-muted/60",
                        )}
                      >
                        {primary ? (
                          <IconTile
                            icon={checked ? Check : primary.icon}
                            tone={checked ? "lime" : primary.tone}
                          />
                        ) : null}
                        <span className="min-w-0 flex-1">
                          <span
                            className={cn(
                            "block text-[15px] font-medium leading-snug",
                            checked && "text-muted-foreground line-through",
                          )}
                        >
                          {isNext ? (
                            <span className="mr-1.5 align-middle text-[10px] font-semibold uppercase tracking-wider text-primary">
                              Next
                            </span>
                          ) : null}
                          {name}
                        </span>
                          {exerciseMuscles.length ? (
                            <span className="mt-0.5 flex flex-wrap gap-x-2 text-[11px] font-medium">
                              {exerciseMuscles.map((m) => (
                                <span
                                  key={m}
                                  className={
                                    checked
                                      ? "text-muted-foreground"
                                      : TONE_TEXT[MUSCLE_STYLE[m].tone]
                                  }
                                >
                                  {MUSCLE_STYLE[m].label}
                                </span>
                              ))}
                              <span className="text-muted-foreground tabular-nums">
                                {loggedLine ?? formatExerciseTargets(targets)}
                              </span>
                            </span>
                          ) : null}
                        </span>
                      </button>
                      {handle}
                    </div>
                  )}
                </SortableRow>
              );
            })}
          </ul>
        </SortableContext>
      </DndContext>
      {total === 0 ? (
        <p className="px-4 py-4 text-[13px] text-muted-foreground">
          This workout has no exercises yet.
        </p>
      ) : null}
    </section>
  );
}

export function TodayScreen() {
  const { user, loading: authLoading } = useAuth();
  const { profile, loading: profileLoading } = useProfile();
  const [tourDismissed, setTourDismissed] = useState(false);
  const [peek, setPeek] = useState<{
    exercise: Exercise;
    targets: ExerciseSettings;
    workoutId: string;
  } | null>(null);
  const [offset, setOffset] = useState(0);
  const selected = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + offset);
    return d;
  }, [offset]);
  const isFuture = offset > 0;
  const {
    date,
    weekday,
    workout,
    dailyWorkout,
    doneIds,
    logs,
    loading,
    error,
  } = useTodayTodolist(localDateKey(selected));
  const logById = useMemo(
    () => new Map(logs.map((l) => [l.exerciseId, l])),
    [logs],
  );

  const weekdayLong = new Intl.DateTimeFormat(undefined, {
    weekday: "long",
  }).format(selected);
  const dateLabel = new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
  }).format(selected);

  const allIds = new Set([
    ...(workout?.exerciseIds ?? []),
    ...(dailyWorkout?.exerciseIds ?? []),
  ]);
  const total = allIds.size;
  const doneCount = [...allIds].filter((id) => doneIds.has(id)).length;
  const showDataSkeleton = authLoading || (Boolean(user) && loading);
  const showTour =
    Boolean(user) &&
    !profileLoading &&
    !showDataSkeleton &&
    offset === 0 &&
    profile.tourStatus === null &&
    !tourDismissed;

  function finishTour(status: TourStatus) {
    setTourDismissed(true);
    if (user) void setTourStatus(user.uid, status).catch(() => {});
  }

  const firstName = user?.displayName?.trim().split(/\s+/)[0];
  const hour = new Date().getHours();
  const timeGreeting =
    hour < 5 ? "Late night" : hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  const headerTitle =
    user && firstName ? `${timeGreeting}, ${firstName}` : "Today";

  const dayName = workout ? weekdayLong : `Rest day · ${weekdayLong}`;
  const statusLine = !user || loading
    ? `${weekdayLong} · ${dateLabel}`
    : total === 0
      ? workout
        ? `${weekdayLong} · ${dateLabel}`
        : `Rest day · ${weekdayLong}`
      : doneCount === total
        ? `All ${total} done for ${weekdayLong} 🎉`
        : `${doneCount}/${total} done · ${dayName}`;

  async function toggle(owner: Workout, exerciseId: string, next: boolean) {
    if (!user || isFuture) return;
    try {
      await setExerciseDone(user.uid, {
        date,
        exerciseId,
        workoutId: owner.id,
        done: next,
        performed: targetsToPerformed(resolveExerciseSettings(owner, exerciseId)),
      });
    } catch {
      // snapshot will reconcile
    }
  }

  function openPeek(owner: Workout, exercise: Exercise, targets: ExerciseSettings) {
    setPeek({ exercise, targets, workoutId: owner.id });
  }

  return (
    <div className="flex flex-col pb-4">
      {showTour ? <OnboardingTour onFinish={finishTour} /> : null}
      <ExerciseDrawer
        exercise={peek?.exercise ?? null}
        targets={peek?.targets}
        open={peek !== null}
        onOpenChange={(open) => {
          if (!open) setPeek(null);
        }}
      >
        {peek && user ? (
          <ExerciseLogPanel
            key={`${peek.exercise.id}-${date}`}
            exerciseId={peek.exercise.id}
            date={date}
            workoutId={peek.workoutId}
            targets={peek.targets}
            log={logById.get(peek.exercise.id)}
            disabled={isFuture}
            onLogged={() => setPeek(null)}
          />
        ) : null}
      </ExerciseDrawer>
      <AppHeader title={headerTitle} subtitle={statusLine} />

      <div className="flex flex-col gap-3 px-4 pt-1">
        {user ? (
          <DaySwitcher selected={selected} offset={offset} onChange={setOffset} />
        ) : null}

        {showDataSkeleton ? <TodolistSkeleton /> : null}

        {!authLoading && !user ? (
          <section className="animate-rise rounded-2xl bg-muted px-4 py-4">
            <IconTile icon={LogIn} tone="lime" className="mb-2.5" />
            <h2 className="text-[17px] font-semibold tracking-tight">
              Sign in for your todolist
            </h2>
            <p className="mt-1 text-[13px] leading-snug text-muted-foreground">
              Schedule workouts and check off today’s exercises.
            </p>
            <div className="mt-3">
              <GoogleSignInButton />
            </div>
          </section>
        ) : null}

        {user && error ? (
          <p className="rounded-xl bg-destructive/10 px-3 py-2 text-[13px] text-destructive">
            {error}
          </p>
        ) : null}

        {user && !loading && !workout ? (
          <section
            data-tour="rest-day"
            className={cn(
              "animate-rise rounded-2xl bg-muted px-4 text-center",
              dailyWorkout ? "py-5" : "py-8",
            )}
          >
            <IconImage icon={BedDouble} className="mx-auto mb-3 size-12" />
            <p className="text-[17px] font-semibold tracking-tight">
              Rest day
            </p>
            <p className="mx-auto mt-1.5 max-w-[15rem] text-[13px] leading-snug text-muted-foreground">
              {dailyWorkout
                ? `No workout on ${WEEKDAY_LABELS[weekday]} — just your every-day list below.`
                : `Nothing on ${WEEKDAY_LABELS[weekday]} — schedule a workout in Plan.`}
            </p>
            {dailyWorkout ? null : (
              <Button asChild className="mt-4 h-10 rounded-xl px-5 font-semibold">
                <Link href="/plan">
                  <CalendarPlus className="size-4" aria-hidden />
                  Open Plan
                </Link>
              </Button>
            )}
          </section>
        ) : null}

        {user && !loading && workout ? (
          <ChecklistCard
            key={`${date}:${workout.id}`}
            workout={workout}
            eyebrow="Daily todolist"
            icon={ListChecks}
            tone="lime"
            isFuture={isFuture}
            doneIds={doneIds}
            logById={logById}
            onToggle={(w, id, next) => void toggle(w, id, next)}
            onPeek={openPeek}
            dataTour="todolist"
          />
        ) : null}

        {user && !loading && dailyWorkout ? (
          <ChecklistCard
            key={`${date}:daily:${dailyWorkout.id}`}
            workout={dailyWorkout}
            eyebrow="Every day"
            icon={Repeat}
            tone="amber"
            isFuture={isFuture}
            doneIds={doneIds}
            logById={logById}
            onToggle={(w, id, next) => void toggle(w, id, next)}
            onPeek={openPeek}
          />
        ) : null}

        {user ? (
          <BodyWeightCard key={date} date={date} disabled={isFuture} />
        ) : null}

        {user || authLoading ? (
          <section
            data-tour="activity"
            className="animate-rise rounded-2xl bg-card px-4 py-3.5 ring-1 ring-border/80"
          >
            <div className="flex items-center justify-between gap-2">
              <SectionTitle icon={Flame} tone="lime">
                Activity
              </SectionTitle>
              <Link
                href="/you"
                className="flex items-center gap-1 text-[12px] font-semibold text-primary"
              >
                <IconImage icon={ChartColumn} className="size-4" />
                Report
              </Link>
            </div>
            <div className="mt-2 w-full">
              <ActivityHeatmap
                range={{ months: 3 }}
                compact
                fill
                showRangeLabel
                showLegend
              />
            </div>
          </section>
        ) : (
          <section className="animate-rise rounded-2xl bg-card px-4 py-3.5 ring-1 ring-border/80">
            <SectionTitle icon={Flame} tone="lime">
              Activity
            </SectionTitle>
            <p className="mt-1.5 text-[12px] text-muted-foreground">
              Greens unlock when you check the daily todolist.
            </p>
          </section>
        )}

        <nav
          aria-label="Reports and logs"
          className="animate-rise grid grid-cols-2 gap-2"
        >
          {(
            [
              {
                href: EXERCISE_LOG_HREF,
                label: "Exercise log",
                hint: "Lifts and sessions",
                image: "/shortcuts/exercise.png",
              },
              {
                href: WEIGHT_LOG_HREF,
                label: "Weight log",
                hint: "Weigh-ins and trend",
                image: "/shortcuts/weight.png",
              },
              {
                href: "/you",
                label: "Report",
                hint: "Activity and streaks",
                image: "/shortcuts/report.png",
              },
              {
                href: "/catalog",
                label: "Catalog",
                hint: "Form videos",
                image: "/shortcuts/catalog.png",
              },
            ] as const
          ).map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex min-h-16 items-center gap-3 rounded-2xl bg-card px-3 py-3 ring-1 ring-border/80 active:bg-muted/60"
            >
              <Image
                src={item.image}
                alt=""
                width={256}
                height={256}
                className="size-12 shrink-0 object-contain"
              />
              <span className="min-w-0">
                <span className="block truncate text-[14px] font-semibold leading-tight">
                  {item.label}
                </span>
                <span className="mt-0.5 block truncate text-[11px] text-muted-foreground">
                  {item.hint}
                </span>
              </span>
            </Link>
          ))}
        </nav>
      </div>
    </div>
  );
}
