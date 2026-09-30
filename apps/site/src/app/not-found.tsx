import Link from "next/link";
import { GameIcon } from "@/components/game-icon";
import { ICONS } from "@/lib/icons";

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-xl flex-col items-center gap-4 px-5 pt-24 text-center">
      <GameIcon src={ICONS.logo} className="size-16" />
      <h1 className="text-3xl font-extrabold tracking-tight">Nothing here</h1>
      <p className="text-muted-foreground">That machine, move, or guide doesn&apos;t exist.</p>
      <Link href="/" className="btn">
        Back to base
      </Link>
    </div>
  );
}
