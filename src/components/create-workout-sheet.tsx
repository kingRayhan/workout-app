"use client";

import { Search } from "lucide-react";
import { useMemo, useState } from "react";
import { IconImage } from "@/components/icon-tile";
import { TagFilterBar } from "@/components/workout-catalog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  allCatalogExercises,
  filterExercisesByQuery,
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
  const [query, setQuery] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [prevOpen, setPrevOpen] = useState(false);
  if (open !== prevOpen) {
    setPrevOpen(open);
    if (open) {
      setName(workout?.name ?? "");
      setSelected(workout ? [...workout.exerciseIds] : []);
      setTag(null);
      setQuery("");
      setError(null);
      setSaving(false);
    }
  }

  const selectedSet = useMemo(() => new Set(selected), [selected]);
  const all = useMemo(() => allCatalogExercises(), []);
  const filtered = useMemo(
    () => filterExercisesByQuery(filterExercisesByTag(all, tag), query),
    [all, tag, query],
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
    setQuery("");
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
    <Drawer
      open={open}
      onOpenChange={(next) => {
        if (!next) reset();
        onOpenChange(next);
      }}
    >
      <DrawerContent className="mx-auto w-full max-w-[430px] data-[vaul-drawer-direction=bottom]:max-h-[90dvh]">
        <DrawerHeader className="border-b border-border/80 text-left group-data-[vaul-drawer-direction=bottom]/drawer-content:text-left">
          <DrawerTitle className="text-[17px] font-semibold">
            {isEdit ? "Edit workout" : "New workout"}
          </DrawerTitle>
          <DrawerDescription>
            {isEdit
              ? "Update the name or exercises. Reorder from the workout sheet."
              : "Name it, filter by tag, then pick exercises."}
          </DrawerDescription>
        </DrawerHeader>

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
            <div className="sticky top-0 z-10 -mx-4 space-y-2 bg-popover px-4 pb-2">
              <div className="relative">
                <IconImage
                  icon={Search}
                  className="pointer-events-none absolute left-2.5 top-1/2 size-5 -translate-y-1/2"
                />
                <Input
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search exercises"
                  aria-label="Search exercises"
                  className="h-10 rounded-xl bg-muted/80 pl-9 pr-3 text-[15px] dark:bg-muted/80"
                  autoCapitalize="off"
                  autoCorrect="off"
                  enterKeyHint="search"
                />
              </div>
              <TagFilterBar value={tag} onChange={setTag} />
            </div>
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
                  {query.trim()
                    ? `No exercises match “${query.trim()}”.`
                    : "No exercises for this tag."}
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

        <DrawerFooter className="border-t border-border/80">
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
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
