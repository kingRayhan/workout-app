import Image from "next/image";
import type { ReactNode } from "react";
import {
  BicepsFlexed,
  CircleDot,
  Dumbbell,
  Footprints,
  HeartPulse,
  Mountain,
  Shield,
  Zap,
  type LucideIcon,
} from "lucide-react";
import type { MuscleGroup } from "@workoutland/data/plan";
import { cn } from "@/lib/utils";

/** Transparent 3D icons, keyed by the lucide component's display name. */
const ICON_SRC: Record<string, string> = {
  Dumbbell: "/shortcuts/exercise.png",
  Scale: "/shortcuts/weight.png",
  BookOpen: "/shortcuts/catalog.png",
  ChartColumn: "/shortcuts/report.png",
  Flame: "/icons/flame.png",
  LogIn: "/icons/login.png",
  ListChecks: "/icons/checklist.png",
  PartyPopper: "/icons/party.png",
  Eye: "/icons/eye.png",
  Repeat: "/icons/repeat.png",
  Footprints: "/icons/footprints.png",
  Shield: "/icons/shield.png",
  Mountain: "/icons/mountain.png",
  BicepsFlexed: "/icons/biceps.png",
  Zap: "/icons/bolt.png",
  CircleDot: "/icons/core.png",
  HeartPulse: "/icons/heart.png",
  BedDouble: "/icons/bed.png",
  Compass: "/icons/compass.png",
  Target: "/icons/target.png",
  Sparkles: "/icons/sparkles.png",
  CalendarRange: "/icons/calendar.png",
  UserRound: "/icons/user.png",
  Rocket: "/icons/rocket.png",
  Check: "/icons/check.png",
  Search: "/icons/search.png",
};

function srcFor(icon: LucideIcon) {
  return ICON_SRC[icon.displayName ?? ""];
}

export function IconImage({
  icon,
  className,
}: {
  icon: LucideIcon;
  className?: string;
}) {
  const src = srcFor(icon);
  if (!src) {
    const Glyph = icon;
    return <Glyph className={className} aria-hidden />;
  }
  return (
    <Image
      src={src}
      alt=""
      width={128}
      height={128}
      aria-hidden
      className={cn("shrink-0 object-contain", className)}
    />
  );
}

export type Tone =
  | "lime"
  | "sky"
  | "amber"
  | "violet"
  | "rose"
  | "orange"
  | "teal"
  | "indigo"
  | "yellow"
  | "muted";

export const TONE_TILE: Record<Tone, string> = {
  lime: "bg-primary/15 text-primary",
  sky: "bg-sky-500/15 text-sky-400",
  amber: "bg-amber-500/15 text-amber-400",
  violet: "bg-violet-500/15 text-violet-400",
  rose: "bg-rose-500/15 text-rose-400",
  orange: "bg-orange-500/15 text-orange-400",
  teal: "bg-teal-500/15 text-teal-400",
  indigo: "bg-indigo-500/15 text-indigo-400",
  yellow: "bg-yellow-500/15 text-yellow-300",
  muted: "bg-muted text-muted-foreground",
};

export const TONE_TEXT: Record<Tone, string> = {
  lime: "text-primary",
  sky: "text-sky-400",
  amber: "text-amber-400",
  violet: "text-violet-400",
  rose: "text-rose-400",
  orange: "text-orange-400",
  teal: "text-teal-400",
  indigo: "text-indigo-400",
  yellow: "text-yellow-300",
  muted: "text-muted-foreground",
};

export const MUSCLE_STYLE: Record<
  MuscleGroup,
  { label: string; icon: LucideIcon; tone: Tone }
> = {
  legs: { label: "Legs", icon: Footprints, tone: "orange" },
  chest: { label: "Chest", icon: Shield, tone: "rose" },
  back: { label: "Back", icon: Mountain, tone: "sky" },
  shoulders: { label: "Shoulders", icon: Dumbbell, tone: "violet" },
  biceps: { label: "Biceps", icon: BicepsFlexed, tone: "teal" },
  triceps: { label: "Triceps", icon: Zap, tone: "indigo" },
  core: { label: "Core", icon: CircleDot, tone: "yellow" },
  cardio: { label: "Cardio", icon: HeartPulse, tone: "amber" },
};

export function IconTile({
  icon: Icon,
  tone,
  size = "md",
  className,
}: {
  icon: LucideIcon;
  tone: Tone;
  size?: "sm" | "md";
  className?: string;
}) {
  const src = srcFor(Icon);
  if (src) {
    return (
      <Image
        src={src}
        alt=""
        width={128}
        height={128}
        aria-hidden
        className={cn(
          "shrink-0 object-contain",
          size === "sm" ? "size-7" : "size-8",
          className,
        )}
      />
    );
  }

  return (
    <span
      className={cn(
        "grid shrink-0 place-items-center",
        size === "sm" ? "size-7 rounded-lg" : "size-8 rounded-[10px]",
        TONE_TILE[tone],
        className,
      )}
      aria-hidden
    >
      <Icon className={size === "sm" ? "size-3.5" : "size-4"} />
    </span>
  );
}

export function SectionTitle({
  icon,
  tone,
  children,
}: {
  icon: LucideIcon;
  tone: Tone;
  children: ReactNode;
}) {
  return (
    <h2 className="flex items-center gap-2 text-[13px] font-semibold text-foreground">
      <IconTile icon={icon} tone={tone} size="sm" />
      {children}
    </h2>
  );
}
