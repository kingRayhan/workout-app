export function SplashScreen() {
  return (
    <div className="absolute inset-0 z-30 flex flex-col items-center justify-center gap-3 bg-background">
      <p className="text-[13px] font-semibold tracking-wide text-primary">
        Workoutland
      </p>
      <div
        className="size-6 animate-spin rounded-full border-2 border-muted border-t-primary"
        aria-hidden
      />
      <span className="sr-only">Loading…</span>
    </div>
  );
}
