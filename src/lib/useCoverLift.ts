import { useCallback, useEffect, useRef } from "react";
import {
  animate,
  useMotionValue,
  useReducedMotion,
  useTransform,
} from "motion/react";
/** Public artwork only. Private content must still unmount synchronously. */
export function useCoverLift() {
  const progress = useMotionValue(0),
    reduced = useReducedMotion();
  const quiet = useRef(reduced);
  quiet.current = reduced;
  const animation = useRef<{ stop: () => void } | null>(null);
  const move = useCallback(
    (target: number, instant = false) => {
      animation.current?.stop();
      if (quiet.current || instant) progress.set(target);
      else
        animation.current = animate(progress, target, {
          duration: target === 1 ? 0.26 : 0.22,
          ease: [0.23, 1, 0.32, 1],
        });
    },
    [progress],
  );
  const pull = useCallback(
    (distance: number) => {
      animation.current?.stop();
      progress.set(
        quiet.current ? 0 : Math.min(0.8, Math.max(0, distance / 130)),
      );
    },
    [progress],
  );
  useEffect(() => () => animation.current?.stop(), []);
  const transform = useTransform(
    progress,
    (p) => `translateY(${-p * 105}%) rotateX(${p * 5}deg)`,
  );
  const opacity = useTransform(progress, [0, 0.85, 1], [1, 1, 0]);
  return { style: { transform, opacity }, pull, move, reduced };
}
