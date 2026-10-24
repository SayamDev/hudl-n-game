import { ImposterClues } from "../components/ImposterClues";
import { PrivateReveal } from "../components/PrivateReveal";
import { Verdict } from "../components/Verdict";
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
  const modern =
    useGame.getState().preferences.swipeReveal !== false &&
    useGame.getState().preferences.deckStyle !== false &&
    !["classic", "club-original"].includes(
      useGame.getState().preferences.design,
    );
  if (s.phase === "peek") {
    if (modern)
      return (
        <PrivateReveal
          key={s.peekIndex}
          session={s}
          onDone={() =>
            patch({ phase: "discuss", timerRunning: s.options.seconds !== 0 })
          }
        />
      );
    return (
      <Peek
        key={s.peekIndex}
        session={s}
        onDone={() =>
          patch({ phase: "discuss", timerRunning: s.options.seconds !== 0 })
        }
      />
    );
  }
  if (s.phase === "discuss") {
    if (modern) return <ImposterClues session={s} />;
    const first = Math.max(
      0,
      players.findIndex((p) => p.id === s.startingPlayer),
    );
    const step = s.direction === "anticlockwise" ? -1 : 1;
    const turn = s.clueIndex || 0;
    const index =
      (first + step * (turn % players.length) + players.length) %
      players.length;
    const start = players[index];
    const next = players[(index + step + players.length) % players.length];
    return (
      <Screen
        title="Okay. Act natural."
        subtitle="Take turns giving one-word clues. Then interrogate your very suspicious friends."
      >
        <div className="start-player">
          <Avatar player={start} />
          <div>
            <strong>{start.name} gives the clue</strong>
            <p>
              Next: {next.name} · {s.direction} through your crew list
            </p>
          </div>
        </div>
        <Button onClick={() => patch({ clueIndex: turn + 1 })}>
          Next clue · {next.name}
        </Button>
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
        <Button
          onClick={() =>
            patch({
              phase: "vote",
              timerRunning: false,
              options: { ...s.options, voteMode: "point" },
              votes: {},
              voterIndex: 0,
            })
          }
        >
          We voted out loud
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
      <Screen className="imposter-verdict" title={`${p.name} was…`}>
        <Verdict
          key={p.id}
          player={p}
          caught={caught}
          onContinue={() =>
            caught
              ? patch({ phase: "guess" })
              : finish(
                  "The imposters got away!",
                  imposters.map((p) => p.id),
                )
          }
        />
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
