import { useEffect, useRef } from "react";

/** Original local card-seal animation; game state never depends on its loading. */
export function RevealSeal({ playing }: { playing: boolean }) {
  const host = useRef<HTMLDivElement>(null);
  const active = useRef(playing);
  active.current = playing;
  const animation = useRef<
    | {
        destroy(): void;
        goToAndPlay(frame: number, isFrame: boolean): void;
        goToAndStop(frame: number, isFrame: boolean): void;
      }
    | undefined
  >(undefined);
  useEffect(() => {
    if (playing) animation.current?.goToAndPlay(0, true);
    else animation.current?.goToAndStop(0, true);
  }, [playing]);
  useEffect(() => {
    let disposed = false;
    void Promise.all([
      import("lottie-web/build/player/lottie_light"),
      fetch(
        `${import.meta.env.BASE_URL}projects/hudl/scene-3/lottie.json`,
      ).then((r) => {
        if (!r.ok) throw Error("Animation unavailable");
        return r.json();
      }),
    ])
      .then(([{ default: lottie }, animationData]) => {
        if (!disposed && host.current) {
          animation.current = lottie.loadAnimation({
            container: host.current,
            renderer: "svg",
            loop: false,
            autoplay: active.current,
            animationData,
          });
        }
      })
      .catch(() => {
        /* The static seal and live copy remain available offline. */
      });
    return () => {
      disposed = true;
      animation.current?.destroy();
      animation.current = undefined;
    };
  }, []);
  return (
    <div className="reveal-seal" aria-hidden="true">
      <svg className="seal-fallback" viewBox="0 0 200 200">
        <path
          d="m100 18 68 82-68 82-68-82Z"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        />
        <path
          d="m67 90 22 5-6 18-20-7m70-16-22 5 6 18 20-7"
          fill="currentColor"
        />
      </svg>
      <div ref={host} />
    </div>
  );
}
