"use client";

import { Target } from "lucide-react";
import { IconImage } from "@/components/icon-tile";
import { useState } from "react";
import { BMI_PILL } from "@/components/bmi-gauge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/lib/auth";
import { bmi, bmiCategory, kgForBmi } from "@/lib/bmi";
import {
  formatWeight,
  kgToLb,
  lbToKg,
  round1,
  type WeightUnit,
} from "@/lib/units";
import { setTargetKg } from "@/lib/user-data";
import { cn } from "@/lib/utils";

function toUnit(kg: number, unit: WeightUnit) {
  return round1(unit === "kg" ? kg : kgToLb(kg));
}

export function TargetWeightCard({
  targetKg,
  currentKg,
  heightCm,
  unit,
}: {
  targetKg: number | null;
  currentKg: number | null;
  heightCm: number | null;
  unit: WeightUnit;
}) {
  const { user } = useAuth();
  const [draft, setDraft] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const editing = draft !== null || targetKg === null;
  const text = draft ?? "";
  const parsed = Number(text.trim().replace(",", "."));
  const draftKg =
    text.trim() && Number.isFinite(parsed)
      ? unit === "kg"
        ? parsed
        : lbToKg(parsed)
      : null;
  const validDraft = draftKg !== null && draftKg >= 20 && draftKg <= 400;

  const shownKg = editing ? (validDraft ? draftKg : null) : targetKg;
  const targetBmi = shownKg !== null && heightCm ? bmi(shownKg, heightCm) : null;
  const targetCategory = targetBmi !== null ? bmiCategory(targetBmi) : null;
  const diff = shownKg !== null && currentKg !== null ? currentKg - shownKg : null;

  const suggestions = heightCm
    ? [
        { label: "BMI 22", kg: kgForBmi(22, heightCm) },
        { label: "BMI 24.9", kg: kgForBmi(24.9, heightCm) },
      ]
    : [];

  async function save(kg: number | null) {
    if (!user) return;
    setSaving(true);
    setError(null);
    try {
      await setTargetKg(user.uid, kg === null ? null : round1(kg));
      setDraft(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn’t save target.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="rounded-2xl bg-card px-4 py-4 ring-1 ring-border/80">
      <div className="flex items-center justify-between gap-2">
        <h2 className="flex items-center gap-2 text-[15px] font-semibold">
          <IconImage icon={Target} className="size-5" />
          Target weight
        </h2>
        {!editing ? (
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="sm"
              className="text-muted-foreground"
              onClick={() => setDraft(String(toUnit(targetKg!, unit)))}
            >
              Edit
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-muted-foreground"
              disabled={saving}
              onClick={() => void save(null)}
            >
              Clear
            </Button>
          </div>
        ) : null}
      </div>

      {!editing && targetKg !== null ? (
        <div className="mt-2 flex items-end justify-between gap-3">
          <p className="text-[28px] font-semibold leading-none tracking-tight tabular-nums">
            {toUnit(targetKg, unit)}
            <span className="ml-1 text-[14px] font-medium text-muted-foreground">
              {unit}
            </span>
          </p>
          {targetBmi !== null && targetCategory ? (
            <span
              className={cn(
                "rounded-full px-2 py-0.5 text-[11px] font-semibold tabular-nums",
                BMI_PILL[targetCategory.id],
              )}
            >
              BMI {targetBmi} · {targetCategory.label}
            </span>
          ) : null}
        </div>
      ) : (
        <form
          className="mt-3 flex flex-col gap-2.5"
          onSubmit={(e) => {
            e.preventDefault();
            if (validDraft) void save(draftKg);
          }}
        >
          <div className="flex items-center gap-2">
            <div className="relative min-w-0 flex-1">
              <Input
                type="text"
                inputMode="decimal"
                value={text}
                onChange={(e) => setDraft(e.target.value)}
                placeholder={
                  currentKg !== null
                    ? `e.g. ${toUnit(currentKg - 5, unit)}`
                    : unit === "kg"
                      ? "70"
                      : "155"
                }
                disabled={!user || saving}
                aria-label={`Target weight in ${unit === "kg" ? "kilograms" : "pounds"}`}
                className="h-12 rounded-xl pr-12 text-[17px] tabular-nums"
              />
              <span className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-[12px] font-semibold uppercase text-muted-foreground">
                {unit}
              </span>
            </div>
            {targetKg !== null ? (
              <Button
                type="button"
                variant="ghost"
                className="h-12 rounded-xl"
                onClick={() => {
                  setDraft(null);
                  setError(null);
                }}
              >
                Cancel
              </Button>
            ) : null}
            <Button
              type="submit"
              className="h-12 rounded-xl px-5 font-semibold"
              disabled={!user || saving || !validDraft}
            >
              {saving ? "Saving…" : "Save"}
            </Button>
          </div>
          {suggestions.length ? (
            <div className="flex flex-wrap gap-1.5">
              {suggestions.map((s) => (
                <button
                  key={s.label}
                  type="button"
                  disabled={!user || saving}
                  onClick={() => setDraft(String(toUnit(s.kg, unit)))}
                  className="rounded-full bg-muted px-2.5 py-1 text-[11px] font-medium text-muted-foreground active:bg-muted/70"
                >
                  {s.label} · {toUnit(s.kg, unit)} {unit}
                </button>
              ))}
            </div>
          ) : null}
          {targetBmi !== null && targetCategory ? (
            <p className="text-[12px] text-muted-foreground">
              Target BMI{" "}
              <span className="font-semibold text-foreground tabular-nums">
                {targetBmi}
              </span>{" "}
              · {targetCategory.label}
              {targetCategory.id !== "normal"
                ? " — outside the healthy range"
                : ""}
            </p>
          ) : null}
        </form>
      )}

      {diff !== null ? (
        <p className="mt-3 rounded-xl bg-muted/60 px-3 py-2 text-[12px] text-muted-foreground">
          {Math.abs(diff) < 0.1 ? (
            <span className="font-semibold text-primary">
              Target reached — nice work.
            </span>
          ) : (
            <>
              <span className="font-semibold text-foreground tabular-nums">
                {formatWeight(Math.abs(diff), unit)}
              </span>{" "}
              to {diff > 0 ? "lose" : "gain"} from your latest weigh-in.
            </>
          )}
        </p>
      ) : null}

      {error ? (
        <p className="mt-2 text-[12px] text-destructive" role="alert">
          {error}
        </p>
      ) : null}
    </section>
  );
}
