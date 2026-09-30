import type { Metadata } from "next";
import Link from "next/link";
import { CARDIO_EXERCISES } from "@workoutland/data/cardio";
import {
  MUSCLE_TAGS,
  allCatalogExercises,
  filterExercisesByTag,
  isMuscleTag,
} from "@workoutland/data/catalog";
import { DAYS, PLAN_META, type Exercise } from "@workoutland/data/plan";
import { ExerciseCard } from "@/components/exercise-card";
import { GameIcon } from "@/components/game-icon";
import { ICONS, MUSCLE_ICON } from "@/lib/icons";

export const metadata: Metadata = {
  title: "Workouts",
  description: "A simple 3-day machine split plus easy cardio, with sets, reps, and form cues for every exercise.",
};

export default async function WorkoutsPage({ searchParams }: PageProps<"/workouts">) {
  const raw = (await searchParams).muscle;
  const muscle = typeof raw === "string" && isMuscleTag(raw) ? raw : null;
  const filtered = muscle ? filterExercisesByTag(allCatalogExercises(), muscle) : null;
  const muscleLabel = MUSCLE_TAGS.find((t) => t.id === muscle)?.label;

  return (
    <div className="mx-auto max-w-6xl space-y-10 px-5 pt-14">
      <header className="max-w-2xl space-y-3">
        <h1 className="flex items-center gap-3 text-4xl font-extrabold tracking-tight">
          <GameIcon src={ICONS.workouts} className="size-12" />
          Quest board
        </h1>
        <p className="text-muted-foreground">
          {PLAN_META.name}: {PLAN_META.sets} sets of {PLAN_META.reps} on every lift, three days a week.
        </p>
      </header>

      <nav aria-label="Filter by muscle" className="flex flex-wrap gap-2">
        <FilterChip href="/workouts" active={!muscle} label="Full plan" icon={ICONS.workouts} />
        {MUSCLE_TAGS.map((tag) => (
          <FilterChip
            key={tag.id}
            href={`/workouts?muscle=${tag.id}`}
            active={muscle === tag.id}
            label={tag.label}
            icon={MUSCLE_ICON[tag.id]}
          />
        ))}
      </nav>

      {filtered ? (
        <section className="space-y-4">
          <h2 className="text-xl font-semibold tracking-tight">
            {muscleLabel} · {filtered.length} exercises
          </h2>
          {filtered.length > 0 ? (
            <ExerciseGrid exercises={filtered} />
          ) : (
            <div className="panel p-10 text-center">
              <p className="font-extrabold">No {muscleLabel?.toLowerCase()} moves yet</p>
              <Link href="/workouts" className="mt-2 inline-block text-sm text-primary">
                Back to the full plan
              </Link>
            </div>
          )}
        </section>
      ) : (
        <>
          <p className="panel flex items-start gap-3 p-5 text-pretty">
            <GameIcon src={ICONS.target} className="mt-0.5 size-8" />
            <span>
              <span className="font-extrabold text-primary">Weight rule. </span>
              {PLAN_META.weightRule}
            </span>
          </p>

          {DAYS.map((day) => (
            <section key={day.id} id={`day-${day.id}`} className="scroll-mt-24 space-y-4">
              <div>
                <p className="badge">Quest {day.id}</p>
                <h2 className="text-2xl font-extrabold tracking-tight">{day.title}</h2>
                <p className="text-sm text-muted-foreground">{day.subtitle}</p>
              </div>
              <ExerciseGrid exercises={day.exercises} />
            </section>
          ))}

          <section id="cardio" className="scroll-mt-24 space-y-4">
            <div>
              <p className="badge">Bonus</p>
              <h2 className="flex items-center gap-2 text-2xl font-extrabold tracking-tight">
                <GameIcon src={MUSCLE_ICON.cardio} className="size-8" />
                Cardio
              </h2>
              <p className="text-sm text-muted-foreground">
                Finish with one of these, or do it on rest days.
              </p>
            </div>
            <ExerciseGrid exercises={CARDIO_EXERCISES} />
          </section>
        </>
      )}
    </div>
  );
}

function ExerciseGrid({ exercises }: { exercises: Exercise[] }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {exercises.map((e) => (
        <ExerciseCard key={e.id} exercise={e} />
      ))}
    </div>
  );
}

function FilterChip({
  href,
  active,
  label,
  icon,
}: {
  href: string;
  active: boolean;
  label: string;
  icon: string;
}) {
  return (
    <Link href={href} aria-current={active ? "page" : undefined} className={active ? "chip chip-on" : "chip"}>
      <GameIcon src={icon} className="size-5" />
      {label}
    </Link>
  );
}
