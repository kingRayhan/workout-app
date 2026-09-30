import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  MUSCLE_TAGS,
  allCatalogExercises,
  catalogTargetLabel,
  getCatalogExercise,
} from "@workoutland/data/catalog";
import { getExerciseExtra } from "@workoutland/data/exercise-extra";
import { getMachineForExercise } from "@workoutland/data/machines";
import { EXERCISE_VIDEO } from "@workoutland/data/media";
import { DAYS } from "@workoutland/data/plan";
import { GameIcon } from "@/components/game-icon";
import { MachineCard } from "@/components/machine-card";
import { ICONS, MUSCLE_ICON } from "@/lib/icons";

export const dynamicParams = false;

export function generateStaticParams() {
  return allCatalogExercises().map((e) => ({ id: e.id }));
}

export async function generateMetadata({
  params,
}: PageProps<"/workouts/[id]">): Promise<Metadata> {
  const exercise = getCatalogExercise((await params).id);
  if (!exercise) return {};
  return { title: exercise.name, description: `${exercise.name}: ${exercise.focus}.` };
}

export default async function ExercisePage({ params }: PageProps<"/workouts/[id]">) {
  const exercise = getCatalogExercise((await params).id);
  if (!exercise) notFound();

  const extra = getExerciseExtra(exercise.id);
  const machine = getMachineForExercise(exercise.id);
  const video = EXERCISE_VIDEO[exercise.id];
  const days = DAYS.filter((d) => d.exercises.some((e) => e.id === exercise.id));
  const muscles = MUSCLE_TAGS.filter((t) => exercise.muscles.includes(t.id));

  return (
    <div className="mx-auto max-w-6xl space-y-10 px-5 pt-10">
      <Link href="/workouts" className="text-sm font-extrabold text-muted-foreground hover:text-foreground">
        All workouts
      </Link>

      <header className="max-w-3xl space-y-4">
        <h1 className="flex items-center gap-3 text-4xl font-extrabold tracking-tight">
          <GameIcon src={MUSCLE_ICON[exercise.muscles[0] ?? "cardio"]} className="size-12" />
          {exercise.name}
        </h1>
        <p className="text-lg text-muted-foreground">{exercise.focus}</p>
        <div className="flex flex-wrap items-center gap-2 text-sm">
          <span className="chip chip-on font-mono">{catalogTargetLabel(exercise)}</span>
          {muscles.map((m) => (
            <Link key={m.id} href={`/workouts?muscle=${m.id}`} className="chip">
              <GameIcon src={MUSCLE_ICON[m.id]} className="size-4" />
              {m.label}
            </Link>
          ))}
          {days.map((d) => (
            <Link key={d.id} href={`/workouts#day-${d.id}`} className="chip">
              Quest {d.id}
            </Link>
          ))}
        </div>
      </header>

      <div className="grid gap-10 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
        <div className="space-y-10">
          {video ? (
            <video
              src={video}
              autoPlay
              muted
              loop
              playsInline
              aria-label={`${exercise.name} form demo`}
              className="aspect-video w-full rounded-xl bg-black object-contain"
            />
          ) : null}

          <section className="space-y-3">
            <h2 className="text-xl font-extrabold tracking-tight">How to do it</h2>
            <ol className="space-y-2.5">
              {exercise.steps.map((step, i) => (
                <li key={step} className="flex gap-3">
                  <span className="step-pip">{i + 1}</span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>
          </section>

          {exercise.tip || exercise.avoid ? (
            <div className="grid gap-3 sm:grid-cols-2">
              {exercise.tip ? (
                <Callout icon={ICONS.tip} title="Tip" tone="primary">
                  {exercise.tip}
                </Callout>
              ) : null}
              {exercise.avoid ? (
                <Callout icon={ICONS.avoid} title="Avoid" tone="warn">
                  {exercise.avoid}
                </Callout>
              ) : null}
            </div>
          ) : null}

          {extra ? (
            <section className="space-y-6">
              <h2 className="flex items-center gap-2 text-xl font-extrabold tracking-tight">
                <GameIcon src={ICONS.flame} className="size-7" />
                Coaching notes
              </h2>
              <dl className="grid gap-5 sm:grid-cols-3">
                <Detail label="Why do it">{extra.why}</Detail>
                <Detail label="Breathing">{extra.breathing}</Detail>
                <Detail label="Tempo">{extra.tempo}</Detail>
              </dl>
              <div className="grid gap-6 sm:grid-cols-2">
                <BulletList title="Be careful" items={extra.cautions} />
                <BulletList title="Common mistakes" items={extra.mistakes} />
              </div>
            </section>
          ) : null}
        </div>

        {machine ? (
          <aside className="space-y-3">
            <h2 className="text-sm font-medium text-muted-foreground">Machine</h2>
            <div className="max-w-xs">
              <MachineCard machine={machine} />
            </div>
          </aside>
        ) : null}
      </div>
    </div>
  );
}

function Callout({
  icon,
  title,
  tone,
  children,
}: {
  icon: string;
  title: string;
  tone: "primary" | "warn";
  children: React.ReactNode;
}) {
  const toneClass = tone === "primary" ? "text-primary" : "text-amber-300";
  return (
    <div className="panel space-y-2 p-4">
      <p className={`inline-flex items-center gap-2 text-sm font-extrabold ${toneClass}`}>
        <GameIcon src={icon} className="size-6" /> {title}
      </p>
      <p className="text-pretty">{children}</p>
    </div>
  );
}

function Detail({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <dt className="text-sm font-medium text-muted-foreground">{label}</dt>
      <dd className="text-pretty">{children}</dd>
    </div>
  );
}

function BulletList({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="space-y-2">
      <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
      <ul className="list-disc space-y-1.5 pl-5 marker:text-muted-foreground">
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </div>
  );
}
