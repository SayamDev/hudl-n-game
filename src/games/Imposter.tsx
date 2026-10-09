import { useState } from "react";
import { useGame } from "../store/useGame";
import { normalize } from "../lib/logic";
import { Avatar, Button, Mascot, Peek, Screen, Timer } from "../components/ui";
import { Vote } from "../components/Vote";
import type { GameProps } from "../lib/types";
export default function Imposter({ session: s }: GameProps) {
  const { players, patch, finish } = useGame();
  const [guess, setGuess] = useState("");
  const imposters = players.filter((p) => s.roles[p.id] === "Imposter");
  const crew = players.filter((p) => s.roles[p.id] !== "Imposter");
  if (s.phase === "peek")
    return (
      <Peek
        key={s.peekIndex}
        session={s}
        onDone={() => patch({ phase: "discuss", timerRunning: true })}
      />
    );
  if (s.phase === "discuss") {
    const start = players.find((p) => p.id === s.startingPlayer)!;
    return (
      <Screen
        title="Okay. Act natural."
        subtitle="Take turns giving one-word clues. Then interrogate your very suspicious friends."
      >
        <div className="start-player">
          <Avatar player={start} />
          <div>
            <strong>{start.name} starts</strong>
            <p>Go {s.direction}</p>
          </div>
        </div>
        <Timer session={s} />
        <p className="helper">
          Crew win +{s.options.points} points. Imposters steal the same points
          with a correct final guess.
        </p>
        <Button
          className="primary"
          onClick={() =>
            patch({
              phase: "vote",
              timerRunning: false,
              votes: {},
              voterIndex: 0,
            })
          }
        >
          Time to vote
        </Button>
      </Screen>
    );
  }
  if (s.phase === "vote")
    return (
      <Vote
        session={s}
        onResult={(accused) => patch({ accused, phase: "reveal" })}
      />
    );
  if (s.phase === "reveal") {
    const p = players.find((p) => p.id === s.accused)!;
    const caught = s.roles[p.id] === "Imposter";
    return (
      <Screen title={`${p.name} was…`}>
        <div className="center">
          <Avatar player={p} big />
          <h2 className="reveal-title">
            {caught ? "THE IMPOSTER!" : "INNOCENT!"}
          </h2>
          <p>
            {caught
              ? "Caught red-handed. But there’s one last chance…"
              : "That poker face fooled everyone."}
          </p>
        </div>
        <Button
          className="primary"
          onClick={() =>
            caught
              ? patch({ phase: "guess" })
              : finish(
                  "The imposters got away!",
                  imposters.map((p) => p.id),
                )
          }
        >
          {caught ? "One last guess" : "See results"}
        </Button>
      </Screen>
    );
  }
  if (s.phase === "guess")
    return (
      <Screen
        title="One shot. Make it count."
        subtitle={`${players.find((p) => p.id === s.accused)?.name}, guess the crew’s secret word.`}
      >
        <Mascot mood="secret" />
        <div className="choice-grid">
          {s.guessOptions.map((w) => (
            <Button
              key={w}
              className={guess === w ? "selected" : ""}
              onClick={() => setGuess(w)}
            >
              {w}
            </Button>
          ))}
        </div>
        <label>
          Your guess
          <input
            value={guess}
            onChange={(e) => setGuess(e.target.value)}
            maxLength={60}
            autoComplete="off"
          />
        </label>
        <Button
          className="primary"
          disabled={!guess.trim()}
          onClick={() =>
            finish(
              normalize(guess) === normalize(s.secret)
                ? "The imposters stole the win!"
                : "The crew cracked it!",
              (normalize(guess) === normalize(s.secret) ? imposters : crew).map(
                (p) => p.id,
              ),
            )
          }
        >
          Lock it in
        </Button>
      </Screen>
    );
  return null;
}
