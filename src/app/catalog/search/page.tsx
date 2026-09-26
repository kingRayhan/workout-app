import { redirect } from "next/navigation";

export const metadata = {
  title: "Search — Workoutland",
  description: "Search exercises and machines in the trainer catalog.",
};

export default async function CatalogSearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const params = new URLSearchParams();
  if (q?.trim()) params.set("q", q.trim());
  const qs = params.toString();
  redirect(qs ? `/catalog?${qs}` : "/catalog");
}
