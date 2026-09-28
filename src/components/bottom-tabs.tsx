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
      className="safe-bottom shrink-0 border-t border-border/80 bg-background/95 backdrop-blur-md"
      aria-label="Main"
    >
      <ul className="grid grid-cols-4 px-0.5 pt-1 pb-0.5">
        {TABS.map((tab) => {
          const active = tab.match(pathname);
          return (
            <li key={tab.href}>
              <Link
                href={tab.href}
                data-tour={`tab-${tab.label.toLowerCase()}`}
                className={cn(
                  "flex min-h-11 flex-col items-center justify-center gap-0.5 rounded-lg px-1",
                  active ? "text-primary" : "text-muted-foreground",
                )}
              >
                <Image
                  src={tab.image}
                  alt=""
                  width={128}
                  height={128}
                  className={cn(
                    "size-7 object-contain",
                    active ? "opacity-100" : "opacity-45",
                  )}
                />
                <span className="text-[10px] font-medium tracking-wide">
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
