import { Suspense } from "react";
import { WeightTrendScreen } from "@/components/weight-trend-screen";

export const metadata = {
  title: "Weight trend — Workoutland",
};

export default function WeightReportPage() {
  return (
    <Suspense>
      <WeightTrendScreen />
    </Suspense>
  );
}
