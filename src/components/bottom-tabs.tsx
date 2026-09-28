"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const TABS = [
  {
    href: "/",
    label: "Today",
    image: "/icons/calendar.png",
    match: (p: string) => p === "/",
  },
  {
    href: "/catalog",
    label: "Catalog",
    image: "/shortcuts/catalog.png",
    match: (p: string) => p.startsWith("/catalog") || p.startsWith("/machines"),
  },
  {
    href: "/plan",
    label: "Plan",
    image: "/icons/plan.png",
    match: (p: string) => p.startsWith("/plan"),
  },
  {
    href: "/you",
    label: "You",
    image: "/icons/user.png",
    match: (p: string) => p.startsWith("/you") || p.startsWith("/report"),
  },
] as const;

export function BottomTabs() {
  const pathname = usePathname();

  return (
    <nav
      className="safe-bottom shrink-0 bg-card px-2 pt-1.5 shadow-[inset_0_1px_0_oklch(1_0_0/0.14)]"
      aria-label="Main"
    >
      <ul className="grid grid-cols-4 gap-1">
        {TABS.map((tab) => {
          const active = tab.match(pathname);
          return (
            <li key={tab.href}>
              <Link
                href={tab.href}
                data-tour={`tab-${tab.label.toLowerCase()}`}
                className={cn(
                  "flex min-h-12 flex-col items-center justify-center gap-0.5 rounded-2xl px-1",
                  active ? "text-primary" : "text-muted-foreground",
                )}
              >
                <span
                  className={cn(
                    "grid size-9 place-items-center rounded-xl",
                    active &&
                      "bg-primary/20 shadow-[inset_0_1px_0_oklch(1_0_0/0.28),0_3px_0_oklch(0.42_0.12_132)]",
                  )}
                >
                  <Image
                    src={tab.image}
                    alt=""
                    width={128}
                    height={128}
                    className={cn(
                      "size-7 object-contain",
                      active ? "opacity-100" : "opacity-50",
                    )}
                  />
                </span>
                <span className="text-[10px] font-bold tracking-wide">
                  {tab.label}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
