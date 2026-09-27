"use client";

import { useId } from "react";
import { Area, AreaChart, ReferenceLine, XAxis, YAxis } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { parseLocalDateKey } from "@/lib/dates";
import { round1 } from "@/lib/units";
import type { BodyWeightEntry } from "@/lib/user-data";
import { cn } from "@/lib/utils";

const WINDOW_DAYS = 30;
/** Only draw the target line when it's this close to the plotted range. */
const TARGET_SLACK_KG = 4;

const chartConfig = {
  kg: { label: "Weight", color: "var(--primary)" },
} satisfies ChartConfig;

function dayNumber(key: string) {
  return Math.round(parseLocalDateKey(key).getTime() / 86_400_000);
}

function dateFromDay(day: number) {
  return new Date(day * 86_400_000);
}

function shortDate(d: Date) {
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export function WeightSparkline({
  entries,
  endDate,
  startDate,
  targetKg,
  label,
  showAxis = false,
  className = "h-14",
}: {
  entries: BodyWeightEntry[];
  endDate: string;
  /** Fixed window start; without it the chart shows the last 30 days. */
  startDate?: string;
  targetKg: number | null;
  label?: string;
  /** Date and kg axes plus grid-friendly padding (report view). */
  showAxis?: boolean;
  className?: string;
}) {
  const gradientId = `weight-fill-${useId().replace(/:/g, "")}`;
  const end = dayNumber(endDate);
  let points: BodyWeightEntry[];
  if (startDate) {
    points = entries.filter((e) => e.date >= startDate && e.date <= endDate);
  } else {
    points = entries.filter((e) => end - dayNumber(e.date) < WINDOW_DAYS);
    if (points.length < 2) points = entries.slice(-10);
  }

  if (points.length < 2) {
    return (
      <p className="rounded-xl bg-muted/40 px-3 py-2 text-center text-[11px] text-muted-foreground">
        {startDate
          ? "Not enough weigh-ins in this range for a trend"
          : "Log a few more days to see your trend"}
      </p>
    );
  }

  const start = startDate
    ? Math.min(dayNumber(startDate), dayNumber(points[0]!.date))
    : dayNumber(points[0]!.date);
  const values = points.map((p) => p.kg);
  let min = Math.min(...values);
  let max = Math.max(...values);
  const showTarget =
    targetKg !== null &&
    targetKg >= min - TARGET_SLACK_KG &&
    targetKg <= max + TARGET_SLACK_KG;
  if (showTarget) {
    min = Math.min(min, targetKg);
    max = Math.max(max, targetKg);
  }
  const pad = Math.max(0.3, (max - min) * 0.12);
  const domain: [number, number] = [
    Math.floor((min - pad) * 2) / 2,
    Math.ceil((max + pad) * 2) / 2,
  ];

  const data = points.map((p) => ({ day: dayNumber(p.date), kg: p.kg }));
  const change = round1(points[points.length - 1]!.kg - points[0]!.kg);
  const days = end - start + 1;

  return (
    <div>
      <ChartContainer
        config={chartConfig}
        className={cn("aspect-auto w-full", className)}
        aria-label={`Weight trend over ${days} days: ${change > 0 ? "+" : ""}${change} kg`}
      >
        <AreaChart
          data={data}
          margin={
            showAxis
              ? { top: 8, right: 4, bottom: 0, left: 0 }
              : { top: 4, right: 4, bottom: 4, left: 4 }
          }
        >
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="var(--color-kg)" stopOpacity={0.35} />
              <stop offset="95%" stopColor="var(--color-kg)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis
            dataKey="day"
            type="number"
            domain={[start, end]}
            hide={!showAxis}
            tickLine={false}
            axisLine={false}
            tickMargin={6}
            minTickGap={28}
            tickFormatter={(day: number) => shortDate(dateFromDay(day))}
          />
          <YAxis
            domain={domain}
            hide={!showAxis}
            width={32}
            tickLine={false}
            axisLine={false}
            tickCount={4}
            tickFormatter={(kg: number) => String(round1(kg))}
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
                    {value as number} kg
                  </span>
                )}
              />
            }
          />
          {showTarget ? (
            <ReferenceLine
              y={targetKg}
              stroke="var(--muted-foreground)"
              strokeOpacity={0.6}
              strokeDasharray="4 4"
              ifOverflow="extendDomain"
            />
          ) : null}
          <Area
            dataKey="kg"
            type="monotone"
            stroke="var(--color-kg)"
            strokeWidth={2}
            fill={`url(#${gradientId})`}
            dot={false}
            activeDot={{ r: 4, strokeWidth: 0 }}
          />
        </AreaChart>
      </ChartContainer>
      <div className="mt-1 flex items-center justify-between text-[10px] text-muted-foreground tabular-nums">
        <span>
          {label ?? (days >= WINDOW_DAYS ? "Last 30 days" : `Last ${days} days`)}
        </span>
        <span className="flex items-center gap-2">
          {showTarget ? (
            <span className="flex items-center gap-1">
              <span className="inline-block w-3 border-t border-dashed border-muted-foreground/70" />
              Target
            </span>
          ) : null}
          <span className="font-semibold text-foreground">
            {change > 0 ? "+" : ""}
            {change} kg
          </span>
        </span>
      </div>
    </div>
  );
}
