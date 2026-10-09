import { useEffect, useRef, useState } from "react";
import { useGame } from "../store/useGame";
import { feedback } from "../lib/feedback";
import { Avatar, Button, Screen, Timer } from "../components/ui";
import { Check, ArrowBendUpRight } from "@phosphor-icons/react";
import type { GameProps } from "../lib/types";
export default function Charades({ session: s }: GameProps) {
  const { players, patch, finish } = useGame();
  const [tilt, setTilt] = useState(false),
    [message, setMessage] = useState("");
  const armed = useRef(true);
  const mark = (correct: boolean) => {
    const current = useGame.getState().session;
    if (
      !current ||
      current.phase !== "acting" ||
      current.paused ||
      current.timerRemaining <= 0
    )
      return;
    feedback(correct ? "success" : "tap");
    patch({
      cardIndex: current.cardIndex + 1,
      correct: current.correct + (correct ? 1 : 0),
      skipped: current.skipped + (correct ? 0 : 1),
    });
  };
  useEffect(() => {
    if (!tilt || s.phase !== "acting") return;
    const handler = (e: DeviceOrientationEvent) => {
      if (e.beta === null) return;
      const beta = e.beta;
      if (beta > 55 && beta < 125) armed.current = true;
      else if (armed.current && (beta < 30 || beta > 150)) {
        armed.current = false;
        mark(beta > 150);
      }
    };
    window.addEventListener("deviceorientation", handler);
    return () => window.removeEventListener("deviceorientation", handler);
  }, [tilt, s.phase]);
  const end = () => {
    const current = useGame.getState().session!;
    const scores: [number, number] = [...current.teamScores];
    scores[current.team] = current.correct;
    patch({ teamScores: scores, phase: "turn-result", timerRunning: false });
  };
  const enable = async () => {
    try {
      const ctor = DeviceOrientationEvent as unknown as {
        requestPermission?: () => Promise<string>;
      };
      if (
        ctor.requestPermission &&
        (await ctor.requestPermission()) !== "granted"
      )
        throw Error();
      setTilt(true);
      setMessage(
        "Tilt enabled. Hold upright to reset between gestures. Tap controls always work.",
      );
    } catch {
      setMessage(
        "Tilt is unavailable here. Use the large Correct and Skip buttons.",
      );
    }
  };
  if (s.phase === "ready")
    return (
      <Screen
        title={`Team ${s.team + 1}, you’re up!`}
        subtitle="One teammate holds the phone facing the others. No saying the word."
      >
        <div className="team-list">
          {players
            .filter((_, i) => i % 2 === s.team)
            .map((p) => (
              <span key={p.id}>
                <Avatar player={p} /> {p.name}
              </span>
            ))}
        </div>
        <p>60 seconds. Each correct answer earns one team point.</p>
        {s.options.tilt && (
          <Button onClick={enable}>Enable tilt controls</Button>
        )}
        {message && <p role="status">{message}</p>}
        <Button
          className="primary"
          onClick={() =>
            patch({
              phase: "acting",
              timerRemaining: 60,
              timerRunning: true,
              correct: 0,
              skipped: 0,
            })
          }
        >
          Start the clock
        </Button>
      </Screen>
    );
  if (s.phase === "acting")
    return (
      <Screen title="Show your team!">
        <p className="acting-team">
          Heads Up! <span>Team {s.team + 1}</span>
        </p>
        <Timer session={s} onEnd={end} />
        <div className="charades-word" key={s.cardIndex}>
          {s.deck[s.cardIndex % s.deck.length]}
        </div>
        <div className="split">
          <Button className="mint" onClick={() => mark(true)}>
            <Check size={26} weight="bold" />
            Correct
          </Button>
          <Button onClick={() => mark(false)}>
            <ArrowBendUpRight size={26} />
            Skip
          </Button>
        </div>
        <p className="helper">
          {s.correct} correct · {s.skipped} skipped
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
            if (s.team === 0) patch({ team: 1, phase: "ready" });
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
