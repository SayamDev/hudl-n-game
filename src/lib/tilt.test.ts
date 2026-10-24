import { describe, it, expect } from "vitest";
import { createTiltGesture, tiltPose, createTiltCalibration } from "./tilt";
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

describe("holder calibration", () => {
  it("accepts a steady inclined grip and makes it the neutral reset", () => {
    const c = createTiltCalibration();
    for (let t = 0; t <= 600; t += 100) c.sample(70, 0, t);
    expect(c.calibrate(600)).toBe(true);
    expect(c.sample(70, 0, 700)).toBe("upright");
    expect(c.sample(10, 0, 800)).toBe("ceiling");
    expect(c.sample(120, 0, 900)).toBe("floor");
  });
  it("rejects stale, moving and flat-phone calibration", () => {
    const c = createTiltCalibration();
    for (let t = 0; t <= 600; t += 100) c.sample(t % 200 ? 50 : 90, 0, t);
    expect(c.calibrate(600)).toBe(false);
    for (let t = 1000; t <= 1700; t += 100) c.sample(0, 0, t);
    expect(c.calibrate(1700)).toBe(false);
    expect(c.calibrate(3000)).toBe(false);
  });
  it("uses hysteresis at the trigger and clears invalid input", () => {
    const c = createTiltCalibration();
    expect(c.sample(140, 0, 0)).toBe("floor");
    expect(c.sample(122, 0, 10)).toBe("floor");
    expect(c.sample(110, 0, 20)).toBe("moving");
    expect(c.sample(null, null, 30)).toBeNull();
  });
});
