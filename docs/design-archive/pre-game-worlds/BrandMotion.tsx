import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "motion/react";
import { ArrowClockwise } from "@phosphor-icons/react";
import { Identity } from "./Identity";
export default function BrandMotion() {
  const container = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const [replay, setReplay] = useState(0);
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
  }, [reduce, replay]);
  return (
    <div className="brand-motion">
      <div className="motion-stage" aria-hidden="true">
        <Identity seed="🐸" />
        <div ref={container} />
      </div>
      {!reduce && (
        <button
          className="replay-motion"
          aria-label="Replay the card animation"
          onClick={() => setReplay((v) => v + 1)}
        >
          <ArrowClockwise size={16} />
          Replay animation
        </button>
      )}
    </div>
  );
}
