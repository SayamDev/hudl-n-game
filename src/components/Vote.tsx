import { useEffect, useState } from "react";
import { useGame } from "../store/useGame";
import { resolveVotes } from "../lib/logic";
import { Avatar, Button, Screen } from "./ui";
import type { Session } from "../lib/types";
export function Vote({
  session,
  onResult,
}: {
  session: Session;
  onResult: (id: string) => void;
}) {
  const players = useGame((s) => s.players).filter((p) =>
    session.alive.includes(p.id),
  );
  const patch = useGame((s) => s.patch);
  const [ready, setReady] = useState(false),
    [selected, setSelected] = useState(""),
    [guard, setGuard] = useState(3),
    [tie, setTie] = useState(false);
  useEffect(() => {
    setReady(false);
    setSelected("");
    setGuard(3);
    const id = setInterval(() => setGuard((g) => Math.max(0, g - 1)), 1000);
    return () => clearInterval(id);
  }, [session.voterIndex]);
  const point = session.options.voteMode === "point";
  const voter = players[session.voterIndex];
  const cast = () => {
    if (!selected) return;
    if (point) {
      onResult(selected);
      return;
    }
    const votes = { ...session.votes, [voter.id]: selected };
    if (session.voterIndex < players.length - 1) {
      patch({ votes, voterIndex: session.voterIndex + 1 });
    } else {
      const result = resolveVotes(votes);
      if (result.winner) onResult(result.winner);
      else {
        patch({ votes: {}, voterIndex: 0 });
        setReady(false);
        setTie(true);
        setGuard(3);
      }
    }
  };
  if (!point && !ready)
    return (
      <Screen
        title={tie ? "It’s a tie. Vote again!" : `Pass to ${voter?.name}`}
        subtitle={
          tie
            ? "Nobody is eliminated. Discuss briefly, then cast a fresh vote."
            : "Keep your vote to yourself. Everyone else, look away."
        }
      >
        {voter && (
          <div className="center">
            <Avatar player={voter} big />
          </div>
        )}
        <Button
          className="primary"
          disabled={guard > 0}
          onClick={() => {
            setReady(true);
            setTie(false);
          }}
        >
          {guard ? `Ready in ${guard}` : "I’m ready to vote"}
        </Button>
        <Button
          onClick={() => {
            setSelected("");
            patch({
              options: { ...session.options, voteMode: "point" },
              votes: {},
              voterIndex: 0,
            });
          }}
        >
          Use quick group vote
        </Button>
      </Screen>
    );
  return (
    <Screen
      title={point ? "Point on three!" : `${voter?.name}, who is it?`}
      subtitle={
        point
          ? "Count 3, 2, 1 together. Pick the person with the most votes."
          : "Choose one player, then confirm your secret vote."
      }
    >
      <div className="player-options">
        {players.map((p) => (
          <button
            key={p.id}
            aria-pressed={selected === p.id}
            className={`player-option ${selected === p.id ? "selected" : ""}`}
            onClick={() => setSelected(p.id)}
          >
            <Avatar player={p} />
            <span>{p.name}</span>
          </button>
        ))}
      </div>
      <Button className="primary" disabled={!selected} onClick={cast}>
        {point ? "Reveal the accused" : "Lock my vote"}
      </Button>
      {point && (
        <Button
          onClick={() => {
            setSelected("");
            setTie(true);
          }}
        >
          It’s a tie — keep discussing
        </Button>
      )}
      {point && tie && (
        <p role="status">
          No one is eliminated. Talk it out, then point again.
        </p>
      )}
    </Screen>
  );
}
