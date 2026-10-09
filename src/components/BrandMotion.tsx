import { useEffect, useRef } from "react";
import { useReducedMotion } from "motion/react";
import { Identity } from "./Identity";
export default function BrandMotion() {
  const container = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  useEffect(() => {
    if (reduce) return;
    let disposed = false;
    let player: { destroy: () => void } | undefined;
    void Promise.all([
      import("lottie-web/build/player/lottie_light"),
      fetch(
        `${import.meta.env.BASE_URL}projects/hudl/scene-2/lottie.json`,
      ).then((r) => r.json()),
    ])
      .then(([{ default: lottie }, animationData]) => {
        if (!disposed && container.current)
          player = lottie.loadAnimation({
            container: container.current,
            renderer: "svg",
            loop: false,
            autoplay: true,
            animationData,
          });
      })
      .catch(() => {});
    return () => {
      disposed = true;
      player?.destroy();
    };
  }, [reduce]);
  return (
    <div className="brand-motion">
      <div className="motion-stage" aria-hidden="true">
        <Identity seed="🐸" />
        <div ref={container} />
      </div>
    </div>
  );
}
