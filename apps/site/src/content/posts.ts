export type Post = {
  /** Matches `src/content/blog/<slug>.mdx`. */
  slug: string;
  title: string;
  description: string;
  /** ISO date, e.g. "2026-09-28". */
  date: string;
  readMinutes: number;
};

/** Newest first. Add the MDX file and an entry here to publish a post. */
export const POSTS: Post[] = [
  {
    slug: "picking-the-right-weight",
    title: "Picking the right weight: the 12–15 rep rule",
    description:
      "How to find a starting load on any machine, and exactly when to go up or down.",
    date: "2026-09-28",
    readMinutes: 4,
  },
  {
    slug: "incline-walking-guide",
    title: "Incline walking: the easiest cardio that actually works",
    description:
      "Why a steep, slow treadmill walk beats a jog for most beginners, and how to set it up.",
    date: "2026-09-21",
    readMinutes: 3,
  },
  {
    slug: "first-week-at-the-gym",
    title: "Your first week at the gym, machine by machine",
    description:
      "A calm plan for the first three sessions: what to use, in what order, and what to skip.",
    date: "2026-09-14",
    readMinutes: 5,
  },
];

export function getPost(slug: string): Post | undefined {
  return POSTS.find((p) => p.slug === slug);
}
