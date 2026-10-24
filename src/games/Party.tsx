import { GameWorld } from "../components/GameWorld";
import { useState } from "react";
import { useGame } from "../store/useGame";
import { likely, takes } from "../content/prompts";
import { Avatar, Button, Screen } from "../components/ui";
import type { GameProps } from "../lib/types";
export default function Party({ session: s }: GameProps) {
  const { players, patch, finish } = useGame();
  const [value, setValue] = useState(50),
    [ready, setReady] = useState(false);
  const hot = s.options.partyMode === "takes";
  const pool = (hot ? takes : likely)[s.options.intensity];
  const offset =
    Array.from(s.id).reduce((a, c) => a + c.charCodeAt(0), 0) % pool.length;
  const prompt =
    s.promptDeck?.[s.promptIndex % s.promptDeck.length] ??
    pool[(offset + s.promptIndex) % pool.length];
  const next = () => {
    setReady(false);
    setValue(50);
    if (s.promptIndex === 4) {
      const counts = s.night;
      const high = Math.max(0, ...Object.values(counts).map(Number));
      finish(
        hot ? "The group has spoken!" : "You know each other too well.",
        hot
          ? players.map((p) => p.id)
          : players
              .filter((p) => Number(counts[p.id] || 0) === high)
              .map((p) => p.id),
      );
    } else
      patch({
        promptIndex: s.promptIndex + 1,
        phase: "prompt",
        partyVotes: {},
        voterIndex: 0,
      });
  };
  if (s.phase === "prompt")
    return (
      <Screen
        className="party-spotlight-stage"
        title={hot ? "Hot take incoming." : "Who’s most likely to…"}
        subtitle={`Prompt ${s.promptIndex + 1} of 5 · ${s.options.intensity}`}
      >
        <div className="prompt-card" key={s.promptIndex}>
          <GameWorld session={s} />
          <h2>
            {prompt}
            {hot ? "" : "?"}
          </h2>
        </div>
        <Button
          className="primary"
          onClick={() => patch({ phase: hot ? "take-vote" : "point" })}
        >
          {hot ? "Pass & rate it" : "Point on three"}
        </Button>
        <Button className="text-button" onClick={next}>
          Skip this prompt
        </Button>
      </Screen>
    );
  if (s.phase === "point")
    return (
      <Screen
        title="3, 2, 1… point!"
        subtitle="Tap the person with the most votes. This is all in good fun."
      >
        <div className="player-options">
          {players.map((p) => (
            <button
              className="player-option"
              key={p.id}
              onClick={() =>
                patch({
                  phase: "prompt-result",
                  accused: p.id,
                  night: {
                    ...s.night,
                    [p.id]: String(Number(s.night[p.id] || 0) + 1),
                  },
                })
              }
            >
              <Avatar player={p} />
              {p.name}
            </button>
          ))}
        </div>
        <Button
          onClick={() => patch({ phase: "prompt-result", accused: null })}
        >
          It’s a tie
        </Button>
      </Screen>
    );
  if (s.phase === "take-vote") {
    const p = players[s.voterIndex];
    return (
      <Screen
        title={ready ? `${p.name}, what’s your take?` : `Pass to ${p.name}`}
        subtitle={
          ready
            ? prompt
            : "Everyone else, look away. Ratings are private until the reveal."
        }
      >
        {!ready ? (
          <Button className="primary" onClick={() => setReady(true)}>
            I’m ready
          </Button>
        ) : (
          <>
            <label className="take-slider">
              Agreement: {value}%
              <input
                type="range"
                min="0"
                max="100"
                step="10"
                value={value}
                onChange={(e) => setValue(Number(e.target.value))}
              />
            </label>
            <div className="split">
              <span>Strongly disagree</span>
              <span>Strongly agree</span>
            </div>
            <Button
              className="primary"
              onClick={() => {
                const votes = { ...s.partyVotes, [p.id]: value };
                setReady(false);
                setValue(50);
                patch({
                  partyVotes: votes,
                  voterIndex: s.voterIndex + 1,
                  phase:
                    s.voterIndex === players.length - 1
                      ? "prompt-result"
                      : "take-vote",
                });
              }}
            >
              Lock my take
            </Button>
          </>
        )}
      </Screen>
    );
  }
  if (s.phase === "prompt-result")
    return (
      <Screen
        title={
          hot
            ? "The group split"
            : s.accused
              ? `${players.find((p) => p.id === s.accused)?.name}, apparently!`
              : "Too close to call."
        }
      >
        {hot ? (
          <div className="score-list">
            {players.map((p) => (
              <div key={p.id}>
                <Avatar player={p} />
                <strong>{p.name}</strong>
                <span>{s.partyVotes[p.id]}% agree</span>
              </div>
            ))}
          </div>
        ) : (
          <p>{prompt}?</p>
        )}
        <Button className="primary" onClick={next}>
          {s.promptIndex === 4 ? "See results" : "Next prompt"}
        </Button>
      </Screen>
    );
  return null;
}
