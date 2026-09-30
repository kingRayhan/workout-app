import Link from "next/link";
import { GameIcon } from "@/components/game-icon";
import type { Post } from "@/content/posts";
import { ICONS } from "@/lib/icons";
import { formatDate } from "@/lib/site";

export function PostCard({ post }: { post: Post }) {
  return (
    <Link href={`/blog/${post.slug}`} className="panel flex flex-col gap-3 p-5">
      <p className="inline-flex items-center gap-2 text-xs font-bold text-muted-foreground">
        <GameIcon src={ICONS.blog} className="size-5" />
        <time dateTime={post.date}>{formatDate(post.date)}</time>
        <span>· {post.readMinutes} min</span>
      </p>
      <p className="text-lg font-extrabold leading-snug tracking-tight">{post.title}</p>
      <p className="text-sm text-muted-foreground">{post.description}</p>
    </Link>
  );
}
