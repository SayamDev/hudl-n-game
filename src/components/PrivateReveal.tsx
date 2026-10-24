import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { ArrowUp, EyeSlash } from "@phosphor-icons/react";
import { useGame } from "../store/useGame";
import { hintFor } from "../lib/hints";
import { IllustratedPortrait } from "./IllustratedCast";
import { Identity } from "./Identity";
import { Screen } from "./ui";
import type { Session } from "../lib/types";

/** A public, role-independent cover. Private text is never animated on exit. */
export function PrivateReveal({
  session,
  onDone,
}: {
  session: Session;
  onDone: () => void;
}) {
  const players = useGame((s) => s.players),
    patch = useGame((s) => s.patch);
  const player = players[session.peekIndex],
    next = players[session.peekIndex + 1];
  const [open, setOpen] = useState(false),
    [seen, setSeen] = useState(false),
    [ready, setReady] = useState(false);
  const reduce = useReducedMotion();
  useEffect(() => {
    const id = setTimeout(() => setReady(true), 900);
    return () => clearTimeout(id);
  }, []);
  useEffect(() => {
    const hide = () => setOpen(false);
    window.addEventListener("blur", hide);
    document.addEventListener("visibilitychange", hide);
    window.addEventListener("pointercancel", hide);
    return () => {
      window.removeEventListener("blur", hide);
      document.removeEventListener("visibilitychange", hide);
      window.removeEventListener("pointercancel", hide);
    };
  }, []);
  useEffect(() => {
    if (session.paused) setOpen(false);
  }, [session.paused]);
  if (!player) return null;
  const reveal = () => {
    if (!ready || session.paused) return;
    setOpen(true);
    setSeen(true);
  };
  const pass = () => {
    setOpen(false);
    if (next) patch({ peekIndex: session.peekIndex + 1 });
    else onDone();
  };
  const visible = open && !session.paused;
  const imposter = session.roles[player.id] === "Imposter";
  const hint =
    session.options.hintStyle === "category"
      ? session.category
      : hintFor(session.secret) || session.category;
  return (
    <Screen
      className="private-stage"
      title={
        <>
          <span className="private-turn-label">Your turn</span>
          <span className="private-player-name">{player.name}</span>
        </>
      }
      subtitle={`Secret ${session.peekIndex + 1} of ${players.length} · Everyone else, look away.`}
    >
      <div className="private-portrait" aria-hidden="true">
        <IllustratedPortrait seed={player.avatar} />
        <div className="portrait-shade" />
      </div>
      <div className="private-badge" aria-hidden="true">
        <Identity seed={player.avatar} />
      </div>
      <section
        className={`private-window ${visible ? "is-open" : ""}`}
        aria-label="Private role card"
      >
        {visible ? (
          <motion.div
            className="private-secret"
            aria-live="off"
            onPan={(_, info) => {
              if (info.offset.y > 48) setOpen(false);
            }}
          >
            <span className="private-turn-label">
              {imposter ? "Your role" : "Your secret word"}
            </span>
            <h2>{imposter ? "IMPOSTER" : session.secret}</h2>
            {imposter && session.options.chaos ? (
              <p>
                Your decoy word: <strong>{session.decoy}</strong>
              </p>
            ) : imposter && session.options.hint ? (
              <div className="private-hint">
                <span>Your hint word</span>
                <strong>{hint}</strong>
              </div>
            ) : (
              <p>
                {imposter
                  ? "Listen. Blend in. Keep your cover."
                  : "Give a clue. Keep the word to yourself."}
              </p>
            )}
            <button className="private-action" onClick={() => setOpen(false)}>
              <EyeSlash size={21} />
              Hide my secret
            </button>
            <small className="swipe-hide-cue">Swipe down to hide</small>
          </motion.div>
        ) : (
          <motion.div
            className="private-swipe"
            drag={ready ? "y" : false}
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={0.18}
            dragMomentum={false}
            onDragEnd={(_, info) => {
              if (info.offset.y < -65) reveal();
            }}
            animate={{ y: 0 }}
            transition={{ duration: reduce ? 0 : 0.22 }}
          >
            <ArrowUp size={25} />
            <h2>{seen ? "Secret hidden." : "Only you should see this."}</h2>
            <p>Swipe up to reveal your secret.</p>
            <button
              className="private-action"
              disabled={!ready}
              onClick={reveal}
            >
              {ready ? "Reveal my secret" : "Ready in a moment…"}
            </button>
          </motion.div>
        )}
      </section>
      <div className="private-pass-zone">
        <p>
          {next ? (
            <>
              Up next: <strong>{next.name}</strong>
            </>
          ) : (
            "Everyone has checked? Start the clues together."
          )}
        </p>
        <button
          className="private-action private-pass"
          disabled={!seen}
          onClick={pass}
        >
          {next ? `Hide & pass to ${next.name}` : "Hide & start clues"}
        </button>
        <small>Hide before passing. Escape pauses and hides.</small>
      </div>
    </Screen>
  );
}
