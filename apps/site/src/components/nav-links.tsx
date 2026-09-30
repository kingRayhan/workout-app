"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ICONS } from "@/lib/icons";

const LINKS = [
  { href: "/machines", label: "Machines", icon: ICONS.machines },
  { href: "/workouts", label: "Workouts", icon: ICONS.workouts },
  { href: "/aerobics", label: "Aerobics", icon: ICONS.aerobics },
  { href: "/blog", label: "Guides", icon: ICONS.blog },
] as const;

export function NavLinks() {
  const pathname = usePathname();

  return (
    <nav className="flex items-center gap-1">
      {LINKS.map((link) => {
        const active = pathname.startsWith(link.href);
        return (
          <Link
            key={link.href}
            href={link.href}
            aria-current={active ? "page" : undefined}
            className={
              active
                ? "flex min-w-16 flex-col items-center gap-0.5 rounded-2xl bg-primary/20 px-2 py-1 text-primary shadow-[inset_0_1px_0_oklch(1_0_0/0.28),0_3px_0_oklch(0.42_0.12_132)]"
                : "flex min-w-16 flex-col items-center gap-0.5 rounded-2xl px-2 py-1 text-muted-foreground active:translate-y-0.5"
            }
          >
            <Image
              src={link.icon}
              alt=""
              width={128}
              height={128}
              className={`size-7 object-contain ${active ? "opacity-100" : "opacity-55"}`}
            />
            <span className="text-[10px] font-extrabold tracking-wide">{link.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
