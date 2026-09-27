"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  {
    href: "/",
    label: "Today",
    match: (p: string) => p === "/",
    icon: TodayIcon,
  },
  {
    href: "/catalog",
    label: "Catalog",
    match: (p: string) => p.startsWith("/catalog") || p.startsWith("/machines"),
    icon: CatalogIcon,
  },
  {
    href: "/plan",
    label: "Plan",
    match: (p: string) => p.startsWith("/plan"),
    icon: PlanIcon,
  },
  {
    href: "/you",
    label: "You",
    match: (p: string) => p.startsWith("/you") || p.startsWith("/report"),
    icon: YouIcon,
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
          const Icon = tab.icon;
          return (
            <li key={tab.href}>
              <Link
                href={tab.href}
                className={`flex min-h-11 flex-col items-center justify-center gap-0.5 rounded-lg px-1 transition-colors ${
                  active ? "text-primary" : "text-muted-foreground"
                }`}
              >
                <Icon active={active} />
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

function TodayIcon({ active }: { active: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
      <rect
        x="4"
        y="5"
        width="16"
        height="15"
        rx="3"
        stroke="currentColor"
        strokeWidth={active ? 2 : 1.6}
      />
      <path
        d="M4 10h16M8 3v4M16 3v4"
        stroke="currentColor"
        strokeWidth={active ? 2 : 1.6}
        strokeLinecap="round"
      />
      <path
        d="M8 14h3M8 17h5"
        stroke="currentColor"
        strokeWidth={active ? 2 : 1.6}
        strokeLinecap="round"
      />
    </svg>
  );
}

function CatalogIcon({ active }: { active: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M6 4h9a3 3 0 0 1 3 3v13H9a3 3 0 0 0-3 3V4Z"
        stroke="currentColor"
        strokeWidth={active ? 2 : 1.6}
        strokeLinejoin="round"
      />
      <path
        d="M9 8h6M9 12h6M9 16h4"
        stroke="currentColor"
        strokeWidth={active ? 2 : 1.6}
        strokeLinecap="round"
      />
    </svg>
  );
}

function PlanIcon({ active }: { active: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M8 6h11M8 12h11M8 18h11"
        stroke="currentColor"
        strokeWidth={active ? 2 : 1.6}
        strokeLinecap="round"
      />
      <circle
        cx="5"
        cy="6"
        r="1.2"
        fill={active ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth={active ? 0 : 1.6}
      />
      <circle
        cx="5"
        cy="12"
        r="1.2"
        fill={active ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth={active ? 0 : 1.6}
      />
      <circle
        cx="5"
        cy="18"
        r="1.2"
        fill={active ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth={active ? 0 : 1.6}
      />
    </svg>
  );
}

function YouIcon({ active }: { active: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle
        cx="12"
        cy="9"
        r="3.5"
        stroke="currentColor"
        strokeWidth={active ? 2 : 1.6}
      />
      <path
        d="M5.5 19.5c1.5-3 4-4.5 6.5-4.5s5 1.5 6.5 4.5"
        stroke="currentColor"
        strokeWidth={active ? 2 : 1.6}
        strokeLinecap="round"
      />
    </svg>
  );
}
