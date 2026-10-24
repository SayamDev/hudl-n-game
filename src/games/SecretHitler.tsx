// CC BY-NC-SA 4.0 adaptation; see docs/secret-hitler-license.md.
import { useEffect, useState } from "react";
import { useGame } from "../store/useGame";
import { Avatar, Button, Screen } from "../components/ui";
import {
  createParliament,
  eligibleChancellors,
  parliamentTurn,
  roleBrief,
} from "../lib/parliament";
import type { ParliamentAction } from "../lib/parliament";
import type { GameProps } from "../lib/types";
import "../parliament.css";
export default function SecretHitler({ session: s }: GameProps) {
  const { players, patch, finish } = useGame();
  const board = s.parliament;
  const [open, setOpen] = useState(false);
  const name = (id: string) => players.find((p) => p.id === id)?.name || id;
  const send = (a: ParliamentAction) => {
    setOpen(false);
    if (board) patch({ parliament: parliamentTurn(board, a) });
  };
  useEffect(() => {
    const hide = () => setOpen(false);
    window.addEventListener("blur", hide);
    document.addEventListener("visibilitychange", hide);
    if (s.paused) hide();
    return () => {
      window.removeEventListener("blur", hide);
      document.removeEventListener("visibilitychange", hide);
    };
  }, [s.paused]);
  if (!board)
    return (
      <Screen title="Preparing parliament…">
        <Button
          onClick={() =>
            patch({ parliament: createParliament(players.map((p) => p.id)) })
          }
        >
          Prepare game
        </Button>
      </Screen>
    );
  const privateStage = [
    "roles",
    "president",
    "chancellor",
    "private-power",
  ].includes(board.phase);
  const reader =
    board.phase === "roles"
      ? players[s.peekIndex]?.id
      : board.phase === "chancellor"
        ? board.chancellor
        : board.president;
  const choices = (ids: string[], action: (id: string) => void) => (
    <div className="player-options">
      {ids.map((id) => (
        <button className="player-option" key={id} onClick={() => action(id)}>
          <Avatar player={players.find((p) => p.id === id)!} />
          <span>{name(id)}</span>
        </button>
      ))}
    </div>
  );
  const art = (
    <img
      className="parliament-cover"
      src={`${import.meta.env.BASE_URL}art/after-hours/secret-hitler.webp`}
      alt="Masked parliament surrounding a secret ballot box"
    />
  );
  return (
    <Screen
      className="parliament-stage"
      title={
        privateStage
          ? `Pass to ${name(reader)}`
          : board.phase === "over"
            ? `${board.winner}s win!`
            : "Secret Hitler"
      }
      subtitle={
        privateStage
          ? "Only the named player should see this card."
          : "Elect carefully. Every policy shifts the balance."
      }
    >
      {!privateStage && (
        <div className="policy-tracks">
          <strong>Liberal policies · {board.liberal}/5</strong>
          <strong>Fascist policies · {board.fascist}/6</strong>
          <span>Election tracker · {board.failures}/3</span>
          <span>{board.alive.length} players remain</span>
        </div>
      )}
      {privateStage ? (
        <section className={`parliament-private ${open ? "private-open" : ""}`}>
          {!open ? (
            <>
              {art}
              <Button className="primary" onClick={() => setOpen(true)}>
                Open private card
              </Button>
            </>
          ) : (
            <>
              {board.phase === "roles" ? (
                <>
                  {art}
                  <h2>{board.roles[reader]}</h2>
                  <p>{roleBrief(board, reader, name)}</p>
                  <Button
                    className="primary"
                    onClick={() => {
                      setOpen(false);
                      if (s.peekIndex < players.length - 1)
                        patch({ peekIndex: s.peekIndex + 1 });
                      else send({ type: "begin" });
                    }}
                  >
                    {s.peekIndex < players.length - 1
                      ? `Hide & pass to ${players[s.peekIndex + 1].name}`
                      : "Hide & begin election"}
                  </Button>
                </>
              ) : board.phase === "private-power" ? (
                <>
                  <h2>Confidential intelligence</h2>
                  <p>
                    {board.privateInfo
                      .split(/([\w-]+):/)
                      .map((part) =>
                        players.some((p) => p.id === part) ? name(part) : part,
                      )
                      .join("")}
                  </p>
                  <Button onClick={() => send({ type: "continue" })}>
                    Hide & return to the table
                  </Button>
                </>
              ) : (
                <>
                  <h2>
                    {board.phase === "president"
                      ? "Discard one policy"
                      : "Enact one policy"}
                  </h2>
                  <p>
                    {board.phase === "president"
                      ? "The remaining two go privately to the Chancellor."
                      : "Your chosen policy becomes public. The other is discarded."}
                  </p>
                  <div className="policy-hand">
                    {board.hand.map((policy, i) => (
                      <Button
                        key={i}
                        className={`policy-tile policy-${policy.toLowerCase()}`}
                        onClick={() =>
                          send({
                            type:
                              board.phase === "president" ? "discard" : "enact",
                            index: i,
                          })
                        }
                      >
                        {policy}
                      </Button>
                    ))}
                  </div>
                  {board.phase === "chancellor" &&
                    board.fascist >= 5 &&
                    !board.vetoDenied && (
                      <Button onClick={() => send({ type: "veto" })}>
                        Request a veto
                      </Button>
                    )}
                </>
              )}
              <Button className="text-button" onClick={() => setOpen(false)}>
                Close private card
              </Button>
            </>
          )}
        </section>
      ) : (
        <>
          {board.phase === "nominate" && (
            <>
              {art}
              <h2>{name(board.president)}, nominate a Chancellor.</h2>
              <p>
                Previous officeholders may be term-limited. Choose an eligible
                player.
              </p>
              {choices(eligibleChancellors(board), (id) =>
                send({ type: "nominate", id }),
              )}
            </>
          )}
          {board.phase === "ballot" && (
            <>
              <h2>
                {name(board.president)} + {name(board.chancellor)}
              </h2>
              <p>
                Discuss this government, then pass the phone for a private Yes
                or No. Votes are published together.
              </p>
              {(() => {
                const id = board.alive.find((p) => !(p in board.ballots))!;
                return (
                  <section className="ballot-box">
                    <h2>Pass to {name(id)}</h2>
                    {open ? (
                      <div className="split">
                        <Button
                          className="primary"
                          onClick={() => send({ type: "vote", id, yes: true })}
                        >
                          Yes · elect
                        </Button>
                        <Button
                          onClick={() => send({ type: "vote", id, yes: false })}
                        >
                          No · reject
                        </Button>
                      </div>
                    ) : (
                      <Button onClick={() => setOpen(true)}>
                        I’m {name(id)} · vote
                      </Button>
                    )}
                  </section>
                );
              })()}
            </>
          )}
          {board.phase === "ballot-result" && (
            <>
              <h2>
                {Object.values(board.ballots).filter(Boolean).length >
                board.alive.length / 2
                  ? "Government elected"
                  : "Government rejected"}
              </h2>
              <ul>
                {board.alive.map((id) => (
                  <li key={id}>
                    {name(id)} · {board.ballots[id] ? "Yes" : "No"}
                  </li>
                ))}
              </ul>
              <Button
                className="primary"
                onClick={() => send({ type: "continue" })}
              >
                Continue
              </Button>
            </>
          )}
          {board.phase === "policy" && (
            <>
              <h2>{board.message}</h2>
              <p>
                {board.power
                  ? "The President must use an executive power."
                  : "Discuss what happened before the next election."}
              </p>
              <Button
                className="primary"
                onClick={() => send({ type: "continue" })}
              >
                {board.power ? "Use presidential power" : "Next election"}
              </Button>
            </>
          )}
          {board.phase === "veto" && (
            <>
              <h2>{name(board.president)}, accept the veto?</h2>
              <p>
                Accepting discards both policies and advances the election
                tracker. Refusing sends the cards back to the Chancellor.
              </p>
              <Button onClick={() => send({ type: "accept-veto" })}>
                Accept veto
              </Button>
              <Button onClick={() => send({ type: "deny-veto" })}>
                Refuse veto
              </Button>
            </>
          )}
          {board.phase === "power" && (
            <>
              <h2>
                {name(board.president)} ·{" "}
                {
                  {
                    peek: "Policy peek",
                    investigate: "Investigate party membership",
                    special: "Call a special election",
                    execution: "Remove a player",
                  }[board.power]
                }
              </h2>
              <p>
                {board.power === "execution"
                  ? "Choose carefully. Removing Hitler ends the game; other roles remain secret."
                  : board.power === "investigate"
                    ? "You learn party membership privately, never the special role."
                    : "Complete this power before the next election."}
              </p>
              {board.power === "peek" ? (
                <Button
                  onClick={() => send({ type: "target", id: board.president })}
                >
                  Privately inspect top three
                </Button>
              ) : (
                choices(
                  board.alive.filter(
                    (id) =>
                      id !== board.president &&
                      (board.power !== "investigate" ||
                        !board.investigated.includes(id)),
                  ),
                  (id) => send({ type: "target", id }),
                )
              )}
            </>
          )}
          {board.phase === "over" && (
            <>
              {art}
              <h2>{board.message}</h2>
              <Button
                className="primary"
                onClick={() =>
                  finish(
                    `${board.winner}s win!`,
                    players
                      .filter((p) =>
                        board.winner === "Liberal"
                          ? board.roles[p.id] === "Liberal"
                          : board.roles[p.id] !== "Liberal",
                      )
                      .map((p) => p.id),
                  )
                }
              >
                See roles & results
              </Button>
            </>
          )}
        </>
      )}
      <details className="game-attribution">
        <summary>Rules & credits</summary>
        <p>
          Noncommercial digital adaptation of Secret Hitler by Mike Boxleiter,
          Tommy Maranges and Mac Schubert. Original interface, illustrations and
          digital rules implementation. Not affiliated with the creators.
        </p>
        <a
          href="https://www.secrethitler.com/assets/Secret_Hitler_Rules.pdf"
          target="_blank"
          rel="noreferrer"
        >
          Official rules
        </a>{" "}
        ·{" "}
        <a
          href="https://creativecommons.org/licenses/by-nc-sa/4.0/"
          target="_blank"
          rel="noreferrer"
        >
          CC BY-NC-SA 4.0
        </a>
        <p>
          Liberals win with five policies or Hitler’s removal. Fascists win with
          six policies or Hitler elected Chancellor after three. Tied elections
          fail; three failed governments enact the top policy without powers.
          Veto unlocks after five Fascist policies.
        </p>
      </details>
    </Screen>
  );
}
