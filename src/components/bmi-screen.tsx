"use client";

import { ChevronLeft, History } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { AppHeader } from "@/components/app-header";
import { BMI_TEXT, BmiGauge } from "@/components/bmi-gauge";
import { BmiAbout, BmiCategoriesTable } from "@/components/bmi-info";
import { TargetWeightCard } from "@/components/bmi-target";
import { GoogleSignInButton } from "@/components/google-sign-in-button";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useBodyWeight, useProfile } from "@/hooks/use-user-data";
import { useAuth } from "@/lib/auth";
import { bmi, bmiCategory, healthyRange } from "@/lib/bmi";
import { localDateKey, parseLocalDateKey } from "@/lib/dates";
import {
  cmToFtIn,
  formatHeight,
  formatWeight,
  ftInToCm,
  kgToLb,
  lbToKg,
  round1,
  type HeightUnit,
  type WeightUnit,
} from "@/lib/units";
import { setBodyWeight, setHeightCm } from "@/lib/user-data";
import { cn } from "@/lib/utils";

function parseNumber(raw: string) {
  const n = Number(raw.trim().replace(",", "."));
  return raw.trim() && Number.isFinite(n) ? n : null;
}

function longDate(key: string) {
  return parseLocalDateKey(key).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

const UNITS_KEY = "workoutland:bmi-units";

function UnitToggle<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: { id: T; label: string }[];
  onChange: (v: T) => void;
}) {
  return (
    <div
      role="radiogroup"
      aria-label={label}
      className="flex rounded-full bg-muted p-0.5"
    >
      {options.map((o) => (
        <button
          key={o.id}
          type="button"
          role="radio"
          aria-checked={value === o.id}
          onClick={() => onChange(o.id)}
          className={cn(
            "min-w-10 rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide transition-colors",
            value === o.id
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground",
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

function SuffixInput({
  id,
  suffix,
  value,
  placeholder,
  onChange,
  disabled,
  label,
}: {
  id: string;
  suffix: string;
  value: string;
  placeholder: string;
  onChange: (v: string) => void;
  disabled?: boolean;
  label: string;
}) {
  return (
    <div className="relative min-w-0 flex-1">
      <Input
        id={id}
        type="text"
        inputMode="decimal"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        aria-label={label}
        className="h-12 rounded-xl pr-12 text-[17px] tabular-nums"
      />
      <span className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-[12px] font-semibold uppercase text-muted-foreground">
        {suffix}
      </span>
    </div>
  );
}

export function BmiScreen() {
  const { user, loading: authLoading } = useAuth();
  const today = localDateKey();
  const { profile, loading: profileLoading } = useProfile();
  const { current, previous, loading: weightLoading } = useBodyWeight(today);
  const [heightUnit, setHeightUnit] = useState<HeightUnit>("cm");
  const [weightUnit, setWeightUnit] = useState<WeightUnit>("kg");
  const [cmDraft, setCmDraft] = useState<string | null>(null);
  const [ftDraft, setFtDraft] = useState<string | null>(null);
  const [inDraft, setInDraft] = useState<string | null>(null);
  const [weightDraft, setWeightDraft] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(UNITS_KEY);
      if (!raw) return;
      const u = JSON.parse(raw) as { height?: HeightUnit; weight?: WeightUnit };
      if (u.height === "cm" || u.height === "ftin") setHeightUnit(u.height);
      if (u.weight === "kg" || u.weight === "lb") setWeightUnit(u.weight);
    } catch {}
  }, []);

  const loading = authLoading || profileLoading || weightLoading;
  const latest = current ?? previous;
  const savedHeight = profile.heightCm;
  const savedBmi =
    latest && savedHeight ? bmi(latest.kg, savedHeight) : null;

  const savedFtIn = savedHeight ? cmToFtIn(savedHeight) : null;
  const cmText = cmDraft ?? (savedHeight ? String(savedHeight) : "");
  const ftText = ftDraft ?? (savedFtIn ? String(savedFtIn.ft) : "");
  const inText = inDraft ?? (savedFtIn ? String(savedFtIn.inch) : "");
  const weightText =
    weightDraft ??
    (latest
      ? String(weightUnit === "kg" ? latest.kg : round1(kgToLb(latest.kg)))
      : "");

  const heightEdited =
    heightUnit === "cm" ? cmDraft !== null : ftDraft !== null || inDraft !== null;
  let heightCm: number | null = savedHeight;
  if (heightEdited) {
    if (heightUnit === "cm") {
      heightCm = parseNumber(cmText);
    } else {
      const ft = parseNumber(ftText);
      const inch = inText.trim() ? parseNumber(inText) : 0;
      heightCm =
        ft !== null && inch !== null && inch >= 0 && inch < 12
          ? ftInToCm(ft, inch)
          : null;
    }
  }
  let weightKg: number | null = latest?.kg ?? null;
  if (weightDraft !== null) {
    const w = parseNumber(weightDraft);
    weightKg = w === null ? null : weightUnit === "kg" ? w : lbToKg(w);
  }

  const valid =
    heightCm !== null &&
    heightCm >= 100 &&
    heightCm <= 250 &&
    weightKg !== null &&
    weightKg >= 20 &&
    weightKg <= 400;
  const previewBmi = valid ? bmi(weightKg!, heightCm!) : null;
  const heightChanged = valid && Math.round(heightCm!) !== savedHeight;
  const weightChanged = valid && round1(weightKg!) !== current?.kg;
  const dirty = heightChanged || weightChanged;

  const shownBmi = previewBmi ?? savedBmi;
  const rangeHeight = valid ? heightCm : savedHeight;
  const range = rangeHeight ? healthyRange(rangeHeight) : null;
  const rangeWeight = valid ? weightKg : latest?.kg ?? null;

  function persistUnits(height: HeightUnit, weight: WeightUnit) {
    try {
      localStorage.setItem(UNITS_KEY, JSON.stringify({ height, weight }));
    } catch {}
  }

  function switchHeightUnit(next: HeightUnit) {
    if (next === heightUnit) return;
    if (heightEdited && heightCm !== null) {
      const { ft, inch } = cmToFtIn(heightCm);
      setCmDraft(String(Math.round(heightCm)));
      setFtDraft(String(ft));
      setInDraft(String(inch));
    } else {
      setCmDraft(null);
      setFtDraft(null);
      setInDraft(null);
    }
    setHeightUnit(next);
    persistUnits(next, weightUnit);
  }

  function switchWeightUnit(next: WeightUnit) {
    if (next === weightUnit) return;
    if (weightDraft !== null && weightKg !== null) {
      setWeightDraft(String(round1(next === "kg" ? weightKg : kgToLb(weightKg))));
    } else {
      setWeightDraft(null);
    }
    setWeightUnit(next);
    persistUnits(heightUnit, next);
  }

  async function save() {
    if (!user || !valid) return;
    setSaving(true);
    setError(null);
    setSaved(false);
    try {
      if (heightChanged) await setHeightCm(user.uid, heightCm!);
      if (weightChanged) await setBodyWeight(user.uid, today, round1(weightKg!));
      setCmDraft(null);
      setFtDraft(null);
      setInDraft(null);
      setWeightDraft(null);
      setSaved(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn’t save BMI.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex flex-col pb-6">
      <AppHeader
        title="Body mass index"
        subtitle="Save height & weight to track your BMI."
        action={
          <Link
            href="/you"
            className="-mr-1 mt-4 flex items-center gap-0.5 rounded-lg px-1.5 py-1 text-[13px] font-semibold text-primary"
          >
            <ChevronLeft className="size-4" aria-hidden />
            You
          </Link>
        }
      />

      <div className="flex flex-col gap-3 px-4 pt-1">
        {!authLoading && !user ? (
          <section className="rounded-2xl bg-card px-4 py-4 ring-1 ring-border/80">
            <p className="text-[13px] text-muted-foreground">
              Sign in to save your BMI profile.
            </p>
            <div className="mt-3">
              <GoogleSignInButton />
            </div>
          </section>
        ) : null}

        <section className="rounded-2xl bg-card px-4 pb-5 pt-4 ring-1 ring-border/80">
          {loading ? (
            <div className="flex flex-col items-center gap-3 py-2">
              <Skeleton className="h-[120px] w-[240px] rounded-t-full" />
              <Skeleton className="h-10 w-24 rounded-lg" />
            </div>
          ) : (
            <BmiGauge value={shownBmi} />
          )}
          {previewBmi !== null && dirty ? (
            <p className="mt-2 text-center text-[11px] text-muted-foreground">
              Preview — save to record it
            </p>
          ) : null}
        </section>

        <section className="rounded-2xl bg-card px-4 py-4 ring-1 ring-border/80">
          <h2 className="text-[15px] font-semibold">Metrics</h2>
          {loading ? (
            <div className="mt-3 flex flex-col gap-3">
              <Skeleton className="h-12 w-full rounded-xl" />
              <Skeleton className="h-12 w-full rounded-xl" />
              <Skeleton className="h-12 w-full rounded-xl" />
            </div>
          ) : (
            <form
              className="mt-3 flex flex-col gap-3"
              onSubmit={(e) => {
                e.preventDefault();
                void save();
              }}
            >
              <div>
                <div className="flex items-center justify-between gap-2">
                  <label
                    htmlFor={heightUnit === "cm" ? "bmi-cm" : "bmi-ft"}
                    className="text-[12px] font-medium text-muted-foreground"
                  >
                    Height
                  </label>
                  <UnitToggle
                    label="Height unit"
                    value={heightUnit}
                    options={[
                      { id: "cm", label: "cm" },
                      { id: "ftin", label: "ft/in" },
                    ]}
                    onChange={switchHeightUnit}
                  />
                </div>
                <div className="mt-1.5 flex gap-2">
                  {heightUnit === "cm" ? (
                    <SuffixInput
                      id="bmi-cm"
                      suffix="cm"
                      label="Height in centimeters"
                      value={cmText}
                      placeholder="175"
                      disabled={!user || saving}
                      onChange={(v) => {
                        setCmDraft(v);
                        setSaved(false);
                      }}
                    />
                  ) : (
                    <>
                      <SuffixInput
                        id="bmi-ft"
                        suffix="ft"
                        label="Height, feet"
                        value={ftText}
                        placeholder="5"
                        disabled={!user || saving}
                        onChange={(v) => {
                          setFtDraft(v);
                          if (inDraft === null) setInDraft(inText);
                          setSaved(false);
                        }}
                      />
                      <SuffixInput
                        id="bmi-in"
                        suffix="in"
                        label="Height, inches"
                        value={inText}
                        placeholder="9"
                        disabled={!user || saving}
                        onChange={(v) => {
                          setInDraft(v);
                          if (ftDraft === null) setFtDraft(ftText);
                          setSaved(false);
                        }}
                      />
                    </>
                  )}
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between gap-2">
                  <label
                    htmlFor="bmi-weight"
                    className="text-[12px] font-medium text-muted-foreground"
                  >
                    Weight today
                  </label>
                  <UnitToggle
                    label="Weight unit"
                    value={weightUnit}
                    options={[
                      { id: "kg", label: "kg" },
                      { id: "lb", label: "lb" },
                    ]}
                    onChange={switchWeightUnit}
                  />
                </div>
                <div className="mt-1.5 flex">
                  <SuffixInput
                    id="bmi-weight"
                    suffix={weightUnit}
                    label={`Weight in ${weightUnit === "kg" ? "kilograms" : "pounds"}`}
                    value={weightText}
                    placeholder={weightUnit === "kg" ? "70" : "155"}
                    disabled={!user || saving}
                    onChange={(v) => {
                      setWeightDraft(v);
                      setSaved(false);
                    }}
                  />
                </div>
              </div>
              <Button
                type="submit"
                className="mt-1 h-12 rounded-xl text-[13px] font-bold uppercase tracking-wider"
                disabled={!user || saving || !valid || !dirty}
              >
                {saving ? "Saving…" : saved && !dirty ? "Saved" : "Save BMI"}
              </Button>
              {!valid && (heightEdited || weightDraft !== null) ? (
                <p className="text-[12px] text-muted-foreground">
                  Height {heightUnit === "cm" ? "100–250 cm" : "3′4″–8′2″"},
                  weight {weightUnit === "kg" ? "20–400 kg" : "44–880 lb"}.
                </p>
              ) : null}
              {error ? (
                <p className="text-[12px] text-destructive" role="alert">
                  {error}
                </p>
              ) : null}
            </form>
          )}
        </section>

        {!loading && user ? (
          <TargetWeightCard
            targetKg={profile.targetKg}
            currentKg={latest?.kg ?? null}
            heightCm={savedHeight}
            unit={weightUnit}
          />
        ) : null}

        {!loading && latest && savedBmi !== null ? (
          <section className="flex items-center gap-3 rounded-2xl bg-card px-4 py-3.5 ring-1 ring-border/80">
            <span className="grid size-9 place-items-center rounded-full bg-muted text-muted-foreground">
              <History className="size-4" aria-hidden />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                Last recorded
              </p>
              <p className="text-[13px]">
                {longDate(latest.date)} · {formatWeight(latest.kg, weightUnit)}
              </p>
            </div>
            <p
              className={cn(
                "text-[22px] font-semibold tabular-nums",
                BMI_TEXT[bmiCategory(savedBmi).id],
              )}
            >
              {savedBmi}
            </p>
          </section>
        ) : null}

        {!loading && range ? (
          <section className="rounded-2xl bg-card px-4 py-4 ring-1 ring-border/80">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Healthy weight
            </p>
            <p className="mt-1 text-[17px] font-semibold tabular-nums">
              {weightUnit === "kg"
                ? `${range.min}–${range.max} kg`
                : `${round1(kgToLb(range.min))}–${round1(kgToLb(range.max))} lb`}
            </p>
            <p className="mt-0.5 text-[12px] text-muted-foreground">
              {rangeWeight === null
                ? `BMI 18.5–25 at ${formatHeight(rangeHeight!, heightUnit)}.`
                : rangeWeight < range.min
                  ? `${formatWeight(range.min - rangeWeight, weightUnit)} below the healthy range.`
                  : rangeWeight > range.max
                    ? `${formatWeight(rangeWeight - range.max, weightUnit)} above the healthy range.`
                    : "You’re in the healthy range."}
            </p>
            <Link
              href="/you"
              className="mt-3 inline-block text-[12px] font-semibold text-primary"
            >
              See weight trend
            </Link>
          </section>
        ) : null}

        <BmiCategoriesTable
          key={shownBmi !== null ? bmiCategory(shownBmi).id : "none"}
          value={shownBmi}
        />
        <BmiAbout />
      </div>
    </div>
  );
}
