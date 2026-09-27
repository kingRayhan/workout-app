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
import { CalendarDays, GripVertical, Pencil, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import {
  IconTile,
  MUSCLE_STYLE,
  TONE_TEXT,
  TONE_TILE,
} from "@/components/icon-tile";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import type { MuscleGroup } from "@/data/plan";
import { useAuth } from "@/lib/auth";
import {
  catalogExerciseName,
  getCatalogExercise,
  MUSCLE_TAGS,
} from "@/lib/catalog";
import { WEEKDAY_KEYS, WEEKDAY_LABELS } from "@/lib/dates";
import { updateWorkout, type Schedule, type Workout } from "@/lib/user-data";
import { cn } from "@/lib/utils";

function SortableExercise({ id, index }: { id: string; index: number }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });
  const muscles = getCatalogExercise(id)?.muscles ?? [];
  const primary = muscles[0] ? MUSCLE_STYLE[muscles[0]] : null;
  const name = catalogExerciseName(id);

  return (
    <li
      ref={setNodeRef}
      data-vaul-no-drag
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={cn(
        "relative flex min-h-14 items-center gap-3 bg-popover py-2 pl-3 pr-1",
        isDragging && "z-10 rounded-xl shadow-lg ring-1 ring-primary/40",
      )}
    >
      <span className="w-4 shrink-0 text-center text-[12px] font-semibold text-muted-foreground tabular-nums">
        {index + 1}
      </span>
      {primary ? <IconTile icon={primary.icon} tone={primary.tone} /> : null}
      <span className="min-w-0 flex-1">
        <span className="block truncate text-[15px] font-medium leading-snug">
          {name}
        </span>
        {muscles.length ? (
          <span className="mt-0.5 flex flex-wrap gap-x-2 text-[11px] font-medium">
            {muscles.map((m) => (
              <span key={m} className={TONE_TEXT[MUSCLE_STYLE[m].tone]}>
                {MUSCLE_STYLE[m].label}
              </span>
            ))}
          </span>
        ) : null}
      </span>
      <button
        type="button"
        ref={setActivatorNodeRef}
        {...attributes}
        {...listeners}
        aria-label={`Reorder ${name}`}
        className="grid size-10 shrink-0 touch-none cursor-grab place-items-center rounded-lg text-muted-foreground active:cursor-grabbing active:bg-muted active:text-foreground"
      >
        <GripVertical className="size-5" aria-hidden />
      </button>
    </li>
  );
}

export function WorkoutDrawer({
  workout,
  schedule,
  open,
  onOpenChange,
  onEdit,
  onDelete,
}: {
  workout: Workout | null;
  schedule: Schedule;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit: (workout: Workout) => void;
  onDelete: (workout: Workout) => void;
}) {
  const { user } = useAuth();
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const saved = useMemo(() => workout?.exerciseIds ?? [], [workout?.exerciseIds]);
  const savedKey = saved.join("|");
  // Optimistic order, dropped once the snapshot catches up (key changes).
  const [pending, setPending] = useState<{ key: string; order: string[] } | null>(null);
  const order = pending?.key === savedKey ? pending.order : saved;

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 120, tolerance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const muscles = useMemo(() => {
    const seen = new Set<MuscleGroup>();
    for (const id of order) {
      for (const m of getCatalogExercise(id)?.muscles ?? []) seen.add(m);
    }
    return MUSCLE_TAGS.map((t) => t.id).filter((m) => seen.has(m));
  }, [order]);

  const days = workout
    ? WEEKDAY_KEYS.filter((d) => schedule[d] === workout.id)
    : [];

  async function onDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!workout || !user || !over || active.id === over.id) return;
    const next = arrayMove(
      order,
      order.indexOf(String(active.id)),
      order.indexOf(String(over.id)),
    );
    setPending({ key: savedKey, order: next });
    setStatus("saving");
    try {
      await updateWorkout(user.uid, workout.id, {
        name: workout.name,
        exerciseIds: next,
      });
      setStatus("saved");
    } catch {
      setPending(null);
      setStatus("error");
    }
  }

  return (
    <Drawer
      open={open}
      onOpenChange={(next) => {
        if (!next) setStatus("idle");
        onOpenChange(next);
      }}
    >
      <DrawerContent className="mx-auto w-full max-w-[430px] data-[vaul-drawer-direction=bottom]:max-h-[88dvh]">
        {workout ? (
          <>
            <DrawerHeader className="gap-1 border-b border-border/80 pb-3 text-left group-data-[vaul-drawer-direction=bottom]/drawer-content:text-left">
              <DrawerTitle className="text-[19px] font-semibold tracking-tight">
                {workout.name}
              </DrawerTitle>
              <DrawerDescription className="flex items-center gap-1.5 text-[12px]">
                <CalendarDays className="size-3.5" aria-hidden />
                {days.length
                  ? days.map((d) => WEEKDAY_LABELS[d]).join(", ")
                  : "Not scheduled"}
                <span aria-hidden>·</span>
                {order.length} exercises
              </DrawerDescription>
              {muscles.length ? (
                <div className="mt-1.5 flex flex-wrap gap-1">
                  {muscles.map((m) => {
                    const style = MUSCLE_STYLE[m];
                    const Icon = style.icon;
                    return (
                      <span
                        key={m}
                        className={cn(
                          "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium",
                          TONE_TILE[style.tone],
                        )}
                      >
                        <Icon className="size-3" aria-hidden />
                        {style.label}
                      </span>
                    );
                  })}
                </div>
              ) : null}
            </DrawerHeader>

            <div className="flex items-center justify-between px-4 pt-3 pb-1 text-[11px]">
              <span className="font-semibold uppercase tracking-wider text-muted-foreground">
                Order
              </span>
              <span
                className={cn(
                  "text-muted-foreground",
                  status === "saved" && "text-primary",
                  status === "error" && "text-destructive",
                )}
                aria-live="polite"
              >
                {status === "saving"
                  ? "Saving…"
                  : status === "saved"
                    ? "Order saved"
                    : status === "error"
                      ? "Couldn’t save order"
                      : "Drag ⋮⋮ to reorder"}
              </span>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto px-1 pb-2">
              {order.length ? (
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  modifiers={[restrictToVerticalAxis, restrictToParentElement]}
                  onDragEnd={(e) => void onDragEnd(e)}
                >
                  <SortableContext items={order} strategy={verticalListSortingStrategy}>
                    <ul className="relative divide-y divide-border/60">
                      {order.map((id, i) => (
                        <SortableExercise key={id} id={id} index={i} />
                      ))}
                    </ul>
                  </SortableContext>
                </DndContext>
              ) : (
                <p className="px-3 py-6 text-center text-[13px] text-muted-foreground">
                  No exercises yet — tap Edit to add some.
                </p>
              )}
            </div>

            <DrawerFooter className="grid grid-cols-2 gap-2 border-t border-border/80">
              <Button
                variant="outline"
                className="h-11 rounded-xl text-destructive hover:text-destructive"
                onClick={() => onDelete(workout)}
              >
                <Trash2 className="size-4" aria-hidden />
                Delete
              </Button>
              <Button
                className="h-11 rounded-xl font-semibold"
                onClick={() => onEdit(workout)}
              >
                <Pencil className="size-4" aria-hidden />
                Edit
              </Button>
            </DrawerFooter>
          </>
        ) : (
          <DrawerHeader>
            <DrawerTitle>Workout</DrawerTitle>
          </DrawerHeader>
        )}
      </DrawerContent>
    </Drawer>
  );
}
