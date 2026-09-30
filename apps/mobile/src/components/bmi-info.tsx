"use client";

import { ChevronDown } from "lucide-react";
import { useState } from "react";
import { BMI_TEXT } from "@/components/bmi-gauge";
import {
  OBESITY_CLASSES,
  bmiCategory,
  obesityClass,
  type BmiCategory,
} from "@/lib/bmi";
import { cn } from "@/lib/utils";

const ROWS: { id: BmiCategory; label: string; range: string }[] = [
  { id: "under", label: "Underweight", range: "Below 18.5" },
  { id: "normal", label: "Healthy weight", range: "18.5 to 24.9" },
  { id: "over", label: "Overweight", range: "25.0 to 29.9" },
  { id: "obese", label: "Obesity", range: "30.0 or greater" },
];

const CLASS_RANGE: Record<number, string> = {
  1: "30.0 to 34.9",
  2: "35.0 to 39.9",
  3: "40.0 or greater",
};

const DOT: Record<BmiCategory, string> = {
  under: "bg-sky-400",
  normal: "bg-primary",
  over: "bg-amber-400",
  obese: "bg-red-400",
};

export function BmiCategoriesTable({ value }: { value: number | null }) {
  const current = value !== null ? bmiCategory(value).id : null;
  const currentClass = value !== null ? obesityClass(value)?.id ?? null : null;
  const [showClasses, setShowClasses] = useState(current === "obese");

  return (
    <section className="overflow-hidden rounded-2xl bg-card ring-1 ring-border/80">
      <div className="px-4 pt-4 pb-2">
        <h2 className="text-[15px] font-semibold">BMI categories</h2>
        <p className="mt-0.5 text-[12px] text-muted-foreground">
          Adult ranges from the WHO / CDC.
        </p>
      </div>

      <div className="grid grid-cols-[1fr_auto] border-y border-border/80 bg-muted/50 px-4 py-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
        <span>Category</span>
        <span>BMI range</span>
      </div>

      <ul className="divide-y divide-border/60">
        {ROWS.map((row) => {
          const active = current === row.id;
          const isObese = row.id === "obese";
          const content = (
            <>
              <span className="flex items-center gap-2.5">
                <span className={cn("size-2 rounded-full", DOT[row.id])} />
                <span className={cn(active && "font-semibold", active && BMI_TEXT[row.id])}>
                  {row.label}
                </span>
                {active ? (
                  <span className="rounded-full bg-foreground/10 px-1.5 py-px text-[10px] font-semibold text-foreground">
                    You
                  </span>
                ) : null}
              </span>
              <span className="flex items-center gap-1 tabular-nums text-muted-foreground">
                {row.range}
                {isObese ? (
                  <ChevronDown
                    className={cn(
                      "size-4 transition-transform",
                      showClasses && "rotate-180",
                    )}
                    aria-hidden
                  />
                ) : null}
              </span>
            </>
          );
          const rowClass = cn(
            "flex w-full items-center justify-between gap-3 px-4 py-3 text-left text-[13px]",
            active && "bg-muted/60",
          );

          return (
            <li key={row.id}>
              {isObese ? (
                <button
                  type="button"
                  className={rowClass}
                  aria-expanded={showClasses}
                  onClick={() => setShowClasses((v) => !v)}
                >
                  {content}
                </button>
              ) : (
                <div className={rowClass}>{content}</div>
              )}
              {isObese && showClasses ? (
                <ul className="divide-y divide-border/60 border-t border-border/60 bg-muted/30">
                  {OBESITY_CLASSES.map((c) => {
                    const classActive = currentClass === c.id;
                    return (
                      <li
                        key={c.id}
                        className={cn(
                          "flex items-center justify-between gap-3 py-2.5 pl-9 pr-4 text-[12px]",
                          classActive && "bg-red-500/10 font-semibold text-red-300",
                        )}
                      >
                        <span>{c.label}</span>
                        <span className="tabular-nums text-muted-foreground">
                          {CLASS_RANGE[c.id]}
                        </span>
                      </li>
                    );
                  })}
                </ul>
              ) : null}
            </li>
          );
        })}
      </ul>
    </section>
  );
}

export function BmiAbout() {
  return (
    <section className="rounded-2xl bg-card px-4 py-4 ring-1 ring-border/80">
      <h2 className="text-[15px] font-semibold">About BMI</h2>
      <p className="mt-2 rounded-xl bg-muted/60 px-3 py-2 text-center text-[13px] font-medium tabular-nums">
        BMI = weight (kg) ÷ height (m)²
      </p>
      <ul className="mt-3 flex flex-col gap-2 text-[12px] leading-relaxed text-muted-foreground">
        <li>
          <span className="font-semibold text-foreground">A screening tool, not a diagnosis.</span>{" "}
          It doesn’t measure body fat directly.
        </li>
        <li>
          <span className="font-semibold text-foreground">Muscle counts as weight.</span>{" "}
          If you lift regularly, BMI can read high even when body fat is low —
          track waist size or body-fat % alongside it.
        </li>
        <li>
          <span className="font-semibold text-foreground">Adults only.</span>{" "}
          Children, teens, pregnant people and older adults use different
          references.
        </li>
        <li>
          <span className="font-semibold text-foreground">Watch the trend.</span>{" "}
          Weigh in at the same time of day; weekly averages beat single days.
        </li>
      </ul>
    </section>
  );
}
