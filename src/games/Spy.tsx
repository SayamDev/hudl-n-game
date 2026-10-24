import { useGame } from "../store/useGame";
import { Button, Peek, Screen, Timer } from "../components/ui";
import { WorldArt } from "../components/IllustratedCast";
import { Scoreboard } from "../components/Scoreboard";
import { spyMatch, resolveSpyRound } from "../lib/spy-match";
import type { SpyOutcome } from "../lib/spy-match";
import type { GameProps } from "../lib/types";
import "../spy-match.css";
export default function Spy({ session: s }: GameProps) {
  const { players, patch, finish, nextSpyRound } = useGame();
  const match = spyMatch(s);
  const spy = players.find((p) => s.roles[p.id] === "Spy")!;
  const name = (id: string) =>
    players.find((p) => p.id === id)?.name || "Player";
  const roundLabel = `Round ${s.round} of ${match.rounds}`;
  const settle = (outcome: SpyOutcome) => patch(resolveSpyRound(s, outcome));
  const timeout = () =>
    patch({
      phase: "vote",
      accused: null,
      timerRunning: false,
      spyMatch: { ...match, timeout: true, initiator: match.dealer },
    });
  const finishMatch = () => {
    const high = Math.max(...Object.values(match.scores));
    const leaders = players.filter((p) => match.scores[p.id] === high);
    finish(
      leaders.length === 1
        ? `${leaders[0].name} wins the match!`
        : "A shared victory!",
      leaders.map((p) => p.id),
      match.scores,
    );
  };
  if (s.phase === "peek")
    return (
      <Peek
        key={`${s.round}-${s.peekIndex}`}
        session={s}
        onDone={() =>
          patch({ phase: "discuss", timerRunning: true, spyMatch: match })
        }
      />
    );
  if (s.phase === "spy-round")
    return (
      <Screen
        className="spy-round-stage"
        title={
          match.roundAwards[spy.id] > 0
            ? "The spy takes the round."
            : "The locals take the round."
        }
        subtitle={`${roundLabel} · ${match.outcome}`}
      >
        <section className="spy-round-answer">
          <WorldArt world="spy" />
          <div>
            <h2>{s.secret}</h2>
            <p>
              The spy was <strong>{spy.name}</strong>.
            </p>
          </div>
        </section>
        <h2>Match standings</h2>
        <div
          className="spy-standings"
          role="region"
          aria-label="Match standings"
          tabIndex={0}
        >
          <Scoreboard
            players={players.map((p) => ({
              ...p,
              score: match.scores[p.id] || 0,
            }))}
            awards={match.roundAwards}
            awardLabel="this round"
            winners={players
              .filter((p) => match.roundAwards[p.id] > 0)
              .map((p) => p.id)}
          />
        </div>
        <Button
          className="primary"
          onClick={() =>
            s.round >= match.rounds ? finishMatch() : nextSpyRound()
          }
        >
          {s.round >= match.rounds
            ? "See match results"
            : `Deal round ${s.round + 1} · pass to ${players[0].name}`}
        </Button>
        {s.round < match.rounds && (
          <details>
            <summary>Finish the match early</summary>
            <p>Keep the points earned so far and end this match.</p>
            <Button onClick={finishMatch}>Bank scores & finish match</Button>
          </details>
        )}
      </Screen>
    );
  if (s.phase === "discuss")
    return (
      <Screen
        className="spy-investigation-stage"
        title="Spyfall"
        subtitle={`${roundLabel} · Find the spy without giving the location away.`}
      >
        <section className="investigation-world">
          <div className="investigation-art">
            <WorldArt world="spy" />
          </div>
          <div>
            <h2>{name(s.startingPlayer)}, ask a question.</h2>
            <p>
              Ask one question, with no follow-up. Whoever answers asks next;
              they cannot ask you straight back.
            </p>
            <div className="choice-grid">
              {players
                .filter(
                  (p) =>
                    p.id !== s.startingPlayer &&
                    p.id !== s.night.previousQuestioner,
                )
                .map((p) => (
                  <Button
                    key={p.id}
                    onClick={() =>
                      patch({
                        startingPlayer: p.id,
                        night: {
                          ...s.night,
                          previousQuestioner: s.startingPlayer,
                        },
                      })
                    }
                  >
                    Answered by {p.name}
                  </Button>
                ))}
            </div>
          </div>
        </section>
        <Timer session={s} onEnd={timeout} />
        <details>
          <summary>Possible locations</summary>
          <div className="location-list">{s.guessOptions.join(" • ")}</div>
        </details>
        <Button
          className="primary"
          disabled={match.accusers.length >= players.length}
          onClick={() =>
            patch({
              phase: "spy-accuser",
              timerRunning: false,
              spyMatch: match,
            })
          }
        >
          Make an accusation
        </Button>
        <p className="helper">
          Each player can call one accusation before time runs out.{" "}
          {players.length - match.accusers.length} accusation turns left.
        </p>
        <Button
          disabled={!s.timerRunning}
          onClick={() =>
            patch({ phase: "guess", timerRunning: false, spyMatch: match })
          }
        >
          I’m the spy · guess the location
        </Button>
      </Screen>
    );
  if (s.phase === "spy-accuser")
    return (
      <Screen
        title="Who’s making the accusation?"
        subtitle={`${roundLabel} · This uses that player’s one accusation turn. Choose carefully.`}
      >
        <div className="player-options">
          {players
            .filter((p) => !match.accusers.includes(p.id))
            .map((p) => (
              <Button
                key={p.id}
                onClick={() =>
                  patch({
                    phase: "vote",
                    accused: null,
                    spyMatch: {
                      ...match,
                      initiator: p.id,
                      timeout: false,
                      accusers: [...match.accusers, p.id],
                    },
                  })
                }
              >
                {p.name}
              </Button>
            ))}
        </div>
        <Button onClick={() => patch({ phase: "discuss", timerRunning: true })}>
          Cancel · keep questioning
        </Button>
      </Screen>
    );
  if (s.phase === "vote")
    return (
      <Screen
        title={
          s.accused
            ? "Does everyone else agree?"
            : `${name(match.initiator || match.dealer)}, choose a suspect.`
        }
        subtitle={
          s.accused
            ? "The accused does not vote. Everyone else must agree. Record your group’s decision below."
            : match.timeout
              ? `${roundLabel} · Time is up. One final unanimous vote decides this round.`
              : `${roundLabel} · Choose your suspect. The spy cannot interrupt an accusation to guess.`
        }
      >
        {s.accused ? (
          <>
            <h2>{name(s.accused)} is accused.</h2>
            <Button
              className="primary"
              onClick={() =>
                settle(s.accused === spy.id ? "caught" : "wrong-accusation")
              }
            >
              Everyone else agrees · reveal
            </Button>
            <Button
              onClick={() =>
                match.timeout
                  ? settle("escaped")
                  : patch({
                      phase: "discuss",
                      timerRunning: true,
                      accused: null,
                    })
              }
            >
              Not unanimous · {match.timeout ? "end round" : "keep questioning"}
            </Button>
          </>
        ) : (
          <div className="player-options">
            {players
              .filter((p) => p.id !== (match.initiator || match.dealer))
              .map((p) => (
                <Button key={p.id} onClick={() => patch({ accused: p.id })}>
                  {p.name}
                </Button>
              ))}
          </div>
        )}
        {!s.accused && (
          <Button
            onClick={() =>
              match.timeout
                ? settle("escaped")
                : patch({ phase: "discuss", timerRunning: true })
            }
          >
            {match.timeout
              ? "No agreement · spy wins"
              : "Withdraw accusation · keep questioning"}
          </Button>
        )}
      </Screen>
    );
  if (s.phase === "guess")
    return (
      <Screen
        title="Spy, make your move."
        subtitle={`${roundLabel} · One location. One chance. A wrong guess gives the locals the round.`}
      >
        <div className="choice-grid">
          {s.guessOptions.map((place) => (
            <Button
              key={place}
              onClick={() =>
                settle(place === s.secret ? "correct-guess" : "wrong-guess")
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
