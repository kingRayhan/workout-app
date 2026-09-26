"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { AppHeader } from "@/components/app-header";
import { MACHINES, type Machine } from "@/data/machines";
import { DAYS } from "@/data/plan";
import { cn } from "@/lib/utils";
import { ChevronDown } from "lucide-react";

function exerciseName(id: string): string {
  for (const day of DAYS) {
    const hit = day.exercises.find((e) => e.id === id);
    if (hit) return hit.name;
  }
  return id;
}

export function MachineRow({
  machine,
  open,
  onToggle,
}: {
  machine: Machine;
  open: boolean;
  onToggle: () => void;
}) {
  return (
    <article
      id={machine.id}
      className={cn("scroll-mt-24", open && "bg-muted/50")}
    >
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        className="flex w-full items-center gap-3 px-4 py-3 text-left active:bg-muted/80"
      >
        <span className="relative size-14 shrink-0 overflow-hidden rounded-xl bg-muted">
          <Image
            src={machine.image}
            alt=""
            fill
            className="object-cover"
            sizes="56px"
          />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-[15px] font-semibold leading-snug text-foreground">
            {machine.name}
          </span>
          <span className="mt-0.5 line-clamp-2 text-[12px] leading-snug text-muted-foreground">
            {machine.howToFind}
          </span>
        </span>
        <ChevronDown
          className={cn(
            "size-4 shrink-0 text-muted-foreground transition-transform",
            open && "rotate-180 text-foreground",
          )}
          aria-hidden
        />
      </button>

      {open ? (
        <div className="animate-expand space-y-4 px-4 pb-4">
          <div className="relative aspect-[16/10] overflow-hidden rounded-xl bg-muted">
            <Image
              src={machine.image}
              alt={machine.name}
              fill
              className="object-cover"
              sizes="400px"
            />
          </div>

          {machine.aka ? (
            <p className="text-[13px] text-muted-foreground">
              Also called {machine.aka}
            </p>
          ) : null}

          <div>
            <h3 className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
              Setup
            </h3>
            <ul className="mt-2 space-y-2">
              {machine.setup.map((step) => (
                <li
                  key={step}
                  className="flex gap-2.5 text-[14px] leading-relaxed text-foreground/90"
                >
                  <span className="mt-2 size-1.5 shrink-0 rounded-full bg-primary" />
                  <span>{step}</span>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
              In catalog
            </h3>
            <ul className="mt-2 flex flex-wrap gap-1.5">
              {machine.usedBy.map((id) => (
                <li key={id}>
                  <Link
                    href="/catalog?tab=exercises"
                    className="inline-flex rounded-lg bg-muted px-2.5 py-1.5 text-[13px] font-medium text-foreground active:bg-muted/80"
                  >
                    {exerciseName(id)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      ) : null}
    </article>
  );
}

export function MachinesCatalog({ embedded = false }: { embedded?: boolean }) {
  const [openId, setOpenId] = useState<string | null>(null);

  useEffect(() => {
    const hash = window.location.hash.replace("#", "");
    if (hash && MACHINES.some((m) => m.id === hash)) {
      setOpenId(hash);
      requestAnimationFrame(() => {
        document.getElementById(hash)?.scrollIntoView({ behavior: "smooth" });
      });
    }
  }, []);

  const list = (
    <div className="divide-y divide-border/80 border-y border-border/80 bg-card">
      {MACHINES.map((machine) => (
        <MachineRow
          key={machine.id}
          machine={machine}
          open={openId === machine.id}
          onToggle={() =>
            setOpenId((current) =>
              current === machine.id ? null : machine.id,
            )
          }
        />
      ))}
    </div>
  );

  if (embedded) return list;

  return (
    <div className="flex flex-col pb-6">
      <AppHeader title="Machines" subtitle="Find the right station" />
      {list}
    </div>
  );
}
