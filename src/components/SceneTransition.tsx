import { Suspense, useEffect, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { SceneLoader } from "./SceneLoader";
function LoadingSignal({ change }: { change: (pending: boolean) => void }) {
  useEffect(() => {
    change(true);
    return () => change(false);
  }, [change]);
  return null;
}
/** Skip flashes; once visible, give the deal a readable beat and a calm exit. */
export function SceneTransition({ children }: { children: ReactNode }) {
  const [pending, setPending] = useState(false);
  const [visible, setVisible] = useState(false);
  const [closing, setClosing] = useState(false);
  const shownAt = useRef(0);
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    let finish: ReturnType<typeof setTimeout>;
    if (pending) {
      setClosing(false);
      if (!visible)
        timer = setTimeout(() => {
          shownAt.current = performance.now();
          setVisible(true);
        }, 140);
    } else if (visible) {
      timer = setTimeout(
        () => {
          setClosing(true);
          const reduced = matchMedia(
            "(prefers-reduced-motion: reduce)",
          ).matches;
          finish = setTimeout(
            () => {
              setVisible(false);
              setClosing(false);
            },
            reduced ? 0 : 180,
          );
        },
        Math.max(0, 900 - (performance.now() - shownAt.current)),
      );
    }
    return () => {
      clearTimeout(timer);
      clearTimeout(finish);
    };
  }, [pending, visible]);
  return (
    <>
      <div
        className="scene-content"
        inert={visible}
        aria-hidden={visible || undefined}
      >
        <Suspense fallback={<LoadingSignal change={setPending} />}>
          {children}
        </Suspense>
      </div>
      {visible &&
        createPortal(
          <div className={`scene-transition ${closing ? "is-leaving" : ""}`}>
            <SceneLoader />
          </div>,
          document.body,
        )}
    </>
  );
}
