import { expect, it } from "vitest";
import { countdownCue, countdownStage } from "./countdown";
it("changes pace exactly at minute, half-minute and final-ten thresholds", () => {
  expect([120, 61, 60, 31, 30, 11, 10, 1, 0].map(countdownStage)).toEqual([
    "steady",
    "steady",
    "building",
    "building",
    "urgent",
    "urgent",
    "final",
    "final",
    "finished",
  ]);
  expect(countdownCue(120)).toHaveLength(1);
  expect(countdownCue(119)).toHaveLength(0);
  expect(countdownCue(60)).toHaveLength(1);
  expect(countdownCue(30)).toHaveLength(2);
  expect(countdownCue(10)).toHaveLength(3);
  expect(countdownCue(9)).toHaveLength(3);
  expect(countdownCue(30)[0].frequency).toBeGreaterThan(
    countdownCue(60)[0].frequency,
  );
  expect(
    countdownCue(10).at(-1)!.at + countdownCue(10).at(-1)!.duration,
  ).toBeLessThan(1);
});
