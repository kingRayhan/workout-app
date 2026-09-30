"use client";

import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { BMI_PILL, BMI_TEXT } from "@/components/bmi-gauge";
import { Skeleton } from "@/components/ui/skeleton";
import { useBodyWeight, useProfile } from "@/hooks/use-user-data";
import { bmi, bmiCategory } from "@/lib/bmi";
import { localDateKey } from "@/lib/dates";
import { cn } from "@/lib/utils";

export const BMI_HREF = "/you/bmi";

export function ProfileCard() {
  const { profile, loading: profileLoading } = useProfile();
  const { current, previous, loading: weightLoading } = useBodyWeight(
    localDateKey(),
  );
  const loading = profileLoading || weightLoading;
  const latest = current ?? previous;
  const heightCm = profile.heightCm;
  const value = latest && heightCm ? bmi(latest.kg, heightCm) : null;
  const category = value !== null ? bmiCategory(value) : null;

  return (
    <Link
      href={BMI_HREF}
      className="flex items-center gap-3 rounded-2xl bg-card px-4 py-4 ring-1 ring-border/80 active:bg-muted/50"
    >
      <div className="min-w-0 flex-1">
        <h2 className="text-[13px] font-semibold">BMI profile</h2>
        {loading ? (
          <Skeleton className="mt-2 h-4 w-40 rounded" />
        ) : (
          <p className="mt-1 text-[12px] text-muted-foreground tabular-nums">
            {heightCm || latest
              ? [heightCm && `${heightCm} cm`, latest && `${latest.kg} kg`]
                  .filter(Boolean)
                  .join(" · ")
              : "Add height & weight to see your BMI"}
          </p>
        )}
      </div>
      {!loading && value !== null && category ? (
        <div className="flex flex-col items-end">
          <span
            className={cn(
              "text-[22px] font-semibold leading-none tabular-nums",
              BMI_TEXT[category.id],
            )}
          >
            {value}
          </span>
          <span
            className={cn(
              "mt-1 rounded-full px-2 py-0.5 text-[10px] font-semibold",
              BMI_PILL[category.id],
            )}
          >
            {category.label}
          </span>
        </div>
      ) : null}
      <ChevronRight className="size-4 shrink-0 text-muted-foreground" aria-hidden />
    </Link>
  );
}
