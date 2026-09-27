import { BMI_BANDS, bmiCategory, type BmiCategory } from "@/lib/bmi";
import { cn } from "@/lib/utils";

const MIN = 15;
const MAX = 35;
const CX = 100;
const CY = 100;
const R = 80;

const BAND_STROKE: Record<BmiCategory, string> = {
  under: "stroke-sky-400",
  normal: "stroke-primary",
  over: "stroke-amber-400",
  obese: "stroke-red-400",
};

export const BMI_TEXT: Record<BmiCategory, string> = {
  under: "text-sky-400",
  normal: "text-primary",
  over: "text-amber-400",
  obese: "text-red-400",
};

export const BMI_PILL: Record<BmiCategory, string> = {
  under: "bg-sky-500/15 text-sky-300",
  normal: "bg-primary/15 text-primary",
  over: "bg-amber-500/15 text-amber-300",
  obese: "bg-red-500/15 text-red-300",
};

function point(value: number, r = R) {
  const t = (Math.min(MAX, Math.max(MIN, value)) - MIN) / (MAX - MIN);
  const a = Math.PI - t * Math.PI;
  return { x: CX + r * Math.cos(a), y: CY - r * Math.sin(a) };
}

function arc(from: number, to: number) {
  const a = point(from);
  const b = point(to);
  return `M ${a.x} ${a.y} A ${R} ${R} 0 0 1 ${b.x} ${b.y}`;
}

export function BmiGauge({ value }: { value: number | null }) {
  const category = value !== null ? bmiCategory(value) : null;
  const tip = value !== null ? point(value, R - 22) : null;

  return (
    <div className="flex flex-col items-center">
      <svg
        viewBox="0 0 200 112"
        className="w-full max-w-[260px]"
        role="img"
        aria-label={
          value !== null && category
            ? `BMI ${value}, ${category.label}`
            : "BMI not set"
        }
      >
        {BMI_BANDS.map((band) => (
          <path
            key={band.id}
            d={arc(Math.max(MIN, band.min), Math.min(MAX, band.max))}
            fill="none"
            strokeWidth={12}
            className={cn(
              BAND_STROKE[band.id],
              category && category.id !== band.id && "opacity-30",
              !category && "opacity-20",
            )}
          />
        ))}
        {tip ? (
          <>
            <line
              x1={CX}
              y1={CY}
              x2={tip.x}
              y2={tip.y}
              strokeWidth={3}
              strokeLinecap="round"
              className="stroke-foreground transition-all duration-500"
            />
            <circle cx={CX} cy={CY} r={6} className="fill-foreground" />
          </>
        ) : null}
        {[18.5, 25, 30].map((v) => {
          const p = point(v, R + 14);
          return (
            <text
              key={v}
              x={p.x}
              y={p.y}
              textAnchor="middle"
              dominantBaseline="middle"
              className="fill-muted-foreground text-[8px] tabular-nums"
            >
              {v}
            </text>
          );
        })}
      </svg>

      <p
        className={cn(
          "mt-1 text-[44px] font-semibold leading-none tracking-tight tabular-nums",
          category ? BMI_TEXT[category.id] : "text-muted-foreground",
        )}
      >
        {value ?? "—"}
      </p>
      <span
        className={cn(
          "mt-2 rounded-full px-2.5 py-0.5 text-[11px] font-semibold tracking-wide",
          category ? BMI_PILL[category.id] : "bg-muted text-muted-foreground",
        )}
      >
        {category ? category.label : "Add height & weight"}
      </span>
    </div>
  );
}
