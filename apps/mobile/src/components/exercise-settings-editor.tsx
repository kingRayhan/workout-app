"use client";

import { Minus, Plus, RotateCcw } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  cardioMetrics,
  isCardioExercise,
  type CardioMetric,
} from "@workoutland/data/catalog";
import {
  formatRest,
  SETTINGS_LIMITS,
  type CardioFields,
  type ExerciseSettings,
} from "@/lib/user-data";
import { cn } from "@/lib/utils";

const REST_PRESETS = [30, 60, 90, 120, 180] as const;
const WEIGHT_STEP = 1;

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

export function Stepper({
  label,
  value,
  onChange,
  step,
  min,
  max,
  suffix,
  nullable = false,
  placeholder = "—",
  decimal = false,
  quantum = 0.25,
}: {
  label: string;
  value: number | null;
  onChange: (value: number | null) => void;
  step: number;
  min: number;
  max: number;
  suffix?: string;
  nullable?: boolean;
  placeholder?: string;
  decimal?: boolean;
  /** Typed decimals snap to this increment. */
  quantum?: number;
}) {
  const [draft, setDraft] = useState<string | null>(null);
  const shown = draft ?? (value === null ? "" : String(value));

  function commit(raw: string) {
    setDraft(null);
    const trimmed = raw.trim();
    if (!trimmed) {
      if (nullable) onChange(null);
      return;
    }
    const n = decimal ? Number.parseFloat(trimmed) : Number.parseInt(trimmed, 10);
    if (!Number.isFinite(n)) return;
    const snapped = decimal
      ? Math.round(Math.round(n / quantum) * quantum * 100) / 100
      : n;
    onChange(clamp(snapped, min, max));
  }

  function bump(dir: 1 | -1) {
    setDraft(null);
    if (value === null) {
      if (dir === 1) onChange(nullable ? step : min);
      return;
    }
    const next = Math.round((value + dir * step) * 100) / 100;
    if (nullable && next <= 0) {
      onChange(null);
      return;
    }
    onChange(clamp(next, min, max));
  }

  return (
    <div className="rounded-xl bg-muted/60 p-2">
      <p className="px-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
      <div className="mt-1 flex items-center gap-1">
        <button
          type="button"
          onClick={() => bump(-1)}
          disabled={nullable ? value === null : value === null || value <= min}
          aria-label={`Decrease ${label.toLowerCase()}`}
          className="grid size-9 shrink-0 place-items-center rounded-lg bg-background text-foreground active:bg-muted disabled:opacity-40"
        >
          <Minus className="size-4" aria-hidden />
        </button>
        <label className="flex min-w-0 flex-1 items-baseline justify-center gap-0.5">
          <input
            inputMode={decimal ? "decimal" : "numeric"}
            value={shown}
            placeholder={placeholder}
            aria-label={label}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={(e) => commit(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") e.currentTarget.blur();
            }}
            className="w-full min-w-0 bg-transparent text-center text-[17px] font-semibold tabular-nums outline-none placeholder:text-muted-foreground"
          />
          {suffix && value !== null ? (
            <span className="shrink-0 text-[11px] text-muted-foreground">
              {suffix}
            </span>
          ) : null}
        </label>
        <button
          type="button"
          onClick={() => bump(1)}
          disabled={value !== null && value >= max}
          aria-label={`Increase ${label.toLowerCase()}`}
          className="grid size-9 shrink-0 place-items-center rounded-lg bg-background text-foreground active:bg-muted disabled:opacity-40"
        >
          <Plus className="size-4" aria-hidden />
        </button>
      </div>
    </div>
  );
}

/** Time plus whichever machine settings apply (speed, incline, level). */
export function CardioSteppers({
  value,
  onChange,
  metrics,
}: {
  value: CardioFields;
  onChange: (next: CardioFields) => void;
  metrics: CardioMetric[];
}) {
  const { durationMin, speedKmh, inclinePct, level } = SETTINGS_LIMITS;
  const set = (patch: Partial<CardioFields>) => onChange({ ...value, ...patch });
  return (
    <div className="grid grid-cols-2 gap-2">
      <Stepper
        label="Time"
        value={value.durationMin}
        onChange={(n) => n !== null && set({ durationMin: n })}
        step={5}
        min={durationMin.min}
        max={durationMin.max}
        suffix="min"
      />
      {metrics.includes("speedKmh") ? (
        <Stepper
          label="Speed"
          value={value.speedKmh}
          onChange={(n) => set({ speedKmh: n })}
          step={0.5}
          min={speedKmh.min}
          max={speedKmh.max}
          suffix="km/h"
          nullable
          decimal
          quantum={0.1}
        />
      ) : null}
      {metrics.includes("inclinePct") ? (
        <Stepper
          label="Incline"
          value={value.inclinePct}
          onChange={(n) => set({ inclinePct: n })}
          step={1}
          min={inclinePct.min}
          max={inclinePct.max}
          suffix="%"
          nullable
          placeholder="Flat"
          decimal
          quantum={0.5}
        />
      ) : null}
      {metrics.includes("level") ? (
        <Stepper
          label="Level"
          value={value.level}
          onChange={(n) => set({ level: n })}
          step={1}
          min={level.min}
          max={level.max}
          nullable
        />
      ) : null}
    </div>
  );
}

export function ExerciseSettingsEditor({
  exerciseId,
  initial,
  defaults,
  customized,
  onSave,
  onReset,
  onCancel,
}: {
  exerciseId: string;
  initial: ExerciseSettings;
  defaults: ExerciseSettings;
  customized: boolean;
  onSave: (settings: ExerciseSettings) => Promise<void>;
  onReset: () => Promise<void>;
  onCancel: () => void;
}) {
  const [value, setValue] = useState(initial);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const cardio = isCardioExercise(exerciseId);

  const dirty = (Object.keys(initial) as (keyof ExerciseSettings)[]).some(
    (k) => value[k] !== initial[k],
  );

  async function run(action: () => Promise<void>) {
    setSaving(true);
    setError(null);
    try {
      await action();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Couldn’t save.");
      setSaving(false);
    }
  }

  return (
    <div className="space-y-2.5 px-3 pb-3 pt-1">
      {cardio ? (
        <CardioSteppers
          value={value}
          onChange={(next) => setValue((v) => ({ ...v, ...next }))}
          metrics={cardioMetrics(exerciseId)}
        />
      ) : (
        <StrengthTargets value={value} onChange={setValue} />
      )}

      {error ? (
        <p className="px-1 text-[12px] text-destructive" role="alert">
          {error}
        </p>
      ) : null}

      <div className="flex items-center gap-2">
        {customized ? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            disabled={saving}
            onClick={() => void run(onReset)}
            className="h-9 rounded-lg px-2.5 text-muted-foreground"
          >
            <RotateCcw className="size-3.5" aria-hidden />
            Reset to{" "}
            {cardio ? `${defaults.durationMin} min` : `${defaults.sets}×${defaults.reps}`}
          </Button>
        ) : null}
        <div className="ml-auto flex gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={saving}
            onClick={onCancel}
            className="h-9 rounded-lg"
          >
            Cancel
          </Button>
          <Button
            type="button"
            size="sm"
            disabled={saving || !dirty}
            onClick={() => void run(() => onSave(value))}
            className="h-9 rounded-lg font-semibold"
          >
            {saving ? "Saving…" : "Save"}
          </Button>
        </div>
      </div>
    </div>
  );
}

function StrengthTargets({
  value,
  onChange,
}: {
  value: ExerciseSettings;
  onChange: (update: (v: ExerciseSettings) => ExerciseSettings) => void;
}) {
  const { sets, reps, weightKg } = SETTINGS_LIMITS;
  const setValue = onChange;
  return (
    <>
      <div className="grid grid-cols-2 gap-2">
        <Stepper
          label="Sets"
          value={value.sets}
          onChange={(n) => n !== null && setValue((v) => ({ ...v, sets: n }))}
          step={1}
          min={sets.min}
          max={sets.max}
        />
        <Stepper
          label="Reps"
          value={value.reps}
          onChange={(n) => n !== null && setValue((v) => ({ ...v, reps: n }))}
          step={1}
          min={reps.min}
          max={reps.max}
        />
      </div>
      <Stepper
        label="Weight to lift"
        value={value.weightKg}
        onChange={(n) => setValue((v) => ({ ...v, weightKg: n }))}
        step={WEIGHT_STEP}
        min={weightKg.min}
        max={weightKg.max}
        suffix="kg"
        nullable
        placeholder="None (bodyweight)"
        decimal
      />

      <div className="rounded-xl bg-muted/60 p-2">
        <p className="px-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          Rest between sets
        </p>
        <div className="mt-1.5 flex flex-wrap gap-1.5">
          {[null, ...REST_PRESETS].map((sec) => {
            const active = value.restSec === sec;
            return (
              <button
                key={sec ?? "off"}
                type="button"
                onClick={() => setValue((v) => ({ ...v, restSec: sec }))}
                aria-pressed={active}
                className={cn(
                  "rounded-full px-3 py-1.5 text-[12px] font-semibold transition-colors",
                  active
                    ? "bg-primary text-primary-foreground"
                    : "bg-background text-muted-foreground active:bg-muted",
                )}
              >
                {sec === null ? "Off" : formatRest(sec)}
              </button>
            );
          })}
        </div>
      </div>
    </>
  );
}
