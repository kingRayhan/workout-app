import Link from "next/link";
import { allCatalogExercises } from "@workoutland/data/catalog";
import { MACHINES } from "@workoutland/data/machines";
import { DAYS } from "@workoutland/data/plan";
import { GameIcon } from "@/components/game-icon";
import { MachineCard } from "@/components/machine-card";
import { PostCard } from "@/components/post-card";
import { POSTS } from "@/content/posts";
import { ICONS } from "@/lib/icons";
import { SITE } from "@/lib/site";

const FEATURED_MACHINES = MACHINES.slice(0, 8);
const MOVE_COUNT = allCatalogExercises().length;

export default function HomePage() {
  const stats = [
    { value: MACHINES.length, label: "machines", icon: ICONS.machines },
    { value: MOVE_COUNT, label: "moves", icon: ICONS.moves },
    { value: DAYS.length, label: "quests", icon: ICONS.days },
  ];

  return (
    <div className="mx-auto max-w-6xl space-y-16 px-5 pt-12 sm:pt-16">
      <section className="grid items-center gap-10 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
        <div className="space-y-6">
          <p className="badge">
            <span className="size-1.5 rounded-full bg-primary" aria-hidden />
            Level 1 · Beginner
          </p>
          <h1 className="text-4xl font-extrabold tracking-tight text-balance sm:text-6xl">
            {SITE.tagline}
          </h1>
          <p className="max-w-xl text-lg text-muted-foreground text-pretty">{SITE.description}</p>
          <div className="max-w-md space-y-2">
            <div className="flex items-baseline justify-between text-xs font-extrabold uppercase tracking-wider">
              <span className="text-primary">Catalog unlocked</span>
              <span className="font-mono text-muted-foreground">{MOVE_COUNT} / {MOVE_COUNT}</span>
            </div>
            <div className="xp-track" role="img" aria-label={`${MOVE_COUNT} moves in the catalog`}>
              <div className="xp-fill w-full" />
            </div>
          </div>
          <div className="flex flex-wrap gap-3 pt-1">
            <Link href="/machines" className="btn">
              <GameIcon src={ICONS.machines} className="size-6" />
              Browse machines
            </Link>
            <Link href="/workouts" className="btn btn-muted">
              <GameIcon src={ICONS.workouts} className="size-6" />
              Start the quests
            </Link>
            <Link href="/aerobics" className="btn btn-muted">
              <GameIcon src={ICONS.aerobics} className="size-6" />
              Aerobics
            </Link>
          </div>
        </div>

        <ul className="grid grid-cols-3 gap-3">
          {stats.map((s) => (
            <li key={s.label} className="panel flex flex-col items-center gap-1 px-2 py-5 text-center">
              <GameIcon src={s.icon} className="size-12" />
              <p className="text-3xl font-extrabold tabular-nums">{s.value}</p>
              <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">{s.label}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="space-y-5">
        <SectionHeading title="Machine locker" href="/machines" linkLabel={`All ${MACHINES.length}`} icon={ICONS.machines} />
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {FEATURED_MACHINES.map((m) => (
            <MachineCard key={m.id} machine={m} />
          ))}
        </div>
      </section>

      <section className="space-y-5">
        <SectionHeading title="Quest board" href="/workouts" linkLabel="Full plan" icon={ICONS.workouts} />
        <div className="grid gap-4 md:grid-cols-3">
          {DAYS.map((day) => (
            <Link key={day.id} href={`/workouts#day-${day.id}`} className="panel space-y-3 p-5">
              <p className="badge">Quest {day.id}</p>
              <p className="text-xl font-extrabold tracking-tight">{day.title}</p>
              <p className="text-sm text-muted-foreground">{day.subtitle}</p>
              <div className="xp-track" role="img" aria-label={`${day.exercises.length} moves`}>
                <div className="xp-fill w-full" />
              </div>
              <p className="text-sm font-bold text-muted-foreground">
                {day.exercises.length} moves · {day.exercises.slice(0, 2).map((e) => e.name).join(", ")}
              </p>
            </Link>
          ))}
        </div>
      </section>

      <section className="space-y-5">
        <SectionHeading title="Field guides" href="/blog" linkLabel="All guides" icon={ICONS.blog} />
        <div className="grid gap-4 md:grid-cols-3">
          {POSTS.slice(0, 3).map((post) => (
            <PostCard key={post.slug} post={post} />
          ))}
        </div>
      </section>
    </div>
  );
}

function SectionHeading({
  title,
  href,
  linkLabel,
  icon,
}: {
  title: string;
  href: string;
  linkLabel: string;
  icon: string;
}) {
  return (
    <div className="flex items-end justify-between gap-4">
      <h2 className="flex items-center gap-2 text-2xl font-extrabold tracking-tight">
        <GameIcon src={icon} className="size-8" />
        {title}
      </h2>
      <Link href={href} className="text-sm font-extrabold text-primary">
        {linkLabel}
      </Link>
    </div>
  );
}
