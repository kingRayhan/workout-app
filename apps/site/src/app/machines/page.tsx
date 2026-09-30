import type { Metadata } from "next";
import { MACHINES } from "@workoutland/data/machines";
import { GameIcon } from "@/components/game-icon";
import { MachineCard } from "@/components/machine-card";
import { ICONS } from "@/lib/icons";

export const metadata: Metadata = {
  title: "Machines",
  description: "Every machine in the gym: what it looks like, how to set it up, and what it trains.",
};

export default function MachinesPage() {
  return (
    <div className="mx-auto max-w-6xl space-y-10 px-5 pt-14">
      <header className="max-w-2xl space-y-3">
        <h1 className="flex items-center gap-3 text-4xl font-extrabold tracking-tight">
          <GameIcon src={ICONS.machines} className="size-12" />
          Machine locker
        </h1>
        <p className="text-muted-foreground">
          {MACHINES.length} machines and stations. Tap one to see how to spot it on the floor,
          how to set it up, and which exercises it&apos;s for.
        </p>
      </header>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {MACHINES.map((m) => (
          <MachineCard key={m.id} machine={m} />
        ))}
      </div>
    </div>
  );
}
