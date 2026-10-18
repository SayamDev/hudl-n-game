export type CountdownStage =
  "steady" | "building" | "urgent" | "final" | "finished";
export function countdownStage(seconds: number): CountdownStage {
  return seconds <= 0
    ? "finished"
    : seconds <= 10
      ? "final"
      : seconds <= 30
        ? "urgent"
        : seconds <= 60
          ? "building"
          : "steady";
}
export function countdownCue(
  seconds: number,
): { frequency: number; at: number; duration: number }[] {
  const stage = countdownStage(seconds);
  if (stage === "finished")
    return [0, 0.16, 0.32].map((at, i) => ({
      frequency: [523, 659, 784][i],
      at,
      duration: 0.18,
    }));
  const interval =
    stage === "steady"
      ? 8
      : stage === "building"
        ? 4
        : stage === "urgent"
          ? 2
          : 1;
  if (seconds % interval) return [];
  const count = stage === "final" ? 3 : stage === "urgent" ? 2 : 1;
  return Array.from({ length: count }, (_, i) => ({
    frequency:
      stage === "steady"
        ? 220
        : stage === "building"
          ? 330
          : stage === "urgent"
            ? 440
            : 660 + i * 110,
    at: i * 0.13,
    duration: 0.09,
  }));
}
