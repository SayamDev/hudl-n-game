import { useGame } from "../store/useGame";
import { Button, Peek, Screen, Timer } from "../components/ui";
import { WorldArt } from "../components/IllustratedCast";
import type { GameProps } from "../lib/types";
export default function Spy({ session: s }: GameProps) {
  const { players, patch, finish } = useGame();
  const spy = players.find((p) => s.roles[p.id] === "Spy")!;
  const locals = players.filter((p) => p.id !== spy.id);
  const accuse = () =>
    patch({ phase: "vote", timerRunning: false, accused: null });
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
        className="spy-investigation-stage"
        title="Spyfall"
        subtitle="One location. One spy. Eight minutes to uncover the truth."
      >
        <section className="investigation-world">
          <div className="investigation-art">
            <WorldArt world="spy" />
          </div>
          <div>
            <h2>
              {players.find((p) => p.id === s.startingPlayer)?.name}, ask a
              question.
            </h2>
            <p>
              Choose someone to answer. They ask the next question, but cannot
              ask you straight back.
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
        <Timer session={s} onEnd={accuse} />
        <details>
          <summary>Possible locations</summary>
          <div className="location-list">{s.guessOptions.join(" • ")}</div>
        </details>
        <Button className="primary" onClick={accuse}>
          Make an accusation
        </Button>
        <Button onClick={() => patch({ phase: "guess", timerRunning: false })}>
          I’m the spy · guess the location
        </Button>
      </Screen>
    );
  if (s.phase === "vote")
    return (
      <Screen
        title={s.accused ? "Does everyone else agree?" : "Who do you suspect?"}
        subtitle={
          s.accused
            ? "The accused does not vote. Every other player must agree to end the round."
            : "Discuss out loud, then tap the player being accused."
        }
      >
        {s.accused ? (
          <>
            <h2>{players.find((p) => p.id === s.accused)?.name} is accused.</h2>
            <Button
              className="primary"
              onClick={() =>
                finish(
                  s.accused === spy.id
                    ? "The locals caught the spy!"
                    : `${spy.name} escaped suspicion!`,
                  s.accused === spy.id ? locals.map((p) => p.id) : [spy.id],
                )
              }
            >
              Everyone else agrees · reveal
            </Button>
            <Button
              onClick={() =>
                s.timerRemaining <= 0
                  ? finish(`${spy.name} escaped before time ran out!`, [spy.id])
                  : patch({
                      phase: "discuss",
                      timerRunning: true,
                      accused: null,
                    })
              }
            >
              Not unanimous ·{" "}
              {s.timerRemaining <= 0 ? "end round" : "keep questioning"}
            </Button>
          </>
        ) : (
          <div className="player-options">
            {players.map((p) => (
              <Button key={p.id} onClick={() => patch({ accused: p.id })}>
                {p.name}
              </Button>
            ))}
          </div>
        )}
        {!s.accused && (
          <Button
            onClick={() =>
              s.timerRemaining <= 0
                ? finish("The spy escaped!", [spy.id])
                : patch({ phase: "discuss", timerRunning: true })
            }
          >
            {s.timerRemaining <= 0
              ? "No agreement · spy wins"
              : "Back to questions"}
          </Button>
        )}
      </Screen>
    );
  if (s.phase === "guess")
    return (
      <Screen
        title="Spy, make your move."
        subtitle="Name your location. One chance: get it wrong and the locals win."
      >
        <div className="choice-grid">
          {s.guessOptions.map((place) => (
            <Button
              key={place}
              onClick={() =>
                finish(
                  place === s.secret
                    ? "The spy found the location!"
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
