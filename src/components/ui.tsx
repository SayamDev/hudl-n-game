import { Identity } from "./Identity";
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
import { feedback, speak } from "../lib/feedback";
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
}: {
  children: ReactNode;
  title?: ReactNode;
  subtitle?: string;
}) {
  const reduce = useReducedMotion();
  return (
    <motion.section
      className="stage"
      initial={reduce ? false : { opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 360, damping: 30 }}
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
}: {
  session: Session;
  onDone: () => void;
}) {
  const players = useGame((s) => s.players),
    patch = useGame((s) => s.patch);
  const [holding, setHolding] = useState(false),
    [seen, setSeen] = useState(false),
    [guard, setGuard] = useState(3);
  useEffect(() => {
    if (session.paused) setHolding(false);
  }, [session.paused]);
  const player = players[session.peekIndex];
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
  const role = session.roles[player.id];
  const secret =
    session.game === "mafia"
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
      title={
        <>
          <span className="handoff-label">Pass to </span>
          <span className="handoff-name">{player.name}</span>
        </>
      }
      subtitle={`Player ${session.peekIndex + 1} of ${players.length}. Everyone else, look away.`}
    >
      <div className="peek-face">
        <Avatar player={player} big />
        <div
          className={`secret-card stable-secret ${holding ? "revealed" : ""} ${holding && isImposter ? "imposter-reveal" : ""}`}
        >
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
                      {session.game === "mafia"
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
                      <span>Hint: </span>
                      <strong>{session.category}</strong>
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
                <LockKey size={42} weight="duotone" />
                <h2>
                  {guard ? `Ready in ${guard}` : "Nobody’s looking… right?"}
                </h2>
                <p>Your secret stays hidden until you hold.</p>
              </>
            )}
          </div>
        </div>
      </div>
      <button
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
        {holding ? "Release to hide" : "Hold to peek"}
      </button>
      <Button
        disabled={!seen || holding}
        onClick={() => {
          hide();
          if (session.peekIndex === players.length - 1) onDone();
          else {
            setGuard(3);
            setSeen(false);
            patch({ peekIndex: session.peekIndex + 1 });
          }
        }}
      >
        {session.peekIndex === players.length - 1
          ? "Everyone’s ready"
          : "Hide & pass"}
        <ArrowRight size={20} />
      </Button>
      <p className="helper">Keyboard: hold Space or Enter. Release to hide.</p>
    </Screen>
  );
}
export function Timer({
  session,
  onEnd,
}: {
  session: Session;
  onEnd?: () => void;
}) {
  const patch = useGame((s) => s.patch);
  const callback = useRef(onEnd);
  callback.current = onEnd;
  useEffect(() => {
    if (!session.timerRunning || session.paused) return;
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
      if (remaining <= 10 && remaining > 0) feedback("tick");
      if (remaining === 0) {
        feedback("wrong");
        callback.current?.();
      }
    }, 200);
    return () => clearInterval(id);
  }, [session.timerRunning, session.paused, patch]);
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
      if ("speechSynthesis" in window) window.speechSynthesis.cancel();
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
