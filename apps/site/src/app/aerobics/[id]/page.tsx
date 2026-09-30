import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AEROBIC_EXERCISES, getAerobicExercise, getAerobicGroup } from "@workoutland/data/aerobics";
import { catalogTargetLabel } from "@workoutland/data/catalog";
import { EXERCISE_VIDEO } from "@workoutland/data/media";
import { FormVideo } from "@/components/form-video";
import { GameIcon } from "@/components/game-icon";
import { ICONS, MUSCLE_ICON } from "@/lib/icons";

export const dynamicParams = false;

export function generateStaticParams() {
  return AEROBIC_EXERCISES.map((exercise) => ({ id: exercise.id }));
}

export async function generateMetadata({
  params,
}: PageProps<"/aerobics/[id]">): Promise<Metadata> {
  const exercise = getAerobicExercise((await params).id);
  if (!exercise) return {};
  return { title: exercise.name, description: `${exercise.name}: ${exercise.focus}.` };
}

export default async function AerobicPage({ params }: PageProps<"/aerobics/[id]">) {
  const exercise = getAerobicExercise((await params).id);
  if (!exercise) notFound();

  const group = getAerobicGroup(exercise.id);
  const video = EXERCISE_VIDEO[exercise.id];

  return (
    <div className="mx-auto max-w-6xl space-y-10 px-5 pt-10">
      <Link href="/aerobics" className="text-sm font-extrabold text-muted-foreground hover:text-foreground">
        All aerobics
      </Link>

      <header className="max-w-3xl space-y-4">
        <h1 className="flex items-center gap-3 text-4xl font-extrabold tracking-tight">
          <GameIcon src={MUSCLE_ICON[exercise.muscles[0] ?? "cardio"]} className="size-12" />
          {exercise.name}
        </h1>
        <p className="text-lg text-muted-foreground">{exercise.focus}</p>
        <div className="flex flex-wrap items-center gap-2 text-sm">
          <span className="chip chip-on font-mono">{catalogTargetLabel(exercise)} rounds</span>
          {group ? (
            <Link href={`/aerobics#${group.id}`} className="chip">
              {group.label}
            </Link>
          ) : null}
        </div>
      </header>

      <div className="max-w-3xl space-y-10">
        {video ? (
          <div className="space-y-2">
            <div className="overflow-hidden rounded-xl">
              <FormVideo src={video} label={`${exercise.name} form demo`} />
            </div>
            {exercise.videoHint ? (
              <p className="text-sm text-pretty text-muted-foreground">{exercise.videoHint}</p>
            ) : null}
          </div>
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
