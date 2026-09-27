"use client";

import type { LucideIcon } from "lucide-react";
import {
  BookOpen,
  CalendarRange,
  ChevronLeft,
  Flame,
  ListChecks,
  Rocket,
  Scale,
  Sparkles,
  UserRound,
  X,
} from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { IconTile, type Tone } from "@/components/icon-tile";
import { Button } from "@/components/ui/button";
import type { TourStatus } from "@/lib/user-data";
import { cn } from "@/lib/utils";

export const TOUR_ROOT_ID = "app-phone";
const PAD = 6;
const EDGE = 8;
const POPOVER_SPACE = 210;

type Step = {
  /** `data-tour` values to spotlight, first match wins; none = centered card. */
  targets?: string[];
  icon: LucideIcon;
  tone: Tone;
  title: string;
  body: string;
  tips?: string[];
};

const STEPS: Step[] = [
  {
    icon: Sparkles,
    tone: "lime",
    title: "Welcome to Workoutland",
    body: "Your gym day in one place: plan workouts, tick them off, and track your weight. Here’s a 1-minute tour.",
  },
  {
    targets: ["tab-plan"],
    icon: CalendarRange,
    tone: "violet",
    title: "1 · Build your plan",
    body: "Start in Plan: create workouts from the catalog, then assign them to weekdays.",
    tips: ["Tap a workout to reorder exercises, edit or delete"],
  },
  {
    targets: ["todolist", "rest-day"],
    icon: ListChecks,
    tone: "lime",
    title: "2 · Your daily todolist",
    body: "Today shows the workout scheduled for this weekday. Check exercises off as you go.",
    tips: ["Tap the book icon on a row for form cues", "Colors show which muscle each move hits"],
  },
  {
    targets: ["day-switcher"],
    icon: CalendarRange,
    tone: "sky",
    title: "Swap days",
    body: "Use the arrows to catch up on yesterday or preview what’s coming. Tap the date to jump back to today.",
  },
  {
    targets: ["body-weight"],
    icon: Scale,
    tone: "amber",
    title: "3 · Log your weight",
    body: "Add a weigh-in each morning. You’ll see your trend, BMI and progress toward your target.",
    tips: ["Trend opens the full weight report with date filters"],
  },
  {
    targets: ["activity"],
    icon: Flame,
    tone: "lime",
    title: "Stay consistent",
    body: "Every checked exercise lights up this heatmap. Brighter squares mean more work done that day.",
  },
  {
    targets: ["tab-catalog"],
    icon: BookOpen,
    tone: "violet",
    title: "Catalog",
    body: "Search exercises and machines with videos, setup steps and common mistakes.",
  },
  {
    targets: ["tab-you"],
    icon: UserRound,
    tone: "teal",
    title: "You",
    body: "Set height and a target weight in your BMI profile, and see activity and weight reports.",
  },
  {
    icon: Rocket,
    tone: "lime",
    title: "You’re set",
    body: "Next step: build your first workout and put it on this week’s schedule.",
  },
];

type Box = { top: number; left: number; width: number; height: number };

function findTarget(root: HTMLElement, step: Step) {
  for (const t of step.targets ?? []) {
    const el = root.querySelector<HTMLElement>(`[data-tour="${t}"]`);
    if (el) return el;
  }
  return null;
}

function measure(root: HTMLElement, el: HTMLElement): Box {
  const r = el.getBoundingClientRect();
  const c = root.getBoundingClientRect();
  const top = Math.max(EDGE, r.top - c.top - PAD);
  const bottom = Math.min(c.height - EDGE, r.bottom - c.top + PAD);
  const left = Math.max(EDGE, r.left - c.left - PAD);
  const right = Math.min(c.width - EDGE, r.right - c.left + PAD);
  return { top, left, width: right - left, height: Math.max(0, bottom - top) };
}

export function OnboardingTour({
  onFinish,
}: {
  onFinish: (status: TourStatus) => void;
}) {
  // Only mounted client-side after auth resolves, so the DOM is available.
  const [root] = useState<HTMLElement | null>(() =>
    typeof document === "undefined" ? null : document.getElementById(TOUR_ROOT_ID),
  );
  const [index, setIndex] = useState(0);
  const [box, setBox] = useState<Box | null>(null);
  const [rootHeight, setRootHeight] = useState(0);
  const nextRef = useRef<HTMLButtonElement>(null);

  const step = STEPS[index]!;
  const isLast = index === STEPS.length - 1;

  const update = useCallback(() => {
    if (!root) return;
    setRootHeight(root.getBoundingClientRect().height);
    const el = findTarget(root, step);
    setBox(el ? measure(root, el) : null);
  }, [root, step]);

  useEffect(() => {
    if (!root) return;
    const el = findTarget(root, step);
    if (el) {
      const tall = el.getBoundingClientRect().height > root.clientHeight * 0.5;
      el.scrollIntoView({ block: tall ? "start" : "center", behavior: "smooth" });
    }
    let frame = requestAnimationFrame(update);
    const settle = window.setTimeout(update, 380);
    const onMove = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(update);
    };
    window.addEventListener("resize", onMove);
    document.addEventListener("scroll", onMove, true);
    nextRef.current?.focus({ preventScroll: true });
    return () => {
      window.clearTimeout(settle);
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", onMove);
      document.removeEventListener("scroll", onMove, true);
    };
  }, [root, step, update]);

  const next = useCallback(() => {
    if (isLast) onFinish("completed");
    else setIndex((i) => i + 1);
  }, [isLast, onFinish]);
  const back = useCallback(() => setIndex((i) => Math.max(0, i - 1)), []);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onFinish("skipped");
      else if (e.key === "ArrowRight") next();
      else if (e.key === "ArrowLeft") back();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [back, next, onFinish]);

  if (!root) return null;

  let placement: "center" | "below" | "above" | "pinned" = "center";
  if (box) {
    const spaceBelow = rootHeight - (box.top + box.height);
    if (spaceBelow >= POPOVER_SPACE) placement = "below";
    else if (box.top >= POPOVER_SPACE) placement = "above";
    else placement = "pinned";
  }

  return createPortal(
    <div
      className="absolute inset-0 z-50"
      role="dialog"
      aria-modal="true"
      aria-labelledby="tour-title"
      aria-describedby="tour-body"
    >
      {box ? (
        <div
          aria-hidden
          className="pointer-events-none absolute rounded-2xl ring-2 ring-primary transition-all duration-300 ease-out"
          style={{
            top: box.top,
            left: box.left,
            width: box.width,
            height: box.height,
            boxShadow: "0 0 0 9999px rgb(0 0 0 / 0.72)",
          }}
        />
      ) : (
        <div aria-hidden className="absolute inset-0 bg-black/72 backdrop-blur-[2px]" />
      )}

      <div
        key={index}
        className={cn(
          "animate-rise absolute inset-x-3 rounded-2xl bg-popover p-4 text-popover-foreground shadow-2xl ring-1 ring-border",
          placement === "center" && "top-1/2 -translate-y-1/2",
          placement === "pinned" && "bottom-3",
        )}
        style={
          placement === "below" && box
            ? { top: box.top + box.height + 12 }
            : placement === "above" && box
              ? { bottom: rootHeight - box.top + 12 }
              : undefined
        }
      >
        <div className="flex items-start gap-3">
          <IconTile icon={step.icon} tone={step.tone} />
          <div className="min-w-0 flex-1">
            <h2 id="tour-title" className="text-[16px] font-semibold leading-tight tracking-tight">
              {step.title}
            </h2>
            <p id="tour-body" className="mt-1 text-[13px] leading-snug text-muted-foreground">
              {step.body}
            </p>
          </div>
          <button
            type="button"
            onClick={() => onFinish("skipped")}
            aria-label="Skip tour"
            className="-mr-1 -mt-1 grid size-8 shrink-0 place-items-center rounded-lg text-muted-foreground active:bg-muted"
          >
            <X className="size-4" aria-hidden />
          </button>
        </div>

        {step.tips?.length ? (
          <ul className="mt-3 flex flex-col gap-1.5 rounded-xl bg-muted/60 px-3 py-2 text-[12px] text-muted-foreground">
            {step.tips.map((tip) => (
              <li key={tip} className="flex gap-2">
                <span className="mt-1.5 size-1 shrink-0 rounded-full bg-primary" aria-hidden />
                {tip}
              </li>
            ))}
          </ul>
        ) : null}

        <div className="mt-4 flex items-center gap-2">
          <div className="flex flex-1 items-center gap-1" aria-label={`Step ${index + 1} of ${STEPS.length}`}>
            {STEPS.map((_, i) => (
              <span
                key={i}
                className={cn(
                  "h-1.5 rounded-full transition-all",
                  i === index ? "w-4 bg-primary" : i < index ? "w-1.5 bg-primary/50" : "w-1.5 bg-muted",
                )}
              />
            ))}
          </div>
          {index === 0 ? (
            <Button variant="ghost" size="sm" className="text-muted-foreground" onClick={() => onFinish("skipped")}>
              Skip
            </Button>
          ) : (
            <Button variant="ghost" size="sm" className="text-muted-foreground" onClick={back}>
              <ChevronLeft className="size-4" aria-hidden />
              Back
            </Button>
          )}
          {isLast ? (
            <Button ref={nextRef} size="sm" className="font-semibold" asChild>
              <Link href="/plan" onClick={() => onFinish("completed")}>
                Open Plan
              </Link>
            </Button>
          ) : (
            <Button ref={nextRef} size="sm" className="font-semibold" onClick={next}>
              {index === 0 ? "Start tour" : "Next"}
            </Button>
          )}
        </div>
        {isLast ? (
          <button
            type="button"
            onClick={() => onFinish("completed")}
            className="mt-2 w-full text-center text-[12px] text-muted-foreground"
          >
            Maybe later
          </button>
        ) : null}
      </div>
    </div>,
    root,
  );
}
