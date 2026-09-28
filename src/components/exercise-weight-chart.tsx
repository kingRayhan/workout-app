"use client";

import { useId } from "react";
import { Area, AreaChart, XAxis, YAxis } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import type { ProgressMetric } from "@/lib/catalog";
import { parseLocalDateKey } from "@/lib/dates";
import type { ExerciseLog } from "@/lib/user-data";
import { cn } from "@/lib/utils";

function dayNumber(key: string) {
  return Math.round(parseLocalDateKey(key).getTime() / 86_400_000);
}

function dateFromDay(day: number) {
  return new Date(day * 86_400_000);
}

/** Weight (or cardio minutes) per session over time; needs 2+ measured logs. */
export function ExerciseWeightChart({
  logs,
  metric,
  className = "h-40",
}: {
  /** Oldest first. */
  logs: ExerciseLog[];
  metric: ProgressMetric;
  className?: string;
}) {
  const gradientId = `lift-fill-${useId().replace(/:/g, "")}`;
  const data = logs.flatMap((l) => {
    const value = l[metric.field];
    return value === null ? [] : [{ day: dayNumber(l.date), value }];
  });
  const chartConfig = {
    value: { label: metric.label, color: "var(--primary)" },
  } satisfies ChartConfig;

  if (data.length < 2) {
    return (
      <p className="rounded-xl bg-muted/40 px-3 py-3 text-center text-[12px] text-muted-foreground">
        Log {metric.unit === "min" ? "a time" : "a weight"} in two or more
        sessions to see your progress chart.
      </p>
    );
  }

  const values = data.map((d) => d.value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const pad = Math.max(1, (max - min) * 0.15);

  return (
    <ChartContainer
      config={chartConfig}
      className={cn("aspect-auto w-full", className)}
      aria-label={`${metric.label} over ${data.length} sessions, from ${values[0]} to ${values[values.length - 1]} ${metric.unit}`}
    >
      <AreaChart data={data} margin={{ top: 8, right: 4, bottom: 0, left: 0 }}>
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="var(--color-value)" stopOpacity={0.35} />
            <stop offset="95%" stopColor="var(--color-value)" stopOpacity={0} />
          </linearGradient>
        </defs>
        <XAxis
          dataKey="day"
          type="number"
          domain={["dataMin", "dataMax"]}
          tickLine={false}
          axisLine={false}
          tickMargin={6}
          minTickGap={28}
          tickFormatter={(day: number) =>
            dateFromDay(day).toLocaleDateString(undefined, {
              month: "short",
              day: "numeric",
            })
          }
        />
        <YAxis
          domain={[Math.max(0, Math.floor(min - pad)), Math.ceil(max + pad)]}
          width={32}
          tickLine={false}
          axisLine={false}
          tickCount={4}
          allowDecimals={false}
        />
        <ChartTooltip
          cursor={{ strokeDasharray: "3 3" }}
          content={
            <ChartTooltipContent
              hideIndicator
              labelFormatter={(_, payload) => {
                const day = payload?.[0]?.payload?.day as number | undefined;
                return day === undefined
                  ? null
                  : dateFromDay(day).toLocaleDateString(undefined, {
                      weekday: "short",
                      month: "short",
                      day: "numeric",
                    });
              }}
              formatter={(value) => (
                <span className="font-mono font-medium tabular-nums text-foreground">
                  {value as number} {metric.unit}
                </span>
              )}
            />
          }
        />
        <Area
          dataKey="value"
          type="stepAfter"
          stroke="var(--color-value)"
          strokeWidth={2}
          fill={`url(#${gradientId})`}
          dot={{ r: 2.5, strokeWidth: 0, fill: "var(--color-value)" }}
          activeDot={{ r: 4, strokeWidth: 0 }}
        />
      </AreaChart>
    </ChartContainer>
  );
}
