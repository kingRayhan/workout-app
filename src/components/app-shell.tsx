"use client";

import { BottomTabs } from "@/components/bottom-tabs";
import type { ReactNode } from "react";

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="app-viewport flex min-h-dvh flex-col items-center justify-center px-0 sm:px-4 sm:py-6">
      <div className="app-phone relative flex h-dvh w-full max-w-[430px] flex-col overflow-hidden bg-background sm:h-[min(844px,calc(100dvh-3rem))] sm:rounded-[2rem] sm:border sm:border-border sm:shadow-[0_25px_80px_-20px_rgba(0,0,0,0.65)]">
        <div className="pointer-events-none absolute inset-x-0 top-0 z-20 hidden h-7 items-end justify-center sm:flex">
          <div className="mb-1 h-1.5 w-24 rounded-full bg-foreground/20" />
        </div>

        <main className="app-scroll min-h-0 flex-1 overflow-y-auto overscroll-y-contain">
          {children}
        </main>

        <BottomTabs />
      </div>
    </div>
  );
}
