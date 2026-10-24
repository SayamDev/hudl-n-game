import { useEffect, useState, useRef } from "react";
import { motion, useReducedMotion } from "motion/react";
import { ArrowUp, Fingerprint } from "@phosphor-icons/react";
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
  const active = useRef(false);
  useEffect(() => {
    const id = setTimeout(() => setReady(true), 900);
    return () => clearTimeout(id);
  }, []);
  useEffect(() => {
    const hide = () => {
      active.current = false;
      setOpen(false);
    };
    window.addEventListener("blur", hide);
    document.addEventListener("visibilitychange", hide);
    window.addEventListener("pointercancel", hide);
    window.addEventListener("pointerup", hide);
    window.addEventListener("keyup", hide);
    return () => {
      window.removeEventListener("blur", hide);
      document.removeEventListener("visibilitychange", hide);
      window.removeEventListener("pointercancel", hide);
      window.removeEventListener("pointerup", hide);
      window.removeEventListener("keyup", hide);
    };
  }, []);
  useEffect(() => {
    if (session.paused) setOpen(false);
  }, [session.paused]);
  if (!player) return null;
  const reveal = () => {
    if (!ready || session.paused || !active.current) return;
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
      className={`private-stage ${visible ? "is-reading" : ""}`}
      title={
        <>
          <span className="private-turn-label">Your turn</span>
          <span className="private-player-name">{player.name}</span>
        </>
      }
      subtitle={`Card ${session.peekIndex + 1} of ${players.length} · Everyone else, look away.`}
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
        <div
          className={`private-reveal-cover ${visible ? "is-lifted" : ""}`}
          aria-hidden={visible}
          inert={visible}
          onPointerDownCapture={() => {
            active.current = true;
          }}
        >
          <motion.div
            className="private-swipe"
            drag={ready ? "y" : false}
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={0.18}
            dragMomentum={false}
            onDrag={(_, info) => {
              if (info.offset.y < -65) reveal();
            }}
            animate={{ y: 0 }}
            transition={{ duration: reduce ? 0 : 0.22 }}
          >
            <div className="private-seal" aria-hidden="true">
              <Fingerprint size={30} weight="light" />
              <span>FOR YOUR EYES ONLY</span>
            </div>
            <h2>{seen ? "Back under cover." : "Keep your cover."}</h2>
            <p>
              <ArrowUp size={17} aria-hidden="true" /> Swipe up & hold. Release
              to hide.
            </p>
            <button
              className="private-action"
              disabled={!ready}
              tabIndex={visible ? -1 : 0}
              onPointerDown={(event) => {
                event.preventDefault();
                active.current = true;
                reveal();
              }}
              onKeyDown={(event) => {
                if (event.code === "Space" || event.code === "Enter") {
                  event.preventDefault();
                  if (!event.repeat) {
                    active.current = true;
                    reveal();
                  }
                }
              }}
            >
              {ready ? "Hold to reveal" : "Ready in a moment…"}
            </button>
          </motion.div>
        </div>
        {visible && (
          <motion.div
            className="private-secret"
            aria-live="off"
            onPan={(_, info) => {
              if (info.offset.y > 48) setOpen(false);
            }}
          >
            <span className="private-turn-label">
              {imposter ? "Keep this to yourself" : "Your secret word"}
            </span>
            <h2
              className={`private-word ${!imposter && session.secret.length > 24 ? "is-long" : ""}`}
            >
              {imposter ? "IMPOSTER" : session.secret}
            </h2>
            {imposter && session.options.chaos ? (
              <div
                className={`private-hint ${session.decoy.length > 18 ? "is-long" : ""}`}
              >
                <span>Your decoy word</span>
                <strong>{session.decoy}</strong>
              </div>
            ) : imposter && session.options.hint ? (
              <div
                className={`private-hint ${hint.length > 18 ? "is-long" : ""}`}
              >
                <span>Your hint · blend in with this</span>
                <strong>{hint}</strong>
              </div>
            ) : !imposter && session.secret.length > 24 ? null : (
              <p>
                {imposter
                  ? "Listen. Blend in. Keep your cover."
                  : "Clue them in. Don’t say the word."}
              </p>
            )}
            <small className="swipe-hide-cue">Release to hide</small>
          </motion.div>
        )}
      </section>
      <div className="private-pass-zone">
        <p>
          {next ? (
            <>
              Next phone handoff: <strong>{next.name}</strong>
            </>
          ) : (
            "Last card. The clues are up next."
          )}
        </p>
        <button
          className="private-action private-pass"
          disabled={!seen}
          onClick={pass}
        >
          {next ? `Hide & pass to ${next.name}` : "Hide & start clues"}
        </button>
        <small>Hold Space / Enter to read · Esc to pause</small>
      </div>
    </Screen>
  );
}
