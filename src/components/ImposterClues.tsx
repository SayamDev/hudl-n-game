import { ArrowRight, Fingerprint } from "@phosphor-icons/react";
import { useGame } from "../store/useGame";
import { Avatar, Button, Screen, Timer } from "./ui";
import type { Session } from "../lib/types";

/** Renders public turn order; never reads the secret or players’ roles. */
export function ImposterClues({ session }: { session: Session }) {
  const players = useGame((s) => s.players);
  const patch = useGame((s) => s.patch);
  const first = Math.max(
    0,
    players.findIndex((p) => p.id === session.startingPlayer),
  );
  const step = session.direction === "anticlockwise" ? -1 : 1;
  const turn = session.clueIndex || 0;
  const order = players.map(
    (_, offset) =>
      players[(first + step * offset + players.length) % players.length],
  );
  const current = order[turn % order.length];
  const next = order[(turn + 1) % order.length];
  const verbal = session.options.voteMode === "point";
  const vote = (outLoud = false) =>
    patch({
      phase: "vote",
      timerRunning: false,
      votes: {},
      voterIndex: 0,
      ...(outLoud
        ? { options: { ...session.options, voteMode: "point" as const } }
        : {}),
    });
  return (
    <Screen
      className="imposter-clues"
      title="Keep them guessing."
      subtitle="One word each. Then talk it out."
    >
      <div className="clue-meta">
        <span>Clue round {Math.floor(turn / order.length) + 1}</span>
        <Timer session={session} compact />
      </div>
      <div className="clue-table">
        <div className="clue-speaker start-player">
          <Avatar player={current} big />
          <div
            className="clue-speaker-copy"
            aria-live="polite"
            aria-atomic="true"
          >
            <span className="clue-eyebrow">Your clue</span>
            <strong>{current.name}</strong>
            <p>Say one word. Keep your cover.</p>
          </div>
        </div>
        <div className="clue-turn-controls">
          <div className="clue-next">
            <Avatar player={next} />
            <span>
              Up next<strong>{next.name}</strong>
            </span>
            <ArrowRight size={22} aria-hidden="true" />
          </div>
          <Button onClick={() => patch({ clueIndex: turn + 1 })}>
            Next clue <ArrowRight size={22} aria-hidden="true" />
          </Button>
          <ol className="clue-order" aria-label="Clue order">
            {order.map((p, i) => (
              <li
                key={p.id}
                aria-current={i === turn % order.length ? "step" : undefined}
              >
                <span>{i + 1}</span>
                {p.name}
              </li>
            ))}
          </ol>
        </div>
      </div>
      <div className="clue-accuse">
        <div className="clue-vote-prompt">
          <Fingerprint size={25} aria-hidden="true" />
          <span>Someone sounding suspicious?</span>
        </div>
        <Button className="primary" onClick={() => vote()}>
          {verbal ? "Choose a suspect" : "Start secret voting"}
          <ArrowRight size={22} aria-hidden="true" />
        </Button>
        <p>
          {verbal
            ? "Agree out loud, then pick one person."
            : "Pass the phone. Everyone gets a private vote."}
        </p>
        {!verbal && (
          <Button className="clue-verbal-link" onClick={() => vote(true)}>
            We voted out loud
          </Button>
        )}
      </div>
    </Screen>
  );
}
