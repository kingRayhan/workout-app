"use client";

import {
  CalendarDays,
  ChartLine,
  ChevronRight,
  CircleCheck,
  History,
  Minus,
  Scale,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";
import { SectionTitle } from "@/components/icon-tile";
import { TargetProgress } from "@/components/target-progress";
import { WeightSparkline } from "@/components/weight-sparkline";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useBodyWeight, useProfile } from "@/hooks/use-user-data";
import { useAuth } from "@/lib/auth";
import { bmi, bmiCategory } from "@/lib/bmi";
import { localDateKey, parseLocalDateKey } from "@/lib/dates";
import { setBodyWeight } from "@/lib/user-data";
import { cn } from "@/lib/utils";

const WEIGHT_REPORT_HREF = "/report/weight";

const CATEGORY_TEXT = {
  under: "text-sky-400",
  normal: "text-primary",
  over: "text-amber-400",
  obese: "text-red-400",
} as const;

const RECENT_COUNT = 3;

function shortDate(key: string) {
  return parseLocalDateKey(key).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}

function relativeDate(key: string) {
  const today = localDateKey();
  const y = parseLocalDateKey(today);
  y.setDate(y.getDate() - 1);
  if (key === today) return "Today";
  if (key === localDateKey(y)) return "Yesterday";
  return parseLocalDateKey(key).toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

export function BodyWeightCard({
  date,
  disabled = false,
}: {
  date: string;
  disabled?: boolean;
}) {
  const { user } = useAuth();
  const { current, previous, entries, loading, error } = useBodyWeight(date);
  const recent = entries.slice(-RECENT_COUNT - 1).reverse();
  const { profile } = useProfile();
  const [draft, setDraft] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const latest = current ?? previous;
  const isToday = date === localDateKey();
  const editing = draft !== null;
  const value = draft ?? (current ? String(current.kg) : "");
  const delta =
    current && previous
      ? Math.round((current.kg - previous.kg) * 10) / 10
      : null;
  const latestBmi =
    latest && profile.heightCm ? bmi(latest.kg, profile.heightCm) : null;
  const category = latestBmi !== null ? bmiCategory(latestBmi) : null;

  async function save() {
    if (!user || draft === null) return;
    const trimmed = draft.trim();
    setSaving(true);
    setSaveError(null);
    try {
      await setBodyWeight(
        user.uid,
        date,
        trimmed === "" ? null : Number(trimmed.replace(",", ".")),
      );
      setDraft(null);
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "Couldn’t save.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <section
      data-tour="body-weight"
      className="animate-rise rounded-2xl bg-card px-4 py-3.5 ring-1 ring-border/80"
    >
      <div className="flex items-center justify-between gap-2">
        <SectionTitle icon={Scale} tone="amber">
          Body weight
        </SectionTitle>
        <Link
          href={WEIGHT_REPORT_HREF}
          className="flex items-center gap-1 text-[12px] font-semibold text-primary"
        >
          <ChartLine className="size-3.5" aria-hidden />
          Trend
        </Link>
      </div>

      {loading ? (
        <>
          <Skeleton className="mt-2.5 h-8 w-32 rounded-lg" />
          <Skeleton className="mt-3 h-10 w-full rounded-xl" />
        </>
      ) : (
        <>
          {latest ? (
            <div className="mt-1.5 flex items-end justify-between gap-3">
              <div>
                <p className="text-[26px] font-semibold leading-none tracking-tight tabular-nums">
                  {latest.kg}
                  <span className="ml-1 text-[14px] font-medium text-muted-foreground">
                    kg
                  </span>
                </p>
                <p className="mt-1 flex items-center gap-1 text-[12px] text-muted-foreground">
                  {delta !== null && current ? (
                    delta > 0 ? (
                      <TrendingUp className="size-3.5" aria-hidden />
                    ) : delta < 0 ? (
                      <TrendingDown className="size-3.5" aria-hidden />
                    ) : (
                      <Minus className="size-3.5" aria-hidden />
                    )
                  ) : current ? (
                    <CircleCheck className="size-3.5 text-primary" aria-hidden />
                  ) : (
                    <History className="size-3.5" aria-hidden />
                  )}
                  {current
                    ? delta !== null
                      ? `${delta > 0 ? "+" : ""}${delta} kg since ${shortDate(previous!.date)}`
                      : isToday
                        ? "Logged today"
                        : `Logged ${shortDate(current.date)}`
                    : `Last logged ${shortDate(latest.date)}`}
                </p>
              </div>
              {latestBmi !== null && category ? (
                <div className="text-right">
                  <p className="text-[11px] text-muted-foreground">BMI</p>
                  <p className="text-[15px] font-semibold tabular-nums">
                    {latestBmi}
                  </p>
                  <p className={cn("text-[11px] font-medium", CATEGORY_TEXT[category.id])}>
                    {category.label}
                  </p>
                </div>
              ) : !profile.heightCm ? (
                <Link
                  href="/you/bmi"
                  className="text-right text-[11px] text-muted-foreground underline-offset-2 active:underline"
                >
                  Add height
                  <br />
                  for BMI
                </Link>
              ) : null}
            </div>
          ) : (
            <p className="mt-1.5 text-[12px] text-muted-foreground">
              No weight logged yet — add today’s below.
            </p>
          )}

          {latest ? (
            <div className="mt-3">
              <WeightSparkline
                entries={entries}
                endDate={date}
                targetKg={profile.targetKg}
              />
            </div>
          ) : null}

          {latest ? (
            <TargetProgress
              className="mt-3"
              targetKg={profile.targetKg}
              currentKg={latest.kg}
              startKg={entries[0]?.kg ?? null}
            />
          ) : null}

          <form
            className="mt-3 flex items-center gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              void save();
            }}
          >
            <div className="relative min-w-0 flex-1">
              <Input
                type="text"
                inputMode="decimal"
                value={value}
                onChange={(e) => setDraft(e.target.value)}
                placeholder={
                  isToday
                    ? `Today’s weight${latest ? ` (${latest.kg})` : ""}`
                    : `Weight for ${shortDate(date)}`
                }
                disabled={disabled || saving}
                aria-label={`Body weight in kilograms for ${shortDate(date)}`}
                className="h-10 rounded-xl pr-10 text-[15px] tabular-nums"
              />
              <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[13px] text-muted-foreground">
                kg
              </span>
            </div>
            <Button
              type="submit"
              className="h-10 rounded-xl px-4 font-semibold"
              disabled={disabled || saving || !editing}
            >
              {saving
                ? "Saving…"
                : current && editing && draft?.trim() === ""
                  ? "Clear"
                  : current
                    ? "Update"
                    : "Log"}
            </Button>
          </form>

          {recent.length ? (
            <div className="mt-3 border-t border-border/60 pt-2.5">
              <div className="flex items-center justify-between gap-2">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Recent logs
                </p>
                <Link
                  href={WEIGHT_REPORT_HREF}
                  className="-mr-1 flex items-center gap-0.5 rounded-md px-1 py-0.5 text-[12px] font-semibold text-primary"
                >
                  See all
                  <ChevronRight className="size-3.5" aria-hidden />
                </Link>
              </div>
              <ul className="mt-1.5 flex flex-col">
                {recent.slice(0, RECENT_COUNT).map((entry, i) => {
                  const before = recent[i + 1];
                  const d = before ? Math.round((entry.kg - before.kg) * 10) / 10 : null;
                  return (
                    <li
                      key={entry.date}
                      className="flex items-center justify-between gap-2 py-1 text-[13px]"
                    >
                      <span className="flex items-center gap-2 text-muted-foreground">
                        <CalendarDays className="size-3.5" aria-hidden />
                        {relativeDate(entry.date)}
                      </span>
                      <span className="flex items-center gap-2 tabular-nums">
                        {d !== null ? (
                          <span className="text-[11px] text-muted-foreground">
                            {d > 0 ? "+" : ""}
                            {d}
                          </span>
                        ) : null}
                        <span className="font-semibold">{entry.kg} kg</span>
                      </span>
                    </li>
                  );
                })}
              </ul>
            </div>
          ) : null}
        </>
      )}

      {disabled ? (
        <p className="mt-2 text-[12px] text-muted-foreground">
          You can log weight once the day arrives.
        </p>
      ) : null}
      {saveError || error ? (
        <p className="mt-2 text-[12px] text-destructive" role="alert">
          {saveError ?? error}
        </p>
      ) : null}
    </section>
  );
}
