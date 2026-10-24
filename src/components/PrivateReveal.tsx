import { useEffect, useState, useRef } from "react";
import { motion, useReducedMotion } from "motion/react";
import { ArrowUp, Fingerprint } from "@phosphor-icons/react";
import { useGame } from "../store/useGame";
import { hintFor } from "../lib/hints";
import { IllustratedPortrait } from "./IllustratedCast";
import { CardFace } from "./CardFace";
import { Identity } from "./Identity";
import { Screen } from "./ui";
import type { Session } from "../lib/types";
import { useCoverLift } from "../lib/useCoverLift";

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
    [preparing, setPreparing] = useState(false),
    [seen, setSeen] = useState(false),
    [ready] = useState(true);
  const reduce = useReducedMotion();
  const active = useRef(false);
  const lift = useCoverLift();
  const pending = useRef<number | undefined>(undefined);
  const instantRead = useRef(false);
  const origin = useRef<{ id: number; y: number; revealedAt?: number } | null>(
    null,
  );
  const hide = () => {
    setPreparing(false);
    active.current = false;
    origin.current = null;
    clearTimeout(pending.current);
    pending.current = undefined;
    lift.move(0);
    setOpen(false);
  };
  useEffect(() => {
    const hide = () => {
      setPreparing(false);
      active.current = false;
      origin.current = null;
      clearTimeout(pending.current);
      pending.current = undefined;
      lift.move(0);
      setOpen(false);
    };
    window.addEventListener("blur", hide);
    document.addEventListener("visibilitychange", hide);
    window.addEventListener("pointercancel", hide);
    window.addEventListener("pointerup", hide);
    window.addEventListener("keyup", hide);
    return () => {
      clearTimeout(pending.current);
      window.removeEventListener("blur", hide);
      document.removeEventListener("visibilitychange", hide);
      window.removeEventListener("pointercancel", hide);
      window.removeEventListener("pointerup", hide);
      window.removeEventListener("keyup", hide);
    };
  }, []);
  useEffect(() => {
    if (session.paused) hide();
  }, [session.paused]);
  if (!player) return null;
  const reveal = (instant = false) => {
    if (
      !ready ||
      session.paused ||
      !active.current ||
      open ||
      pending.current !== undefined
    )
      return;
    instantRead.current = instant;
    lift.move(1, instant);
    const show = () => {
      setPreparing(false);
      pending.current = undefined;
      if (!active.current) return;
      setOpen(true);
      setSeen(true);
    };
    if (instant || lift.reduced) show();
    else {
      setPreparing(true);
      pending.current = window.setTimeout(show, 220);
    }
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
      className={`private-stage illustrated-private ${visible ? "is-reading" : ""}`}
      title={
        <>
          <span className="private-turn-label">Your turn</span>
          <span className="private-player-name">{player.name}</span>
        </>
      }
      subtitle={`Card ${session.peekIndex + 1} of ${players.length} · Everyone else, look away.`}
    >
      <div className="private-badge" aria-hidden="true">
        <Identity seed={player.avatar} />
      </div>
      <div className={`private-window ${visible ? "is-open" : ""}`}>
        <button
          className="private-gesture"
          type="button"
          aria-label="Read private card"
          aria-description="Swipe up and keep holding, or hold Space or Enter. Release to hide."
          disabled={!ready || session.paused}
          onPointerDown={(event) => {
            if (
              !ready ||
              session.paused ||
              (event.pointerType === "mouse" && event.button !== 0)
            )
              return;
            event.preventDefault();
            active.current = true;
            origin.current = { id: event.pointerId, y: event.clientY };
            event.currentTarget.focus({ preventScroll: true });
            event.currentTarget.setPointerCapture(event.pointerId);
          }}
          onPointerMove={(event) => {
            const start = origin.current;
            if (!active.current || !start || start.id !== event.pointerId)
              return;
            if (start.revealedAt !== undefined)
              start.revealedAt = Math.min(start.revealedAt, event.clientY);
            if (
              start.revealedAt !== undefined &&
              event.clientY - start.revealedAt > 48
            )
              hide();
            else if (start.y - event.clientY > 40) {
              start.revealedAt ??= event.clientY;
              reveal();
            } else if (!open && pending.current === undefined)
              lift.pull(start.y - event.clientY);
          }}
          onPointerUp={hide}
          onPointerCancel={hide}
          onLostPointerCapture={hide}
          onBlur={hide}
          onContextMenu={(event) => event.preventDefault()}
          onKeyDown={(event) => {
            if (event.key === " " || event.key === "Enter") {
              event.preventDefault();
              if (!event.repeat) {
                active.current = true;
                reveal(true);
              }
            }
          }}
          onKeyUp={(event) => {
            if (event.key === " " || event.key === "Enter") {
              event.preventDefault();
              hide();
              lift.move(0, true);
            }
          }}
          onClick={(event) => event.preventDefault()}
        />
        <CardFace world="imposter" />
        {preparing && !session.paused && (
          <div className="card-wait" aria-hidden="true">
            <Fingerprint size={38} weight="light" />
            <span>Hold steady.</span>
          </div>
        )}
        <motion.div
          className={`private-reveal-cover ${visible ? "is-lifted" : ""}`}
          style={lift.style}
          aria-hidden={visible}
          inert={visible}
        >
          <div className="private-portrait" aria-hidden="true">
            <IllustratedPortrait seed={player.avatar} />
            <div className="portrait-shade" />
          </div>
          <motion.div
            className="private-swipe"
            animate={{ y: 0 }}
            transition={{ duration: reduce ? 0 : 0.22 }}
          >
            <div className="private-seal" aria-hidden="true">
              <Fingerprint size={30} weight="light" />
              <span>FOR YOUR EYES ONLY</span>
            </div>
            <h2>
              {!ready
                ? "Passing the phone…"
                : seen
                  ? "Back under cover."
                  : "Keep your cover."}
            </h2>
            <p>
              <ArrowUp size={17} aria-hidden="true" /> Swipe up & hold. Release
              to hide.
            </p>
          </motion.div>
        </motion.div>
        {visible && (
          <div
            className={`private-secret ${instantRead.current ? "is-instant" : ""}`}
            aria-live="off"
          >
            <div className="card-copy">
              <span className="private-turn-label">
                {imposter ? "Your role" : "Your secret word"}
              </span>
              <h2
                className={`private-word ${imposter ? "private-role" : session.secret.length > 24 ? "is-long" : ""}`}
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
                  <span>A hint to help you blend in</span>
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
            </div>
          </div>
        )}
      </div>
      <div className="private-pass-zone">
        <button
          className="private-action private-pass"
          disabled={!seen || visible}
          onClick={pass}
        >
          {next ? `Pass to ${next.name}` : "Start the clues"}
        </button>
        <small>
          Hold Space / Enter on the artwork to read · Release to hide
        </small>
      </div>
    </Screen>
  );
}
