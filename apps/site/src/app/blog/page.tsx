import type { Metadata } from "next";
import { GameIcon } from "@/components/game-icon";
import { PostCard } from "@/components/post-card";
import { POSTS } from "@/content/posts";
import { ICONS } from "@/lib/icons";

export const metadata: Metadata = {
  title: "Blog",
  description: "Short, practical guides for getting started in the gym.",
};

export default function BlogPage() {
  return (
    <div className="mx-auto max-w-6xl space-y-10 px-5 pt-14">
      <header className="max-w-2xl space-y-3">
        <h1 className="flex items-center gap-3 text-4xl font-extrabold tracking-tight">
          <GameIcon src={ICONS.blog} className="size-12" />
          Field guides
        </h1>
        <p className="text-muted-foreground">
          Short, practical guides for getting started — no jargon, no supplements.
        </p>
      </header>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {POSTS.map((post) => (
          <PostCard key={post.slug} post={post} />
        ))}
      </div>
    </div>
  );
}
