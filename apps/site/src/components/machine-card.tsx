import Image from "next/image";
import Link from "next/link";
import type { Machine } from "@workoutland/data/machines";

export function MachineCard({ machine }: { machine: Machine }) {
  return (
    <Link href={`/machines/${machine.id}`} className="panel group flex flex-col overflow-hidden">
      <div className="relative aspect-square bg-white">
        <Image
          src={machine.image}
          alt={machine.name}
          fill
          sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
          className="object-contain p-4 transition group-hover:scale-[1.03]"
        />
      </div>
      <div className="space-y-1 p-4">
        <p className="font-extrabold tracking-tight">{machine.name}</p>
        <p className="text-sm font-semibold text-muted-foreground">
          {machine.usedBy.length} {machine.usedBy.length === 1 ? "move" : "moves"}
          {machine.aka ? ` · ${machine.aka}` : ""}
        </p>
      </div>
    </Link>
  );
}
