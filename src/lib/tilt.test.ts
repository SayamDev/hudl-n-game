import { describe, it, expect } from "vitest";
import { createTiltGesture, tiltPose } from "./tilt";
describe("phone tilt gestures", () => {
  it("recognises screen direction across portrait, landscape and inverted grips", () => {
    expect(tiltPose(90, 0)).toBe("upright");
    expect(tiltPose(0, 90)).toBe("upright");
    expect(tiltPose(0, -90)).toBe("upright");
    expect(tiltPose(170, 0)).toBe("floor");
    expect(tiltPose(-170, 0)).toBe("floor");
    expect(tiltPose(0, 0)).toBe("ceiling");
    expect(tiltPose(null, 0)).toBeNull();
    expect(tiltPose(90, NaN)).toBeNull();
  });
  it("requires an upright reset and dwell, and never repeats while held tilted", () => {
    const g = createTiltGesture();
    expect(g.sample("floor", 0)).toBeNull();
    g.sample("upright", 100);
    g.sample("upright", 350);
    expect(g.sample("floor", 400)).toBeNull();
    expect(g.sample("floor", 549)).toBeNull();
    expect(g.sample("floor", 550)).toBe("correct");
    expect(g.sample("floor", 1500)).toBeNull();
    expect(g.sample("ceiling", 2000)).toBeNull();
    g.sample("upright", 2100);
    g.sample("upright", 2350);
    g.sample("ceiling", 2400);
    expect(g.sample("ceiling", 2550)).toBe("skip");
  });
  it("ignores a brief bump and disarms on pause or manual input", () => {
    const g = createTiltGesture();
    g.sample("upright", 0);
    g.sample("upright", 300);
    g.sample("floor", 350);
    g.sample("moving", 400);
    expect(g.sample("floor", 500)).toBeNull();
    g.reset();
    expect(g.sample("floor", 800)).toBeNull();
  });
});
