import Link from "next/link";
import { GameIcon } from "@/components/game-icon";
import { NavLinks } from "@/components/nav-links";
import { ICONS } from "@/lib/icons";
import { SITE } from "@/lib/site";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-30 border-b border-white/5 bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-[4.5rem] max-w-6xl items-center gap-3 px-4 sm:gap-5 sm:px-5">
        <Link href="/" className="flex items-center gap-2 font-extrabold tracking-tight">
          <GameIcon src={ICONS.logo} className="size-9" />
          <span className="hidden sm:inline">{SITE.name}</span>
        </Link>
        <NavLinks />
        <a href={SITE.appUrl} className="btn ml-auto px-3 sm:px-[1.1rem]">
          <GameIcon src={ICONS.play} className="size-5" />
          <span className="hidden sm:inline">Play</span>
        </a>
      </div>
    </header>
  );
}
