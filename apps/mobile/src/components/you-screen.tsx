"use client";

import { ActivityReport } from "@/components/activity-report";
import { AppHeader } from "@/components/app-header";
import { GoogleSignInButton } from "@/components/google-sign-in-button";
import { ProfileCard } from "@/components/profile-card";
import { AccountRowSkeleton } from "@/components/skeletons";
import { IconImage, IconTile } from "@/components/icon-tile";
import { EXERCISE_LOG_HREF, WEIGHT_LOG_HREF } from "@/lib/routes";
import { useAuth } from "@/lib/auth";
import { setTourStatus } from "@/lib/user-data";
import { ChevronRight, Compass, Dumbbell, Scale } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function YouScreen() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [replaying, setReplaying] = useState(false);

  async function replayTour() {
    if (!user) return;
    setReplaying(true);
    try {
      await setTourStatus(user.uid, null);
      router.push("/");
    } finally {
      setReplaying(false);
    }
  }

  return (
    <div className="flex flex-col pb-4">
      <AppHeader title="You" subtitle="Account & reports" />

      <div className="flex flex-col gap-3 px-4 pt-1">
        <section className="rounded-2xl bg-card px-4 py-4 ring-1 ring-border/80">
          <h2 className="text-[13px] font-semibold">Account</h2>
          <div className="mt-3">
            {loading ? <AccountRowSkeleton /> : <GoogleSignInButton />}
          </div>
          {user ? (
            <button
              type="button"
              disabled={replaying}
              onClick={() => void replayTour()}
              className="mt-3 flex w-full items-center gap-2 rounded-xl bg-muted/60 px-3 py-2.5 text-left text-[13px] active:bg-muted disabled:opacity-60"
            >
              <IconImage icon={Compass} className="size-5" />
              <span className="flex-1 font-medium">Replay app tour</span>
              <ChevronRight className="size-4 text-muted-foreground" aria-hidden />
            </button>
          ) : null}
        </section>

        {user ? <ProfileCard /> : null}

        {user ? (
          <section className="rounded-2xl bg-card px-4 py-4 ring-1 ring-border/80">
            <h2 className="text-[13px] font-semibold">Logs</h2>
            <div className="mt-3 space-y-2">
              <Link
                href={EXERCISE_LOG_HREF}
                className="flex items-center gap-3 rounded-xl bg-muted/60 px-3 py-2.5 active:bg-muted"
              >
                <IconTile icon={Dumbbell} tone="lime" size="sm" />
                <span className="min-w-0 flex-1">
                  <span className="block text-[13px] font-medium">Exercise log</span>
                  <span className="block text-[11px] text-muted-foreground">
                    Weights lifted, sessions, and personal bests
                  </span>
                </span>
                <ChevronRight className="size-4 text-muted-foreground" aria-hidden />
              </Link>
              <Link
                href={WEIGHT_LOG_HREF}
                className="flex items-center gap-3 rounded-xl bg-muted/60 px-3 py-2.5 active:bg-muted"
              >
                <IconTile icon={Scale} tone="amber" size="sm" />
                <span className="min-w-0 flex-1">
                  <span className="block text-[13px] font-medium">Body weight log</span>
                  <span className="block text-[11px] text-muted-foreground">
                    Weigh-ins, trend, and target progress
                  </span>
                </span>
                <ChevronRight className="size-4 text-muted-foreground" aria-hidden />
              </Link>
            </div>
          </section>
        ) : null}

        <section className="rounded-2xl bg-card px-4 py-4 ring-1 ring-border/80">
          <h2 className="text-[13px] font-semibold">Report</h2>
          <div className="mt-3">
            <ActivityReport />
          </div>
        </section>
      </div>
    </div>
  );
}
