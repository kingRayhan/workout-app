import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getCatalogExercise } from "@workoutland/data/catalog";
import { MACHINES, getMachine } from "@workoutland/data/machines";
import type { Exercise } from "@workoutland/data/plan";
import { ExerciseCard } from "@/components/exercise-card";

export const dynamicParams = false;

export function generateStaticParams() {
  return MACHINES.map((m) => ({ id: m.id }));
}

export async function generateMetadata({
  params,
}: PageProps<"/machines/[id]">): Promise<Metadata> {
  const machine = getMachine((await params).id);
  if (!machine) return {};
  return { title: machine.name, description: machine.howToFind };
}

export default async function MachinePage({ params }: PageProps<"/machines/[id]">) {
  const machine = getMachine((await params).id);
  if (!machine) notFound();

  const exercises = machine.usedBy
    .map(getCatalogExercise)
    .filter((e): e is Exercise => Boolean(e));

  return (
    <div className="mx-auto max-w-6xl space-y-10 px-5 pt-10">
      <Link href="/machines" className="text-sm font-extrabold text-muted-foreground hover:text-foreground">
        All machines
      </Link>

      <div className="grid gap-10 md:grid-cols-[minmax(0,5fr)_minmax(0,6fr)]">
        <div className="relative aspect-square overflow-hidden rounded-xl bg-white">
          <Image
            src={machine.image}
            alt={machine.name}
            fill
            priority
            sizes="(min-width: 768px) 45vw, 100vw"
            className="object-contain p-8"
          />
        </div>

        <div className="space-y-8">
          <header className="space-y-2">
            <h1 className="text-4xl font-extrabold tracking-tight">{machine.name}</h1>
            {machine.aka ? <p className="text-muted-foreground">Also called: {machine.aka}</p> : null}
          </header>

          <section className="space-y-2">
            <h2 className="text-sm font-medium text-muted-foreground">How to find it</h2>
            <p className="text-lg text-pretty">{machine.howToFind}</p>
          </section>

          <section className="space-y-3">
            <h2 className="text-sm font-medium text-muted-foreground">Setup</h2>
            <ol className="space-y-2">
              {machine.setup.map((step, i) => (
                <li key={step} className="flex gap-3">
                  <span className="step-pip">{i + 1}</span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>
          </section>

          {exercises.length > 0 ? (
            <section className="space-y-3">
              <h2 className="text-sm font-medium text-muted-foreground">
                Exercises on this machine
              </h2>
              <div className="grid gap-3">
                {exercises.map((e) => (
                  <ExerciseCard key={e.id} exercise={e} />
                ))}
              </div>
            </section>
          ) : null}
        </div>
      </div>
    </div>
  );
}
