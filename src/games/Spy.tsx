import { useGame } from "../store/useGame";
import { Button, Peek, Screen, Timer } from "../components/ui";
import { Vote } from "../components/Vote";
import type { GameProps } from "../lib/types";
export default function Spy({ session: s }: GameProps) {
  const { players, patch, finish } = useGame();
  const spy = players.find((p) => s.roles[p.id] === "Spy")!;
  const locals = players.filter((p) => p.id !== spy.id);
  if (s.phase === "peek")
    return (
      <Peek
        key={s.peekIndex}
        session={s}
        onDone={() => patch({ phase: "discuss", timerRunning: true })}
      />
    );
  if (s.phase === "discuss")
    return (
      <Screen
        title="You look a little lost."
        subtitle="Ask each other questions. Locals: don’t give the place away."
      >
        <Timer session={s} />
        <p>
          <strong>
            {players.find((p) => p.id === s.startingPlayer)?.name}
          </strong>{" "}
          asks the first question.
        </p>
        <details>
          <summary>All possible locations</summary>
          <div className="location-list">{s.guessOptions.join(" • ")}</div>
        </details>
        <Button
          className="primary"
          onClick={() => patch({ phase: "vote", timerRunning: false })}
        >
          Find the spy
        </Button>
        <Button onClick={() => patch({ phase: "guess", timerRunning: false })}>
          Spy wants to guess
        </Button>
      </Screen>
    );
  if (s.phase === "vote")
    return (
      <Vote
        session={s}
        onResult={(id) =>
          id === spy.id
            ? patch({ phase: "guess", accused: id })
            : finish(`${spy.name} fooled the locals!`, [spy.id])
        }
      />
    );
  if (s.phase === "guess")
    return (
      <Screen
        title={`${spy.name}, where are we?`}
        subtitle="One location. One chance. A wrong guess gives the locals the win."
      >
        <div className="choice-grid">
          {s.guessOptions.map((place) => (
            <Button
              key={place}
              onClick={() =>
                finish(
                  place === s.secret
                    ? "The spy found the place!"
                    : "The locals kept their secret!",
                  place === s.secret ? [spy.id] : locals.map((p) => p.id),
                )
              }
            >
              {place}
            </Button>
          ))}
        </div>
      </Screen>
    );
  return null;
}
