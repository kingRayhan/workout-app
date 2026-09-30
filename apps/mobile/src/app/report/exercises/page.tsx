import { Suspense } from "react";
import { ExerciseLogScreen } from "@/components/exercise-log-screen";

export const metadata = {
  title: "Exercise log — Workoutland",
};

export default function ExerciseLogPage() {
  return (
    <Suspense>
      <ExerciseLogScreen />
    </Suspense>
  );
}
