/** The vertical component of the screen's outward normal. +1 faces sky, -1 floor.
 * Using both axes keeps this independent of portrait/landscape screen rotation.
 */
export function screenFacing(beta: number | null, gamma: number | null) {
  if (
    beta === null ||
    gamma === null ||
    !Number.isFinite(beta) ||
    !Number.isFinite(gamma)
  )
    return null;
  return Math.cos((beta * Math.PI) / 180) * Math.cos((gamma * Math.PI) / 180);
}
export type TiltPose = "upright" | "floor" | "ceiling" | "moving";
/** Compensate only for rotation the browser has not already applied. */
export function wordRotation(
  beta: number | null,
  gamma: number | null,
  screenAngle: number,
  previous = 0,
) {
  const normal = screenFacing(beta, gamma);
  if (normal === null || Math.abs(normal) > 0.55) return previous;
  const b = (beta! * Math.PI) / 180,
    g = (gamma! * Math.PI) / 180;
  const roll =
    (Math.atan2(Math.sin(g) * Math.cos(b), Math.sin(b)) * 180) / Math.PI;
  const nearest = Math.round(roll / 90) * 90;
  if (Math.abs(roll - nearest) > 30) return previous;
  const angle = (((screenAngle - nearest) % 360) + 360) % 360;
  return angle > 180 ? angle - 360 : angle;
}
export function tiltPose(
  beta: number | null,
  gamma: number | null,
): TiltPose | null {
  const normal = screenFacing(beta, gamma);
  if (normal === null) return null;
  return Math.abs(normal) < 0.3
    ? "upright"
    : normal < -0.65
      ? "floor"
      : normal > 0.65
        ? "ceiling"
        : "moving";
}
/** Require a deliberate upright reset, then a stable tilt. One action per gesture. */
export function createTiltGesture() {
  let armed = false;
  let neutralSince: number | null = null;
  let target: TiltPose | null = null;
  let targetSince = 0;
  return {
    reset() {
      armed = false;
      neutralSince = null;
      target = null;
    },
    sample(pose: TiltPose | null, now: number): "correct" | "skip" | null {
      if (pose === "upright") {
        neutralSince ??= now;
        if (now - neutralSince >= 250) armed = true;
        target = null;
        return null;
      }
      neutralSince = null;
      if (!armed || (pose !== "floor" && pose !== "ceiling")) {
        target = null;
        return null;
      }
      if (target !== pose) {
        target = pose;
        targetSince = now;
        return null;
      }
      if (now - targetSince < 150) return null;
      armed = false;
      target = null;
      return pose === "floor" ? "correct" : "skip";
    },
  };
}
