"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { MachineRow } from "@/components/machines-catalog";
import { ExerciseRow } from "@/components/workout-catalog";
import { Input } from "@/components/ui/input";
import { searchCatalog } from "@/lib/catalog";
import { ArrowLeft, Search } from "lucide-react";

function CatalogSearchBody() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const urlQuery = searchParams.get("q") ?? "";
  const [draft, setDraft] = useState(urlQuery);
  const [openId, setOpenId] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setDraft(urlQuery);
  }, [urlQuery]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const results = useMemo(() => searchCatalog(draft), [draft]);
  const total = results.exercises.length + results.machines.length;
  const trimmed = draft.trim();

  function commitQuery(next: string) {
    setDraft(next);
    setOpenId(null);
    const params = new URLSearchParams();
    const q = next.trim();
    if (q) params.set("q", q);
    const qs = params.toString();
    router.replace(qs ? `/catalog/search?${qs}` : "/catalog/search", {
      scroll: false,
    });
  }

  return (
    <div className="flex flex-col pb-6">
      <header className="sticky top-0 z-10 bg-background/95 px-4 pb-3 pt-[max(0.65rem,env(safe-area-inset-top))] backdrop-blur-md">
        <div className="flex items-center gap-2">
          <Link
            href="/catalog"
            className="flex size-10 shrink-0 items-center justify-center rounded-xl text-foreground active:bg-muted"
            aria-label="Back to catalog"
          >
            <ArrowLeft className="size-5" />
          </Link>
          <div className="relative min-w-0 flex-1">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden
            />
            <Input
              ref={inputRef}
              type="search"
              value={draft}
              onChange={(e) => commitQuery(e.target.value)}
              placeholder="Exercises, machines…"
              aria-label="Search catalog"
              className="h-10 rounded-xl bg-muted/80 pl-9 pr-3 text-[15px] dark:bg-muted/80"
              autoCapitalize="off"
              autoCorrect="off"
              enterKeyHint="search"
            />
          </div>
        </div>
      </header>

      {!trimmed ? (
        <p className="px-4 py-10 text-center text-[13px] leading-relaxed text-muted-foreground">
          Search the trainer catalog by name, muscle, or station.
        </p>
      ) : total === 0 ? (
        <p className="px-4 py-10 text-center text-[13px] text-muted-foreground">
          No matches for “{trimmed}”.
        </p>
      ) : (
        <div className="flex flex-col gap-5">
          <p className="px-4 text-[12px] text-muted-foreground">
            {total} result{total === 1 ? "" : "s"}
          </p>

          {results.exercises.length > 0 ? (
            <section>
              <h2 className="px-4 pb-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
                Exercises · {results.exercises.length}
              </h2>
              <div className="divide-y divide-border/80 border-y border-border/80 bg-card">
                {results.exercises.map((exercise, index) => (
                  <ExerciseRow
                    key={exercise.id}
                    exercise={exercise}
                    index={index}
                    open={openId === `ex:${exercise.id}`}
                    onToggle={() =>
                      setOpenId((current) =>
                        current === `ex:${exercise.id}`
                          ? null
                          : `ex:${exercise.id}`,
                      )
                    }
                  />
                ))}
              </div>
            </section>
          ) : null}

          {results.machines.length > 0 ? (
            <section>
              <h2 className="px-4 pb-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
                Machines · {results.machines.length}
              </h2>
              <div className="divide-y divide-border/80 border-y border-border/80 bg-card">
                {results.machines.map((machine) => (
                  <MachineRow
                    key={machine.id}
                    machine={machine}
                    open={openId === `m:${machine.id}`}
                    onToggle={() =>
                      setOpenId((current) =>
                        current === `m:${machine.id}`
                          ? null
                          : `m:${machine.id}`,
                      )
                    }
                  />
                ))}
              </div>
            </section>
          ) : null}
        </div>
      )}
    </div>
  );
}

export function CatalogSearchScreen() {
  return (
    <Suspense
      fallback={
        <div className="px-4 pt-[max(0.65rem,env(safe-area-inset-top))]">
          <div className="h-10 animate-pulse rounded-xl bg-muted" />
        </div>
      }
    >
      <CatalogSearchBody />
    </Suspense>
  );
}
