import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { POSTS, getPost } from "@/content/posts";
import { formatDate } from "@/lib/site";

export const dynamicParams = false;

export function generateStaticParams() {
  return POSTS.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/blog/[slug]">): Promise<Metadata> {
  const post = getPost((await params).slug);
  if (!post) return {};
  return { title: post.title, description: post.description };
}

export default async function BlogPostPage({ params }: PageProps<"/blog/[slug]">) {
  const post = getPost((await params).slug);
  if (!post) notFound();

  const { default: Content } = await import(`@/content/blog/${post.slug}.mdx`);

  return (
    <article className="mx-auto max-w-2xl space-y-10 px-5 pt-10">
      <Link href="/blog" className="text-sm font-extrabold text-muted-foreground hover:text-foreground">
        All guides
      </Link>
      <header className="space-y-3">
        <p className="text-sm text-muted-foreground">
          <time dateTime={post.date}>{formatDate(post.date)}</time> · {post.readMinutes} min read
        </p>
        <h1 className="text-4xl font-extrabold tracking-tight text-balance">{post.title}</h1>
        <p className="text-lg text-muted-foreground">{post.description}</p>
      </header>
      <div className="prose prose-invert max-w-none prose-headings:tracking-tight prose-a:text-primary prose-a:no-underline hover:prose-a:underline">
        <Content />
      </div>
    </article>
  );
}
