import Link from "next/link";
import { MEDIA_CREDIT } from "@workoutland/data/media";
import { GameIcon } from "@/components/game-icon";
import { ICONS } from "@/lib/icons";
import { SITE } from "@/lib/site";

const LINKS = [
  { href: "/machines", label: "Machines", icon: ICONS.machines },
  { href: "/workouts", label: "Workouts", icon: ICONS.workouts },
  { href: "/aerobics", label: "Aerobics", icon: ICONS.aerobics },
  { href: "/blog", label: "Guides", icon: ICONS.blog },
] as const;

export function SiteFooter() {
  return (
    <footer className="mt-20">
      <div className="mx-auto grid max-w-6xl gap-6 px-5 py-10 sm:grid-cols-[1fr_auto]">
        <div className="space-y-2">
          <p className="flex items-center gap-2 font-extrabold">
            <GameIcon src={ICONS.logo} className="size-7" />
            {SITE.name}
          </p>
          <p className="max-w-xl text-sm text-muted-foreground">{MEDIA_CREDIT}</p>
        </div>
        <nav className="flex gap-4 text-sm font-bold sm:flex-col sm:gap-2">
          {LINKS.map((link) => (
            <Link key={link.href} href={link.href} className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground">
              <GameIcon src={link.icon} className="size-5" />
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </footer>
  );
}
