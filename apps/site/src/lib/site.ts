export const SITE = {
  name: "Workoutland",
  tagline: "Know every machine before you walk in.",
  description:
    "A plain-language gym guide: every machine, how to set it up, the exercises it's for, and a simple 3-day routine.",
  appUrl: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
} as const;

export function formatDate(iso: string): string {
  return new Date(`${iso}T00:00:00`).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}
