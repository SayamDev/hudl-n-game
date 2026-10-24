import { hintFor } from "../lib/hints";
import { Identity } from "./Identity";
import { SecretSleeve } from "./SecretSleeve";
import { useEffect, useRef, useState } from "react";
import type { ReactNode, ButtonHTMLAttributes } from "react";
import { motion, useReducedMotion } from "motion/react";
import {
  HandPalm,
  LockKey,
  ArrowRight,
  Pause,
  Play,
  SpeakerHigh,
} from "@phosphor-icons/react";
import { useGame } from "../store/useGame";
import {
  feedback,
  speak,
  countdownSound,
  stopCountdown,
  silence,
} from "../lib/feedback";
import type { Player, Session } from "../lib/types";
export function Button({
  children,
  className = "",
  onClick,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      className={`button ${className}`}
      onClick={(e) => {
        feedback();
        onClick?.(e);
      }}
    >
      {children}
    </button>
  );
}
export function Screen({
  children,
  title,
  subtitle,
  className = "",
}: {
  children: ReactNode;
  title?: ReactNode;
  subtitle?: string;
  className?: string;
}) {
  const reduce = useReducedMotion();
  const authored = useGame(
    (s) => s.preferences.deckStyle !== false && s.preferences.design === "club",
  );
  return (
    <motion.section
      className={`stage ${className}`}
      initial={
        reduce || authored
          ? false
          : { opacity: 1, transform: "translateY(8px)" }
      }
      animate={{ opacity: 1, transform: "translateY(0px)" }}
      transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
    >
      {title && <h1 tabIndex={-1}>{title}</h1>}
      {subtitle && <p className="lede">{subtitle}</p>}
      {children}
    </motion.section>
  );
}
export function Avatar({
  player,
  big = false,
}: {
  player: Player;
  big?: boolean;
}) {
  const design = useGame((s) => s.preferences.design);
  if (design !== "classic" && design !== "club-original")
    return (
      <span className={`avatar identity-avatar ${big ? "big" : ""}`}>
        <Identity seed={player.avatar} large={big} />
      </span>
    );
  return (
    <span
      className={`avatar ${big ? "big" : ""}`}
      style={{ background: player.color }}
      aria-hidden="true"
    >
      {player.avatar}
    </span>
  );
}
export function Mascot({
  mood = "happy",
}: {
  mood?: "happy" | "secret" | "win";
}) {
  return (
    <svg
      className={`mascot ${mood}`}
      viewBox="0 0 180 180"
      role="img"
      aria-label={`Hudl looks ${mood}`}
    >
      <path
        d="M48 142Q20 135 29 106L39 53Q42 28 65 31L115 25Q143 23 149 50L160 109Q166 140 139 149L66 157Q51 159 48 142Z"
        fill="#FFD60A"
        stroke="#1B1033"
        strokeWidth="5"
      />
      <path
        d="M41 100Q17 89 13 109M153 96Q172 81 171 105M64 153L54 167M129 151L138 164"
        fill="none"
        stroke="#1B1033"
        strokeWidth="7"
        strokeLinecap="round"
      />
      <ellipse cx="74" cy="78" rx="15" ry="22" fill="#fffdf8" />
      <ellipse cx="118" cy="75" rx="15" ry="22" fill="#fffdf8" />
      <ellipse cx="79" cy="82" rx="6" ry="10" fill="#1B1033" />
      <ellipse cx="122" cy="79" rx="6" ry="10" fill="#1B1033" />
      {mood === "secret" ? (
        <path
          d="M80 119L113 116"
          stroke="#1B1033"
          strokeWidth="5"
          strokeLinecap="round"
        />
      ) : (
        <path d="M77 112Q100 146 124 108Q103 116 77 112" fill="#1B1033" />
      )}
      <ellipse cx="53" cy="108" rx="10" ry="6" fill="#FF3D8B" />
      <ellipse cx="140" cy="104" rx="10" ry="6" fill="#FF3D8B" />
    </svg>
  );
}
export function Toggle({
  label,
  checked,
  onChange,
  description,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  description?: string;
}) {
  return (
    <label className="toggle-row">
      <span>
        <strong>{label}</strong>
        {description && <small>{description}</small>}
      </span>
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => {
          feedback();
          onChange(e.target.checked);
        }}
      />
      <span className="switch" aria-hidden="true" />
    </label>
  );
}
export function Peek({
  session,
  onDone,
  actor,
}: {
  session: Session;
  onDone: () => void;
  actor?: Player;
}) {
  const players = useGame((s) => s.players),
    patch = useGame((s) => s.patch);
  const [holding, setHolding] = useState(false),
    [seen, setSeen] = useState(false),
    [guard, setGuard] = useState(3);
  useEffect(() => {
    if (session.paused) setHolding(false);
  }, [session.paused]);
  const player = actor || players[session.peekIndex];
  const active = useRef(false);
  useEffect(() => {
    setHolding(false);
    setSeen(false);
    setGuard(3);
    const id = setInterval(() => setGuard((n) => Math.max(0, n - 1)), 1000);
    return () => clearInterval(id);
  }, [session.peekIndex]);
  useEffect(() => {
    const hide = () => {
      active.current = false;
      setHolding(false);
    };
    window.addEventListener("blur", hide);
    document.addEventListener("visibilitychange", hide);
    window.addEventListener("pointerup", hide);
    window.addEventListener("pointercancel", hide);
    return () => {
      window.removeEventListener("blur", hide);
      document.removeEventListener("visibilitychange", hide);
      window.removeEventListener("pointerup", hide);
      window.removeEventListener("pointercancel", hide);
    };
  }, []);
  if (!player) return null;
  const refined =
    useGame.getState().preferences.deckStyle !== false &&
    !["classic", "club-original"].includes(
      useGame.getState().preferences.design,
    );
  const role = session.roles[player.id];
  const secret = actor
    ? session.deck[session.cardIndex % session.deck.length]
    : session.game === "mafia"
      ? role
      : session.game === "spy"
        ? role === "Spy"
          ? "You’re the spy!"
          : session.secret
        : role === "Imposter"
          ? session.options.chaos
            ? session.decoy
            : "You’re the imposter!"
          : session.secret;
  const isImposter = session.game === "imposter" && role === "Imposter";
  const reveal = () => {
    if (guard || session.paused) return;
    active.current = true;
    setHolding(true);
    setSeen(true);
    feedback();
  };
  const hide = () => {
    active.current = false;
    setHolding(false);
  };
  return (
    <Screen
      className={`peek-stage ${refined ? "branded-peek" : ""} ${holding ? "is-peeking" : ""} ${seen ? "has-peeked" : ""}`}
      title={
        <>
          <span className="handoff-label">Pass to </span>
          <span className="handoff-name">{player.name}</span>
        </>
      }
      subtitle={
        actor
          ? "Actor only. Memorise your prompt, then hide it before acting."
          : `Player ${session.peekIndex + 1} of ${players.length}. Everyone else, look away.`
      }
    >
      <div className="peek-identity" aria-hidden="true">
        <Avatar player={player} big />
        <span className="identity-signature">
          {actor ? "THE ACTOR" : "YOUR ALIBI"}
        </span>
      </div>
      <div className="peek-face">
        {!refined && <Avatar player={player} big />}
        <div
          className={`secret-card stable-secret ${holding ? "revealed" : ""} ${holding && isImposter ? "imposter-reveal" : ""}`}
        >
          {refined && (
            <div className="sleeve-motion" aria-hidden="true">
              <SecretSleeve ready={guard === 0} seen={seen} />
            </div>
          )}
          <div className="secret-content" aria-live="off">
            {holding ? (
              <>
                {isImposter ? (
                  <>
                    <h2 className="imposter-role">IMPOSTER</h2>
                    <p className="role-instruction">
                      You are the imposter. Blend in. Don’t get caught.
                    </p>
                    {session.options.chaos && (
                      <p className="decoy-word">
                        Your decoy word: <strong>{session.decoy}</strong>
                      </p>
                    )}
                  </>
                ) : (
                  <>
                    <span className="secret-caption">
                      {actor
                        ? "YOUR PROMPT"
                        : session.game === "mafia"
                          ? "YOUR ROLE"
                          : session.game === "spy"
                            ? "YOUR LOCATION"
                            : "YOUR SECRET"}
                    </span>
                    <h2
                      className={`secret-word ${secret.length > 16 ? "secret-word-long" : ""}`}
                    >
                      {secret}
                    </h2>
                  </>
                )}
                <p
                  className={
                    isImposter && !session.options.chaos && session.options.hint
                      ? "imposter-hint"
                      : "secret-detail"
                  }
                >
                  {session.game === "spy" && role !== "Spy" ? (
                    `You are the ${role.toLowerCase()}.`
                  ) : session.game === "imposter" &&
                    role === "Imposter" &&
                    !session.options.chaos &&
                    session.options.hint ? (
                    <>
                      <span>
                        Hint:{" "}
                        {session.options.hintStyle === "category" ||
                        !hintFor(session.secret)
                          ? "category"
                          : "related word"}
                      </span>
                      <strong>
                        {session.options.hintStyle === "category"
                          ? session.category
                          : hintFor(session.secret) || session.category}
                      </strong>
                      {session.options.hintStyle !== "category" &&
                        hintFor(session.secret) && (
                          <small>
                            {session.category} · Use this as a starting point,
                            not your only clue.
                          </small>
                        )}
                    </>
                  ) : session.game === "mafia" && role === "Mafia" ? (
                    `Your team: ${players
                      .filter((p) => session.roles[p.id] === "Mafia")
                      .map((p) => p.name)
                      .join(", ")}`
                  ) : (
                    "Keep it to yourself."
                  )}
                </p>
              </>
            ) : (
              <>
                {!refined && <LockKey size={42} weight="duotone" />}
                <h2>
                  {guard ? `Ready in ${guard}` : "Nobody’s looking… right?"}
                </h2>
                <p>Your secret stays hidden until you hold.</p>
              </>
            )}
          </div>
        </div>
      </div>
      <div className="peek-controls">
        <p className="peek-cue" aria-live="off">
          {holding
            ? "Lift your finger to hide your secret"
            : seen
              ? "Secret hidden. Ready to pass."
              : "Hold below. Lift your finger to hide."}
        </p>
        <button
          aria-label="Hold to peek"
          aria-describedby="peek-help"
          className="button primary hold-button"
          disabled={guard > 0}
          onPointerDown={(e) => {
            e.preventDefault();
            e.currentTarget.setPointerCapture(e.pointerId);
            reveal();
          }}
          onPointerUp={hide}
          onPointerCancel={hide}
          onLostPointerCapture={hide}
          onContextMenu={(e) => e.preventDefault()}
          onKeyDown={(e) => {
            if ((e.key === " " || e.key === "Enter") && !e.repeat) {
              e.preventDefault();
              reveal();
            }
          }}
          onKeyUp={(e) => {
            if (e.key === " " || e.key === "Enter") {
              e.preventDefault();
              hide();
            }
          }}
          onBlur={hide}
        >
          <HandPalm size={25} weight="bold" />
          Hold to peek
        </button>
        <Button
          disabled={!seen || holding}
          onClick={() => {
            hide();
            if (actor || session.peekIndex === players.length - 1) onDone();
            else {
              setGuard(3);
              setSeen(false);
              patch({ peekIndex: session.peekIndex + 1 });
            }
          }}
        >
          {actor
            ? "Hide & start acting"
            : session.peekIndex === players.length - 1
              ? "Everyone’s ready"
              : "Hide & pass"}
          <ArrowRight size={20} />
        </Button>
        <p className="helper" id="peek-help">
          Hold Space or Enter on the button. Release to hide.
        </p>
      </div>
    </Screen>
  );
}
export function Timer({
  session,
  onEnd,
  compact = false,
}: {
  session: Session;
  onEnd?: () => void;
  compact?: boolean;
}) {
  const patch = useGame((s) => s.patch);
  const preferences = useGame((s) => s.preferences);
  useEffect(() => {
    if (session.timerRunning && !session.paused && session.timerRemaining > 0)
      countdownSound(session.timerRemaining);
    const stop = () => stopCountdown();
    window.addEventListener("blur", stop);
    document.addEventListener("visibilitychange", stop);
    return () => {
      stopCountdown();
      window.removeEventListener("blur", stop);
      document.removeEventListener("visibilitychange", stop);
    };
  }, [
    session.timerRemaining,
    session.timerRunning,
    session.paused,
    preferences.sound,
    preferences.volume,
    preferences.countdown,
  ]);
  const callback = useRef(onEnd);
  callback.current = onEnd;
  useEffect(() => {
    if (
      session.options.seconds === 0 ||
      !session.timerRunning ||
      session.paused
    )
      return;
    let last = Date.now();
    const id = setInterval(() => {
      const state = useGame.getState().session;
      if (!state || state.paused || !state.timerRunning) return;
      const now = Date.now(),
        elapsed = Math.floor((now - last) / 1000);
      if (!elapsed) return;
      last += elapsed * 1000;
      const remaining = Math.max(0, state.timerRemaining - elapsed);
      patch({ timerRemaining: remaining, timerRunning: remaining > 0 });

      if (remaining === 0) {
        feedback("success");
        callback.current?.();
      }
    }, 200);
    return () => clearInterval(id);
  }, [session.timerRunning, session.paused, patch]);
  if (session.options.seconds === 0)
    return (
      <p className="untimed-label">
        {compact ? "No timer" : "No timer · Play at your pace"}
      </p>
    );
  return (
    <div className="timer">
      <span
        className={session.timerRemaining <= 10 ? "urgent" : ""}
        role="timer"
        aria-label={`${session.timerRemaining} seconds remaining`}
      >
        {Math.floor(session.timerRemaining / 60)}:
        {String(session.timerRemaining % 60).padStart(2, "0")}
      </span>
      <button
        className="icon-button"
        aria-label={session.timerRunning ? "Pause timer" : "Start timer"}
        disabled={session.timerRemaining === 0}
        onClick={() => patch({ timerRunning: !session.timerRunning })}
      >
        {session.timerRunning ? <Pause size={24} /> : <Play size={24} />}
      </button>
    </div>
  );
}
export function Narration({
  text,
  manual = false,
}: {
  text: string;
  manual?: boolean;
}) {
  useEffect(() => {
    if (!manual) speak(text);
    return () => {
      silence();
    };
  }, [text, manual]);
  return (
    <div className="narration">
      <p>{text}</p>
      <button
        className="icon-button"
        aria-label="Read instructions aloud"
        onClick={() => speak(text)}
      >
        <SpeakerHigh size={23} />
      </button>
    </div>
  );
}
