import { GameWorld } from "../components/GameWorld";
import { CardFace } from "../components/CardFace";
import { useEffect, useRef, useState } from "react";
import { useGame } from "../store/useGame";
import { feedback } from "../lib/feedback";
import { Avatar, Button, Screen, Timer, Peek } from "../components/ui";
import {
  Check,
  ArrowBendUpRight,
  DeviceMobile,
  ArrowDown,
  ArrowUp,
} from "@phosphor-icons/react";
import { createTiltGesture, tiltPose } from "../lib/tilt";
import type { TiltPose } from "../lib/tilt";
import type { GameProps } from "../lib/types";
export default function Charades({ session: s }: GameProps) {
  const { players, patch, finish, preferences } = useGame();
  const refined =
    preferences.deckStyle !== false &&
    !["classic", "club-original"].includes(preferences.design);
  const classic = s.options.charadesMode === "classic";
  const untimed = s.options.seconds === 0;
  const teamPlayers = players.filter((_, i) => i % 2 === s.team);
  const actor = teamPlayers[(s.actorIndex || 0) % teamPlayers.length];
  const [tilt, setTilt] = useState(false);
  const [sensor, setSensor] = useState<
    "off" | "requesting" | "listening" | "connected" | "unavailable"
  >("off");
  const [pose, setPose] = useState<TiltPose | null>(null);
  const [message, setMessage] = useState("");
  const [practice, setPractice] = useState("");
  const gesture = useRef(createTiltGesture());
  const latest = useRef(s);
  latest.current = s;
  const mark = (correct: boolean) => {
    const current = useGame.getState().session;
    if (
      !current ||
      current.game !== "charades" ||
      current.phase !== "acting" ||
      current.paused ||
      (current.options.seconds !== 0 && current.timerRemaining <= 0)
    )
      return;
    gesture.current.reset();
    feedback(correct ? "success" : "tap");
    patch({
      cardIndex: current.cardIndex + 1,
      correct: current.correct + (correct ? 1 : 0),
      skipped: current.skipped + (correct ? 0 : 1),
      ...(current.options.charadesMode === "classic"
        ? {
            phase: "actor-peek",
            timerRunning: false,
            actorIndex: (current.actorIndex || 0) + 1,
          }
        : {}),
    });
  };
  useEffect(() => {
    gesture.current.reset();
    setPractice("");
  }, [s.phase, s.paused]);
  useEffect(() => {
    if (!tilt || classic) return;
    let received = false;
    const timeout = setTimeout(() => {
      if (!received) {
        setTilt(false);
        setSensor("unavailable");
        setMessage(
          "No motion data received. Check your browser’s motion permission, or use buttons or the keyboard.",
        );
      }
    }, 5000);
    const reset = () => {
      gesture.current.reset();
      setPose(null);
    };
    const handler = (e: DeviceOrientationEvent) => {
      const current = latest.current;
      const next = tiltPose(e.beta, e.gamma);
      if (next === null) return;
      received = true;
      clearTimeout(timeout);
      setSensor("connected");
      if (
        document.hidden ||
        !document.hasFocus() ||
        current.paused ||
        !["ready", "acting"].includes(current.phase)
      ) {
        reset();
        return;
      }
      setPose(next);
      const action = gesture.current.sample(next, performance.now());
      if (!action) return;
      if (current.phase === "acting") mark(action === "correct");
      else {
        setPractice(
          action === "correct"
            ? "Correct gesture recognised!"
            : "Skip gesture recognised!",
        );
        feedback();
      }
    };
    window.addEventListener("deviceorientation", handler);
    window.addEventListener("blur", reset);
    document.addEventListener("visibilitychange", reset);
    return () => {
      clearTimeout(timeout);
      window.removeEventListener("deviceorientation", handler);
      window.removeEventListener("blur", reset);
      document.removeEventListener("visibilitychange", reset);
    };
  }, [tilt, classic]);
  useEffect(() => {
    if (s.phase !== "acting" || s.paused) return;
    const onKey = (e: KeyboardEvent) => {
      if (
        e.repeat ||
        e.ctrlKey ||
        e.altKey ||
        e.metaKey ||
        e.isComposing ||
        document.querySelector('[aria-modal="true"]')
      )
        return;
      const el = e.target as HTMLElement;
      if (el.closest('input, textarea, select, [contenteditable="true"]'))
        return;
      if (["ArrowRight", "ArrowLeft"].includes(e.key)) {
        e.preventDefault();
        mark(e.key === "ArrowRight");
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [s.phase, s.paused]);
  const end = () => {
    const current = useGame.getState().session!;
    const scores: [number, number] = [...current.teamScores];
    scores[current.team] = current.correct;
    patch({ teamScores: scores, phase: "turn-result", timerRunning: false });
  };
  const enable = async () => {
    setSensor("requesting");
    setMessage("");
    setPractice("");
    gesture.current.reset();
    try {
      if (
        !window.isSecureContext ||
        typeof DeviceOrientationEvent === "undefined"
      )
        throw Error(
          "Motion controls aren’t available in this browser. Use buttons or the keyboard.",
        );
      const ctor = DeviceOrientationEvent as unknown as {
        requestPermission?: () => Promise<string>;
      };
      if (
        ctor.requestPermission &&
        (await ctor.requestPermission()) !== "granted"
      )
        throw Error(
          "Motion permission wasn’t allowed. You can try again or play with buttons or the keyboard.",
        );
      setSensor("listening");
      setTilt(true);
    } catch (error) {
      setTilt(false);
      setSensor("unavailable");
      setMessage(
        error instanceof Error
          ? error.message
          : "Tilt is unavailable. Buttons and keyboard controls still work.",
      );
    }
  };
  const motionStatus =
    sensor === "listening"
      ? "Waiting for the phone’s motion sensor…"
      : practice ||
        (pose === "upright"
          ? "Upright. Now tilt to practise, then return upright."
          : "Hold the screen upright to get ready.");
  if (s.phase === "actor-peek")
    return (
      <Peek
        key={`${s.team}-${s.cardIndex}`}
        session={s}
        actor={actor}
        onDone={() => patch({ phase: "acting", timerRunning: !untimed })}
      />
    );
  if (s.phase === "ready")
    return (
      <Screen
        className={`${classic ? "silent-stage" : "heads-up-stage"} ${refined ? "branded-ready" : ""}`}
        title={`Team ${s.team + 1}, you’re up!`}
        subtitle={
          classic
            ? "One actor. No words or sounds. Your team guesses."
            : "Hold the screen toward your team. Let them give the clues."
        }
      >
        <div className="charades-ready-grid">
          <section className="ready-cast" aria-label="This turn’s team">
            <GameWorld session={s} />
            <h2>Your team</h2>
            <div className="team-list">
              {players
                .filter((_, i) => i % 2 === s.team)
                .map((p) => (
                  <span key={p.id}>
                    <Avatar player={p} /> <strong>{p.name}</strong>
                  </span>
                ))}
            </div>
            <p>
              <strong>{untimed ? "No timer." : "60 seconds."}</strong> One point
              per correct answer.
            </p>
          </section>
          <section className="ready-controls" aria-label="Ways to play">
            {classic ? (
              <>
                <h2>{actor?.name}, you’re the actor.</h2>
                <p>
                  Check your card privately, hide it, then act. Your team
                  guesses.
                </p>
                <details className="ready-help">
                  <summary>How turns work</summary>
                  <p>
                    Correct or Skip passes a fresh prompt to the next actor.{" "}
                    {untimed
                      ? "Finish the turn when your team is ready."
                      : "The clock pauses while the next actor checks their card."}
                  </p>
                </details>
                <p className="keyboard-guide">→ correct · ← skip · Esc pause</p>
              </>
            ) : (
              <>
                <h2>Play your way.</h2>
                <div className="gesture-guide">
                  <div>
                    <ArrowDown size={24} weight="bold" />
                    <span>
                      <strong>Screen to the floor</strong>Correct answer
                    </span>
                  </div>
                  <div>
                    <ArrowUp size={24} weight="bold" />
                    <span>
                      <strong>Screen to the ceiling</strong>Skip this word
                    </span>
                  </div>
                </div>
                <p>Return upright between tilts. Practice adds no points.</p>
                <Button
                  className="tilt-enable"
                  disabled={sensor === "requesting"}
                  onClick={() => {
                    if (tilt) {
                      setTilt(false);
                      setSensor("off");
                      setMessage("");
                    } else void enable();
                  }}
                >
                  <DeviceMobile size={22} />
                  {tilt
                    ? "Turn off tilt"
                    : sensor === "requesting"
                      ? "Requesting permission…"
                      : "Enable tilt controls"}
                </Button>
                {(tilt || message) && (
                  <p className="tilt-status" role="status">
                    {tilt ? motionStatus : message}
                  </p>
                )}
                <p className="keyboard-guide">
                  Keyboard: <kbd>→</kbd> correct · <kbd>←</kbd> skip ·{" "}
                  <kbd>Esc</kbd> pause.
                </p>
              </>
            )}
          </section>
        </div>
        <div className="ready-launch">
          <span>
            {classic
              ? "Actor ready? Check your prompt in private."
              : "Ready? Show the screen to your team."}
          </span>
          <Button
            className="primary"
            onClick={() => {
              gesture.current.reset();
              setPractice("");
              patch({
                phase: classic ? "actor-peek" : "acting",
                actorIndex: 0,
                timerRemaining: untimed ? 0 : 60,
                timerRunning: !classic && !untimed,
                correct: 0,
                skipped: 0,
              });
            }}
          >
            {classic
              ? "Draw your prompt"
              : untimed
                ? "Start the turn"
                : "Start the clock"}
          </Button>
        </div>
      </Screen>
    );
  if (s.phase === "acting")
    return (
      <Screen
        className={
          classic
            ? "silent-stage"
            : `heads-up-stage ${refined ? "illustrated-acting" : ""}`
        }
        title={classic ? `${actor?.name}, act it out!` : "Show your team!"}
      >
        <p className="acting-team">
          {classic ? "Charades" : "Heads Up!"} <span>Team {s.team + 1}</span>
        </p>
        <Timer session={s} onEnd={end} />
        {classic ? (
          <div className="charades-acting">
            <GameWorld session={s} />
            <Avatar player={actor} big />
            <h2>All eyes on {actor?.name}.</h2>
            <p>Gestures only. Guess what they’re acting.</p>
          </div>
        ) : (
          <div className="charades-word" key={s.cardIndex}>
            {refined ? (
              <>
                <CardFace world="heads-up" />
                <div className="card-copy">
                  <h2>{s.deck[s.cardIndex % s.deck.length]}</h2>
                </div>
              </>
            ) : (
              s.deck[s.cardIndex % s.deck.length]
            )}
          </div>
        )}
        <div className="split">
          <Button
            className="mint"
            aria-keyshortcuts="ArrowRight"
            onClick={() => mark(true)}
          >
            <Check size={26} weight="bold" />
            Correct
          </Button>
          <Button aria-keyshortcuts="ArrowLeft" onClick={() => mark(false)}>
            <ArrowBendUpRight size={26} />
            Skip
          </Button>
        </div>
        <p className="helper">
          {s.correct} correct · {s.skipped} skipped
        </p>
        {tilt && (
          <p className="tilt-live" role="status">
            {pose === "upright"
              ? "Tilt ready · floor = correct · ceiling = skip"
              : "Return upright before your next tilt"}
          </p>
        )}
        <p className="keyboard-guide acting-keys">
          <kbd>→</kbd> correct · <kbd>←</kbd> skip · <kbd>Esc</kbd> pause
        </p>
        <Button className="text-button" onClick={end}>
          Finish turn early
        </Button>
      </Screen>
    );
  if (s.phase === "turn-result")
    return (
      <Screen
        title={`Team ${s.team + 1}: ${s.correct} points!`}
        subtitle={`${s.skipped} skipped. Every wild gesture counted.`}
      >
        <Button
          className="primary"
          onClick={() => {
            if (s.team === 0) patch({ team: 1, phase: "ready", actorIndex: 0 });
            else {
              const winning =
                s.teamScores[0] === s.teamScores[1]
                  ? -1
                  : s.teamScores[0] > s.teamScores[1]
                    ? 0
                    : 1;
              finish(
                winning === -1
                  ? "A glorious draw!"
                  : `Team ${winning + 1} wins!`,
                players
                  .filter((_, i) => winning === -1 || i % 2 === winning)
                  .map((p) => p.id),
              );
            }
          }}
        >
          {s.team === 0 ? "Pass to Team 2" : "See the winners"}
        </Button>
      </Screen>
    );
  return null;
}
