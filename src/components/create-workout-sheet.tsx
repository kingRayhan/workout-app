"use client";

import { useEffect, useMemo, useState } from "react";
import { TagFilterBar } from "@/components/workout-catalog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import type { MuscleGroup } from "@/data/plan";
import { useAuth } from "@/lib/auth";
import {
  allCatalogExercises,
  filterExercisesByTag,
} from "@/lib/catalog";
import {
  createWorkout,
  updateWorkout,
  type Workout,
} from "@/lib/user-data";

export function CreateWorkoutSheet({
  open,
  onOpenChange,
  workout = null,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  workout?: Workout | null;
}) {
  const { user } = useAuth();
  const isEdit = Boolean(workout);
  const [name, setName] = useState("");
  const [selected, setSelected] = useState<string[]>([]);
  const [tag, setTag] = useState<MuscleGroup | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    if (workout) {
      setName(workout.name);
      setSelected([...workout.exerciseIds]);
    } else {
      setName("");
      setSelected([]);
    }
    setTag(null);
    setError(null);
    setSaving(false);
  }, [open, workout]);

  const selectedSet = useMemo(() => new Set(selected), [selected]);
  const all = useMemo(() => allCatalogExercises(), []);
  const filtered = useMemo(
    () => filterExercisesByTag(all, tag),
    [all, tag],
  );

  function toggle(id: string) {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  }

  function reset() {
    setName("");
    setSelected([]);
    setTag(null);
    setError(null);
    setSaving(false);
  }

  async function onSave() {
    if (!user) return;
    setSaving(true);
    setError(null);
    try {
      if (workout) {
        await updateWorkout(user.uid, workout.id, {
          name,
          exerciseIds: selected,
        });
      } else {
        await createWorkout(user.uid, { name, exerciseIds: selected });
      }
      reset();
      onOpenChange(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn’t save workout.");
      setSaving(false);
    }
  }

  return (
    <Sheet
      open={open}
      onOpenChange={(next) => {
        if (!next) reset();
        onOpenChange(next);
      }}
    >
      <SheetContent
        side="bottom"
        className="mx-auto max-h-[90dvh] w-full max-w-[430px] gap-0 rounded-t-2xl p-0"
      >
        <SheetHeader className="border-b border-border/80">
          <SheetTitle className="text-[17px] font-semibold">
            {isEdit ? "Edit workout" : "New workout"}
          </SheetTitle>
          <SheetDescription>
            {isEdit
              ? "Update the name or exercises."
              : "Name it, filter by tag, then pick exercises."}
          </SheetDescription>
        </SheetHeader>

        <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-4 py-4">
          <div className="space-y-1.5">
            <Label htmlFor="workout-name">Name</Label>
            <Input
              id="workout-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Legs + shoulders"
              maxLength={60}
              className="h-11"
            />
          </div>

          <div className="space-y-2">
            <p className="text-[13px] font-medium text-foreground">
              Exercises · {selected.length} selected
            </p>
            <TagFilterBar value={tag} onChange={setTag} />
            <ul className="overflow-hidden rounded-xl bg-muted/60">
              {filtered.map((ex) => {
                const checked = selectedSet.has(ex.id);
                return (
                  <li key={ex.id}>
                    <label className="flex min-h-11 cursor-pointer items-center gap-3 px-3 py-2.5 active:bg-muted">
                      <Checkbox
                        checked={checked}
                        onCheckedChange={() => toggle(ex.id)}
                      />
                      <span className="min-w-0 flex-1">
                        <span className="block text-[14px] font-medium leading-snug">
                          {ex.name}
                        </span>
                        <span className="block text-[11px] text-muted-foreground">
                          {ex.focus}
                        </span>
                      </span>
                    </label>
                  </li>
                );
              })}
              {filtered.length === 0 ? (
                <li className="px-3 py-6 text-center text-[13px] text-muted-foreground">
                  No exercises for this tag.
                </li>
              ) : null}
            </ul>
          </div>

          {error ? (
            <p className="text-[13px] text-destructive" role="alert">
              {error}
            </p>
          ) : null}
        </div>

        <SheetFooter className="border-t border-border/80">
          <Button
            className="h-11 w-full rounded-xl font-semibold"
            disabled={saving || !name.trim() || selected.length === 0}
            onClick={() => void onSave()}
          >
            {saving
              ? "Saving…"
              : isEdit
                ? "Save changes"
                : "Save workout"}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
