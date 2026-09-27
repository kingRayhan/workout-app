"use client";

import { ActivityReport } from "@/components/activity-report";
import { AppHeader } from "@/components/app-header";
import { GoogleSignInButton } from "@/components/google-sign-in-button";
import { ProfileCard } from "@/components/profile-card";
import { AccountRowSkeleton } from "@/components/skeletons";
import { useAuth } from "@/lib/auth";

export function YouScreen() {
  const { user, loading } = useAuth();

  return (
    <div className="flex flex-col pb-4">
      <AppHeader title="You" subtitle="Account & reports" />

      <div className="flex flex-col gap-3 px-4 pt-1">
        <section className="rounded-2xl bg-card px-4 py-4 ring-1 ring-border/80">
          <h2 className="text-[13px] font-semibold">Account</h2>
          <div className="mt-3">
            {loading ? <AccountRowSkeleton /> : <GoogleSignInButton />}
          </div>
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
