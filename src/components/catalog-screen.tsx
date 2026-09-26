"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useCallback } from "react";
import { CatalogSkeleton } from "@/components/skeletons";
import { AppHeader } from "@/components/app-header";
import { MachinesCatalog } from "@/components/machines-catalog";
import { WorkoutCatalog } from "@/components/workout-catalog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PLAN_META } from "@/data/plan";
import { MACHINES } from "@/data/machines";
import { allCatalogExercises, isMuscleTag } from "@/lib/catalog";
import { Search } from "lucide-react";

function CatalogTabs() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tab = searchParams.get("tab") === "machines" ? "machines" : "exercises";
  const rawTag = searchParams.get("tag");
  const tag = isMuscleTag(rawTag) ? rawTag : null;
  const totalExercises = allCatalogExercises().length;

  const replaceParams = useCallback(
    (next: { tab?: string; tag?: string | null }) => {
      const params = new URLSearchParams(searchParams.toString());
      const nextTab = next.tab ?? tab;
      if (nextTab === "machines") params.set("tab", "machines");
      else params.delete("tab");

      if (nextTab === "machines") {
        params.delete("tag");
      } else if (next.tag === null) {
        params.delete("tag");
      } else if (next.tag !== undefined) {
        params.set("tag", next.tag);
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

      <div className="px-4 pb-3">
        <Link
          href="/catalog/search"
          className="flex h-10 items-center gap-2.5 rounded-xl bg-muted px-3 text-[14px] text-muted-foreground active:bg-muted/80"
        >
          <Search className="size-4 shrink-0" aria-hidden />
          <span>Search exercises &amp; machines</span>
        </Link>
      </div>

      <Tabs
        value={tab}
        onValueChange={(next) => replaceParams({ tab: next })}
        className="gap-0"
      >
        <div className="sticky top-[calc(env(safe-area-inset-top)+3.75rem)] z-10 bg-background/95 px-4 pb-2 backdrop-blur-md">
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
            onTagChange={(next) => replaceParams({ tag: next })}
          />
        </TabsContent>
        <TabsContent value="machines" className="mt-0 outline-none">
          <MachinesCatalog embedded />
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
