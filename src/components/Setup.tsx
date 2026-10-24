import { friendsTopics, partyIntensity } from "../lib/party-pool";
import ClubSetup from "./ClubSetup";
import { TeamSetup } from "./TeamSetup";
import { teamError } from "../lib/teams";
import { useState } from "react";
import type { ReactNode } from "react";
import { Reorder, useDragControls } from "motion/react";
import {
  ArrowRight,
  UsersThree,
  Plus,
  Shuffle,
  SignOut,
  ArrowFatUp,
  ArrowFatDown,
  DotsSixVertical,
} from "@phosphor-icons/react";
import { useGame, avatars, colors } from "../store/useGame";
import { shuffle } from "../lib/logic";
import { Avatar, Button, Screen, Toggle } from "./ui";
import { gameById, gamePresentation } from "../games/registry";
import builtInPacks from "../content/packs.json";
import type { GameId, Player } from "../lib/types";
function CrewItem({
  player,
  children,
}: {
  player: Player;
  children: ReactNode;
}) {
  const controls = useDragControls();
  return (
    <Reorder.Item
      value={player}
      dragListener={false}
      dragControls={controls}
      layout="position"
      transition={{ layout: { duration: 0.18, ease: [0.23, 1, 0.32, 1] } }}
    >
      <button
        className="drag-handle"
        aria-label={`Drag to reorder ${player.name}. Use the adjacent arrow buttons with a keyboard.`}
        onPointerDown={(e) => controls.start(e)}
      >
        <DotsSixVertical size={20} />
      </button>
      {children}
    </Reorder.Item>
  );
}
export function Players({
  game,
  onNext,
}: {
  game: GameId;
  onNext: () => void;
}) {
  const { players, setPlayers, options } = useGame();
  const [name, setName] = useState(""),
    [error, setError] = useState("");
  const metadata = gameById(game);
  const classic = game === "charades" && options.charadesMode === "classic";
  const minimum = classic ? 4 : metadata.min;
  const maximum = metadata.max || 20;
  const add = () => {
    const n = name.trim();
    if (!n) {
      setError("Add a name first.");
      return;
    }
    if (players.some((p) => p.name.toLowerCase() === n.toLowerCase())) {
      setError("That name is taken. Add an initial or nickname.");
      return;
    }
    if (players.length >= maximum) {
      setError(`This game supports up to ${maximum} players.`);
      return;
    }
    setPlayers([
      ...players,
      {
        id: crypto.randomUUID(),
        name: n,
        avatar:
          avatars.find((avatar) => !players.some((p) => p.avatar === avatar)) ||
          avatars[players.length],
        color: colors[players.length % colors.length],
        score: 0,
      },
    ]);
    setName("");
    setError("");
  };
  const move = (i: number, delta: number) => {
    const next = [...players];
    [next[i], next[i + delta]] = [next[i + delta], next[i]];
    setPlayers(next);
  };
  return (
    <Screen
      className="crew-stage"
      title="Who’s in the huddle?"
      subtitle={`Same crew this round? Add or remove people below. ${classic ? "Charades" : metadata.name} needs ${minimum}–${maximum} players.`}
    >
      <form
        className="add-player"
        onSubmit={(e) => {
          e.preventDefault();
          add();
        }}
      >
        <label htmlFor="player-name" className="sr-only">
          Player name
        </label>
        <input
          id="player-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Add a name…"
          maxLength={24}
          autoComplete="off"
          enterKeyHint="done"
          aria-describedby={error ? "name-error" : undefined}
        />
        <Button type="submit" className="primary" aria-label="Add player">
          <Plus size={25} />
        </Button>
      </form>
      {error && (
        <p className="error" id="name-error" role="alert">
          {error}
        </p>
      )}
      {players.length === 0 ? (
        <div className="empty">
          <UsersThree size={64} weight="duotone" aria-hidden="true" />
          <h2>Every party starts with someone.</h2>
          <p>Add your crew above. We’ll remember them for next time.</p>
        </div>
      ) : (
        <>
          <Reorder.Group
            axis="y"
            values={players}
            onReorder={setPlayers}
            className="crew-list"
          >
            {players.map((p, i) => (
              <CrewItem key={p.id} player={p}>
                <Avatar player={p} />
                <strong>{p.name}</strong>
                <div className="crew-actions">
                  <button
                    className="icon-button"
                    disabled={i === 0}
                    aria-label={`Move ${p.name} up`}
                    onClick={() => move(i, -1)}
                  >
                    <ArrowFatUp size={23} weight="fill" />
                  </button>
                  <button
                    className="icon-button"
                    disabled={i === players.length - 1}
                    aria-label={`Move ${p.name} down`}
                    onClick={() => move(i, 1)}
                  >
                    <ArrowFatDown size={23} weight="fill" />
                  </button>
                  <button
                    className="icon-button"
                    aria-label={`Remove ${p.name}`}
                    onClick={() =>
                      setPlayers(players.filter((a) => a.id !== p.id))
                    }
                  >
                    <SignOut size={24} weight="bold" />
                  </button>
                </div>
              </CrewItem>
            ))}
          </Reorder.Group>
          <Button
            className="text-button"
            onClick={() => {
              const mixed = shuffle(avatars);
              setPlayers(
                players.map((p, i) => ({
                  ...p,
                  avatar: mixed[i],
                  color: colors[i % colors.length],
                })),
              );
            }}
          >
            <Shuffle size={20} />
            Shuffle avatars
          </Button>
        </>
      )}
      <Button
        className="primary"
        disabled={players.length < minimum || players.length > maximum}
        onClick={onNext}
        data-crew-confirm="true"
      >
        {players.length < minimum
          ? `Add ${minimum - players.length} more to play`
          : `Let’s play, all ${players.length} of us`}
        <ArrowRight size={22} />
      </Button>
    </Screen>
  );
}
export function GameSettings({
  game,
  onStart,
  onPlayers,
}: {
  game: GameId;
  onStart: () => void;
  onPlayers?: () => void;
}) {
  const {
    players,
    options: o,
    setOptions,
    setPreferences,
    preferences,
    customPacks,
  } = useGame();
  if (
    game === "imposter" &&
    preferences.design !== "classic" &&
    preferences.design !== "club-original"
  )
    return <ClubSetup onStart={onStart} onPlayers={onPlayers} />;
  const meta = gameById(game);
  const packs = [...builtInPacks, ...customPacks].filter(
    (p) => !p.adult || (!preferences.family && preferences.adult),
  );
  return (
    <Screen
      title={`Let’s play ${game === "charades" && o.charadesMode === "classic" ? "Charades" : meta.name}.`}
      subtitle="Good defaults. Your kind of chaos."
    >
      {onPlayers && (
        <Button onClick={onPlayers}>
          Edit crew · {players.length} players
        </Button>
      )}
      {game !== "secret-hitler" && <TeamSetup game={game} />}
      {players.length > (meta.max || 20) && (
        <p role="alert">
          {meta.name} supports up to {meta.max} players. Edit the crew before
          starting.
        </p>
      )}
      <Button
        className="primary"
        disabled={
          players.length < meta.min ||
          players.length > (meta.max || 20) ||
          (game !== "secret-hitler" && !!teamError(players, game, o)) ||
          (game === "charades" &&
            o.charadesMode === "classic" &&
            players.length < 4)
        }
        onClick={onStart}
      >
        Quick start
        <ArrowRight size={22} />
      </Button>
      {game === "charades" &&
        o.charadesMode === "classic" &&
        players.length < 4 && (
          <p role="status">
            Classic Charades needs at least four players for two teams. Add
            another player in Crew.
          </p>
        )}
      <details className="settings-details" open>
        {game === "charades" && (
          <>
            <label>
              Rounds per team
              <select
                value={o.rounds || 1}
                onChange={(e) => setOptions({ rounds: Number(e.target.value) })}
              >
                {[1, 2, 3, 4, 5, 10].map((n) => (
                  <option key={n} value={n}>
                    {n} {n === 1 ? "round" : "rounds"}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Turn timer
              <select
                value={o.seconds === 0 ? 0 : 60}
                onChange={(e) =>
                  setOptions({ seconds: Number(e.target.value) })
                }
              >
                <option value={60}>60 seconds</option>
                <option value={0}>No timer</option>
              </select>
            </label>
          </>
        )}

        <summary>Make it your game</summary>
        {game === "imposter" && (
          <>
            <label>
              Number of imposters
              <select
                value={Math.min(
                  o.imposters,
                  Math.floor((players.length - 1) / 2),
                )}
                onChange={(e) =>
                  setOptions({ imposters: Number(e.target.value) })
                }
              >
                {Array.from(
                  { length: Math.floor((players.length - 1) / 2) },
                  (_, i) => (
                    <option key={i} value={i + 1}>
                      {i + 1}
                    </option>
                  ),
                )}
              </select>
            </label>
            <Toggle
              label="Surprise number of imposters"
              checked={o.randomImposters}
              onChange={(randomImposters) => setOptions({ randomImposters })}
            />
            <Toggle
              label="Give imposters a hint"
              checked={o.hint}
              onChange={(hint) => setOptions({ hint })}
            />
            {o.hint && !o.chaos && (
              <label className="hint-style">
                Hint style
                <select
                  value={o.hintStyle || "word"}
                  onChange={(e) =>
                    setOptions({
                      hintStyle: e.target.value as "word" | "category",
                    })
                  }
                >
                  <option value="word">
                    Related word · easier to blend in
                  </option>
                  <option value="category">Category only · harder</option>
                </select>
              </label>
            )}
            <Toggle
              label="Chaos mode"
              description="Imposters know their role and get a decoy word."
              checked={o.chaos}
              onChange={(chaos) => setOptions({ chaos })}
            />
          </>
        )}
        {["imposter", "charades"].includes(game) && (
          <fieldset>
            <legend>Word packs</legend>
            <div className="pack-chips">
              {packs.map((p) => (
                <label
                  key={p.id}
                  className={o.packIds.includes(p.id) ? "checked" : ""}
                >
                  <input
                    type="checkbox"
                    checked={o.packIds.includes(p.id)}
                    onChange={() =>
                      setOptions({
                        packIds: o.packIds.includes(p.id)
                          ? o.packIds.filter((id) => id !== p.id)
                          : [...o.packIds, p.id],
                      })
                    }
                  />
                  {p.name}
                </label>
              ))}
            </div>
            <small>No packs selected? We’ll use all family packs.</small>
          </fieldset>
        )}
        {["imposter", "mafia"].includes(game) && (
          <>
            <label>
              Discussion time
              <select
                value={o.seconds}
                onChange={(e) =>
                  setOptions({ seconds: Number(e.target.value) })
                }
              >
                <option value={0}>No timer</option>
                <option value={60}>1 minute</option>
                <option value={120}>2 minutes</option>
                <option value={180}>3 minutes</option>
                <option value={300}>5 minutes</option>
                <option value={480}>8 minutes</option>
              </select>
            </label>
            <label>
              Voting style
              <select
                value={o.voteMode}
                onChange={(e) =>
                  setOptions({ voteMode: e.target.value as "secret" | "point" })
                }
              >
                <option value="secret">Secret pass-and-vote</option>
                <option value="point">Out loud — tap the accused</option>
              </select>
            </label>
          </>
        )}
        {game === "mafia" && (
          <>
            <p>
              Suggested: {Math.max(1, Math.floor(players.length / 4))} Mafia.
              Special roles fill the remaining seats while keeping at least one
              Villager.
            </p>
            {(
              [
                "doctor",
                "detective",
                "jester",
                "bodyguard",
                "vigilante",
                "showRoles",
                "manual",
              ] as const
            ).map((key) => (
              <Toggle
                key={key}
                label={
                  {
                    doctor: "Doctor",
                    detective: "Detective",
                    jester: "Jester: wins if voted out",
                    bodyguard: "Bodyguard: protects at their own risk",
                    vigilante: "Vigilante: one shot per game",
                    showRoles: "Reveal eliminated roles",
                    manual: "Manual narrator mode",
                  }[key]
                }
                checked={o[key]}
                onChange={(v) => setOptions({ [key]: v })}
              />
            ))}
          </>
        )}
        {game === "party" && (
          <>
            <p>
              Friends 18+ has savage, chaotic and flirty questions. After Dark
              focuses on dating. Anyone can skip a prompt.
            </p>
            <Toggle
              label="Enable 18+ prompts for this adult group"
              checked={preferences.adult && !preferences.family}
              onChange={(adult) =>
                setPreferences({
                  adult,
                  family: adult ? false : preferences.family,
                })
              }
            />

            <label>
              Play style
              <select
                value={o.partyMode}
                onChange={(e) =>
                  setOptions({
                    partyMode: e.target.value as "likely" | "takes",
                  })
                }
              >
                <option value="likely">Most Likely To</option>
                <option value="takes">Hot Takes</option>
              </select>
            </label>
            <label>
              Intensity
              <select
                value={partyIntensity(o, preferences)}
                onChange={(e) =>
                  setOptions({
                    intensity: e.target.value as
                      | "Family"
                      | "Friends"
                      | "Spicy"
                      | "After Dark 18+"
                      | "Friends 18+",
                  })
                }
              >
                <option>Family</option>
                {!preferences.family && <option>Friends</option>}
                <option disabled={preferences.family || !preferences.adult}>
                  Spicy
                </option>
                {o.partyMode === "likely" && (
                  <>
                    <option disabled={preferences.family || !preferences.adult}>
                      Friends 18+
                    </option>
                    <option disabled={preferences.family || !preferences.adult}>
                      After Dark 18+
                    </option>
                  </>
                )}
              </select>
            </label>
            {partyIntensity(o, preferences) === "Friends 18+" && (
              <label>
                Friends 18+ topic
                <select
                  value={o.friendsTopic || "All topics"}
                  onChange={(e) => setOptions({ friendsTopic: e.target.value })}
                >
                  <option>All topics</option>
                  {friendsTopics.map((topic) => (
                    <option key={topic}>{topic}</option>
                  ))}
                </select>
              </label>
            )}
          </>
        )}
        <label>
          Winner points per game
          <select
            value={o.points}
            onChange={(e) => setOptions({ points: Number(e.target.value) })}
          >
            {[1, 2, 3, 5].map((n) => (
              <option key={n}>{n}</option>
            ))}
          </select>
        </label>
      </details>
      <details>
        <summary>How to play</summary>
        <ol>
          {gamePresentation(game, o.charadesMode).rules.map((r) => (
            <li key={r}>{r}</li>
          ))}
        </ol>
      </details>
    </Screen>
  );
}
