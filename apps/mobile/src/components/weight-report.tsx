"use client";

import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { BMI_HREF } from "@/components/profile-card";
import { Skeleton } from "@/components/ui/skeleton";
import { useBodyWeights, useProfile } from "@/hooks/use-user-data";
import {
  BMI_BANDS,
  bmi,
  bmiCategory,
  healthyRange,
  kgForBmi,
  type BmiCategory,
} from "@/lib/bmi";
import { localDateKey, parseLocalDateKey } from "@/lib/dates";
import type { BodyWeightEntry } from "@/lib/user-data";
import { cn } from "@/lib/utils";

const BAND_FILL: Record<BmiCategory, string> = {
  under: "fill-sky-500/10",
  normal: "fill-primary/12",
  over: "fill-amber-500/12",
  obese: "fill-red-500/12",
};

const BAND_TEXT: Record<BmiCategory, string> = {
  under: "text-sky-400",
  normal: "text-primary",
  over: "text-amber-400",
  obese: "text-red-400",
};

function shortDate(key: string) {
  return parseLocalDateKey(key).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}

function signed(n: number) {
  const r = Math.round(n * 10) / 10;
  return `${r > 0 ? "+" : ""}${r}`;
}

const W = 320;
const H = 160;
const PAD = { top: 8, right: 8, bottom: 18, left: 30 };

function WeightChart({
  entries,
  start,
  end,
  heightCm,
}: {
  entries: BodyWeightEntry[];
  start: Date;
  end: Date;
  heightCm: number | null;
}) {
  const kgs = entries.map((e) => e.kg);
  let lo = Math.min(...kgs) - 2;
  let hi = Math.max(...kgs) + 2;
  if (hi - lo < 6) {
    const mid = (hi + lo) / 2;
    lo = mid - 3;
    hi = mid + 3;
  }

  const t0 = start.getTime();
  const t1 = Math.max(end.getTime(), t0 + 86_400_000);
  const plotW = W - PAD.left - PAD.right;
  const plotH = H - PAD.top - PAD.bottom;
  const x = (key: string) =>
    PAD.left + ((parseLocalDateKey(key).getTime() - t0) / (t1 - t0)) * plotW;
  const y = (kg: number) => PAD.top + ((hi - kg) / (hi - lo)) * plotH;

  const bands = heightCm
    ? BMI_BANDS.map((b) => {
        const bandLo = Math.max(lo, kgForBmi(b.min, heightCm));
        const bandHi = Math.min(hi, kgForBmi(b.max, heightCm));
        return { ...b, bandLo, bandHi };
      }).filter((b) => b.bandHi > b.bandLo)
    : [];

  const path = entries
    .map((e, i) => `${i === 0 ? "M" : "L"}${x(e.date).toFixed(1)},${y(e.kg).toFixed(1)}`)
    .join(" ");
  const ticks = [hi, (hi + lo) / 2, lo];
  const last = entries[entries.length - 1]!;

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className="h-auto w-full"
      role="img"
      aria-label={`Weight chart, ${entries.length} entries, latest ${last.kg} kg`}
    >
      {bands.map((b) => {
        const top = y(b.bandHi);
        const height = y(b.bandLo) - top;
        return (
          <g key={b.id}>
            <rect
              x={PAD.left}
              y={top}
              width={plotW}
              height={height}
              className={BAND_FILL[b.id]}
            />
            {height >= 12 ? (
              <text
                x={W - PAD.right - 4}
                y={top + 10}
                textAnchor="end"
                className={cn("fill-current text-[8px] font-medium", BAND_TEXT[b.id])}
              >
                {b.label}
              </text>
            ) : null}
          </g>
        );
      })}

      {ticks.map((t) => (
        <g key={t}>
          <line
            x1={PAD.left}
            x2={W - PAD.right}
            y1={y(t)}
            y2={y(t)}
            className="stroke-border"
            strokeDasharray="2 3"
            strokeWidth={0.5}
          />
          <text
            x={PAD.left - 4}
            y={y(t) + 3}
            textAnchor="end"
            className="fill-muted-foreground text-[8px] tabular-nums"
          >
            {Math.round(t)}
          </text>
        </g>
      ))}

      <path
        d={path}
        fill="none"
        className="stroke-foreground"
        strokeWidth={1.5}
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      {entries.map((e) => (
        <circle
          key={e.date}
          cx={x(e.date)}
          cy={y(e.kg)}
          r={e === last ? 3.5 : 2}
          className={e === last ? "fill-primary" : "fill-foreground"}
        >
          <title>{`${shortDate(e.date)}: ${e.kg} kg`}</title>
        </circle>
      ))}

      <text
        x={PAD.left}
        y={H - 4}
        className="fill-muted-foreground text-[8px]"
      >
        {shortDate(localDateKey(start))}
      </text>
      <text
        x={W - PAD.right}
        y={H - 4}
        textAnchor="end"
        className="fill-muted-foreground text-[8px]"
      >
        {shortDate(localDateKey(end))}
      </text>
    </svg>
  );
}

function StatTile({
  label,
  value,
  hint,
  hintClassName,
}: {
  label: string;
  value: string;
  hint?: string;
  hintClassName?: string;
}) {
  return (
    <div className="rounded-xl bg-muted/60 px-3 py-2.5">
      <p className="text-[11px] font-medium text-muted-foreground">{label}</p>
      <p className="mt-0.5 text-[18px] font-semibold tracking-tight tabular-nums">
        {value}
      </p>
      {hint ? (
        <p className={cn("mt-0.5 text-[11px] text-muted-foreground", hintClassName)}>
          {hint}
        </p>
      ) : null}
    </div>
  );
}

export function WeightReport({ start, end }: { start: Date; end: Date }) {
  const { entries, loading, error } = useBodyWeights(
    localDateKey(start),
    localDateKey(end),
  );
  const { profile, loading: profileLoading } = useProfile();
  const heightCm = profile.heightCm;

  const first = entries[0];
  const last = entries[entries.length - 1];
  const currentBmi = last && heightCm ? bmi(last.kg, heightCm) : null;
  const category = currentBmi !== null ? bmiCategory(currentBmi) : null;
  const range = heightCm ? healthyRange(heightCm) : null;

  return (
    <div className="space-y-3">
      <h3 className="text-[12px] font-semibold text-foreground">Weight</h3>

      {!profileLoading && heightCm === null ? (
        <Link
          href={BMI_HREF}
          className="block w-full rounded-xl bg-muted/60 px-3 py-2.5 text-[12px] text-muted-foreground active:bg-muted"
        >
          Add your height in{" "}
          <span className="font-semibold text-primary">BMI profile</span> to
          compare weight with BMI.
        </Link>
      ) : null}

      {error ? (
        <p className="text-[13px] text-destructive" role="alert">
          {error}
        </p>
      ) : null}

      {loading ? (
        <Skeleton className="h-40 w-full rounded-xl" />
      ) : entries.length === 0 ? (
        <p className="rounded-xl bg-muted/60 px-3 py-6 text-center text-[13px] text-muted-foreground">
          No weight logged in this range. Log it from the Today page.
        </p>
      ) : (
        <>
          <div className="grid grid-cols-3 gap-2">
            <StatTile
              label="Current"
              value={`${last!.kg}`}
              hint={`kg · ${shortDate(last!.date)}`}
            />
            <StatTile
              label="Change"
              value={entries.length > 1 ? signed(last!.kg - first!.kg) : "—"}
              hint={entries.length > 1 ? `kg since ${shortDate(first!.date)}` : "Need 2 logs"}
            />
            <StatTile
              label="BMI"
              value={currentBmi !== null ? String(currentBmi) : "—"}
              hint={category ? category.label : "Add height"}
              hintClassName={category ? BAND_TEXT[category.id] : undefined}
            />
          </div>

          {range ? (
            <p className="text-[12px] text-muted-foreground">
              Healthy range for {heightCm} cm: {range.min}–{range.max} kg (BMI
              18.5–25)
              {last && last.kg > range.max
                ? ` · ${signed(last.kg - range.max)} kg above`
                : last && last.kg < range.min
                  ? ` · ${signed(last.kg - range.min)} kg below`
                  : " · you’re in it"}
            </p>
          ) : null}

          <div className="rounded-xl bg-muted/30 p-2">
            <WeightChart
              entries={entries}
              start={start}
              end={end}
              heightCm={heightCm}
            />
          </div>

          <Link
            href="/report/weight"
            className="flex items-center justify-between rounded-xl bg-muted/40 px-3 py-2.5 text-[13px] active:bg-muted"
          >
            <span>
              <span className="font-medium">Weight log</span>
              <span className="text-muted-foreground">
                {" "}
                · {entries.length} {entries.length === 1 ? "entry" : "entries"}
              </span>
            </span>
            <ChevronRight className="size-4 text-muted-foreground" aria-hidden />
          </Link>
        </>
      )}
    </div>
  );
}
