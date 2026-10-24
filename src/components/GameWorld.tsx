import { WorldArt } from "./IllustratedCast";
import { useGame } from "../store/useGame";
import type { Session } from "../lib/types";
export function GameWorld({ session: s }: { session: Session }) {
  const { players, patch, preferences } = useGame();
  if (
    preferences.deckStyle === false ||
    ["classic", "club-original"].includes(preferences.design)
  )
    return null;
  if (s.game === "mafia") {
    const step =
      s.phase === "dawn"
        ? 1
        : s.phase === "discuss" || s.phase === "vote"
          ? 2
          : 0;
    return (
      <section className="council-world" aria-label="Village council">
        <WorldArt world="mafia" />
        <div className="council-caption">
          <span>
            Night {s.round} · {s.alive.length} villagers remain
          </span>
          <ol aria-label="Council cycle">
            {["Night falls", "Dawn report", "Village vote"].map((label, i) => (
              <li key={label} aria-current={step === i ? "step" : undefined}>
                {label}
              </li>
            ))}
          </ol>
        </div>
      </section>
    );
  }
  if (s.game === "spy") {
    const turn = s.clueIndex || 0;
    const first = Math.max(
      0,
      players.findIndex((p) => p.id === s.startingPlayer),
    );
    const speaker = players[(first + turn) % players.length];
    const next = players[(first + turn + 1) % players.length];
    return (
      <section className="investigation-world" aria-label="Investigation desk">
        <div className="investigation-art">
          <WorldArt world="spy" />
        </div>
        <div>
          <span className="case-label">Question {turn + 1}</span>
          <h2>{speaker?.name}, ask a question.</h2>
          <p>
            Ask about the place without saying its name. Next investigator:{" "}
            <strong>{next?.name}</strong>.
          </p>
          <button
            className="case-next"
            onClick={() => patch({ clueIndex: turn + 1 })}
          >
            Next question · {next?.name}
          </button>
        </div>
      </section>
    );
  }
  return (
    <div
      className={`game-scene scene-${s.game === "charades" ? (s.options.charadesMode === "classic" ? "charades" : "heads-up") : s.game}`}
      aria-hidden="true"
    >
      <WorldArt
        world={
          s.game === "charades"
            ? s.options.charadesMode === "classic"
              ? "charades"
              : "heads-up"
            : s.game
        }
      />
    </div>
  );
}
