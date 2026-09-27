"use client";

import { ActivityReport } from "@/components/activity-report";
import { AppHeader } from "@/components/app-header";
import { GoogleSignInButton } from "@/components/google-sign-in-button";
import { ProfileCard } from "@/components/profile-card";
import { AccountRowSkeleton } from "@/components/skeletons";
import { useAuth } from "@/lib/auth";
import { setTourStatus } from "@/lib/user-data";
import { ChevronRight, Compass } from "lucide-react";
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
              <Compass className="size-4 text-primary" aria-hidden />
              <span className="flex-1 font-medium">Replay app tour</span>
              <ChevronRight className="size-4 text-muted-foreground" aria-hidden />
            </button>
          ) : null}
        </section>

        {user ? <ProfileCard /> : null}

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
