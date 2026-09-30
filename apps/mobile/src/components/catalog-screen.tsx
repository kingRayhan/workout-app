"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useCallback, useEffect, useState } from "react";
import { CatalogSkeleton } from "@/components/skeletons";
import { AppHeader } from "@/components/app-header";
import { MachinesCatalog } from "@/components/machines-catalog";
import { WorkoutCatalog } from "@/components/workout-catalog";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PLAN_META } from "@workoutland/data/plan";
import { MACHINES } from "@workoutland/data/machines";
import { allCatalogExercises, isMuscleTag } from "@workoutland/data/catalog";
import { Search } from "lucide-react";
import { IconImage } from "@/components/icon-tile";

function CatalogTabs() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tab = searchParams.get("tab") === "machines" ? "machines" : "exercises";
  const focusExerciseId = searchParams.get("exercise");
  const rawTag = searchParams.get("tag");
  const tag =
    focusExerciseId || !isMuscleTag(rawTag) ? null : rawTag;
  const urlQuery = searchParams.get("q") ?? "";
  const [draft, setDraft] = useState(urlQuery);
  const totalExercises = allCatalogExercises().length;

  useEffect(() => {
    setDraft(urlQuery);
  }, [urlQuery]);

  const replaceParams = useCallback(
    (next: {
      tab?: string;
      tag?: string | null;
      q?: string | null;
      exercise?: string | null;
    }) => {
      const params = new URLSearchParams(searchParams.toString());
      const nextTab = next.tab ?? tab;
      if (nextTab === "machines") params.set("tab", "machines");
      else params.delete("tab");

      if (nextTab === "machines") {
        params.delete("tag");
        params.delete("exercise");
      } else if (next.tag === null) {
        params.delete("tag");
      } else if (next.tag !== undefined) {
        params.set("tag", next.tag);
      }

      if (next.q !== undefined) {
        const q = next.q?.trim() ?? "";
        if (q) params.set("q", q);
        else params.delete("q");
      }

      if (next.exercise !== undefined) {
        if (next.exercise) params.set("exercise", next.exercise);
        else params.delete("exercise");
      }

      const qs = params.toString();
      router.replace(qs ? `/catalog?${qs}` : "/catalog", { scroll: false });
    },
    [router, searchParams, tab],
  );

  return (
    <div className="flex flex-col pb-6">
      <AppHeader
        title="Catalog"
        subtitle={
          tab === "machines"
            ? `${MACHINES.length} stations`
            : `${PLAN_META.sets}×${PLAN_META.reps} · ${totalExercises} exercises`
        }
      />

      <Tabs
        value={tab}
        onValueChange={(next) => replaceParams({ tab: next })}
        className="gap-0"
      >
        <div className="sticky top-[calc(env(safe-area-inset-top)+3.75rem)] z-10 space-y-2 bg-background/95 px-4 pb-2 backdrop-blur-md">
          <div className="relative">
            <IconImage
              icon={Search}
              className="pointer-events-none absolute left-2.5 top-1/2 size-5 -translate-y-1/2"
            />
            <Input
              type="search"
              value={draft}
              onChange={(e) => {
                const next = e.target.value;
                setDraft(next);
                replaceParams({ q: next });
              }}
              placeholder="Search exercises & machines"
              aria-label="Search catalog"
              className="h-10 rounded-xl bg-muted/80 pl-9 pr-3 text-[15px] dark:bg-muted/80"
              autoCapitalize="off"
              autoCorrect="off"
              enterKeyHint="search"
            />
          </div>
          <TabsList className="grid h-10 w-full grid-cols-2 rounded-xl">
            <TabsTrigger value="exercises" className="rounded-lg text-[13px]">
              Exercises
            </TabsTrigger>
            <TabsTrigger value="machines" className="rounded-lg text-[13px]">
              Machines
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="exercises" className="mt-0 outline-none">
          <WorkoutCatalog
            embedded
            tag={tag}
            query={draft}
            focusExerciseId={focusExerciseId}
            onTagChange={(next) => replaceParams({ tag: next })}
          />
        </TabsContent>
        <TabsContent value="machines" className="mt-0 outline-none">
          <MachinesCatalog embedded query={draft} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

export function CatalogScreen() {
  return (
    <Suspense fallback={<CatalogSkeleton />}>
      <CatalogTabs />
    </Suspense>
  );
}
