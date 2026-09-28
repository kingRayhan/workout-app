const COLORS = ["#a3e635", "#facc15", "#38bdf8", "#f472b6", "#fb923c"];

/** Short confetti burst from both lower corners; skipped for reduced motion. */
export async function celebrate() {
  const { default: confetti } = await import("canvas-confetti");
  const base = {
    particleCount: 60,
    spread: 65,
    startVelocity: 55,
    colors: COLORS,
    zIndex: 100,
    disableForReducedMotion: true,
  };
  void confetti({ ...base, angle: 60, origin: { x: 0, y: 0.85 } });
  void confetti({ ...base, angle: 120, origin: { x: 1, y: 0.85 } });
}
