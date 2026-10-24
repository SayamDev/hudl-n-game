import {
  ArrowRight,
  Minus,
  Plus,
  Fingerprint,
  Timer,
  Stack,
  Check,
} from "@phosphor-icons/react";
import { motion } from "motion/react";
import { useGame } from "../store/useGame";
import { Button, Screen, Toggle } from "./ui";
import { GameArt } from "./Identity";
import builtInPacks from "../content/packs.json";
import { TeamSetup } from "./TeamSetup";
import { teamError } from "../lib/teams";
import { gameById } from "../games/registry";
export default function ClubSetup({
  onStart,
  onPlayers,
}: {
  onStart: () => void;
  onPlayers?: () => void;
}) {
  const {
    players,
    options: o,
    setOptions,
    preferences: p,
    customPacks,
  } = useGame();
  const max = Math.max(1, Math.floor((players.length - 1) / 2));
  const count = Math.min(o.imposters, max);
  const packs = [...builtInPacks, ...customPacks].filter(
    (pack) => !pack.adult || (!p.family && p.adult),
  );
  const selected = packs.filter((pack) => o.packIds.includes(pack.id));
  return (
    <Screen
      title="Set the scene."
      subtitle="One word. A few convincing liars. Your rules."
    >
      <div className="round-ticket">
        <div>
          <h2>Imposter</h2>
          <p>
            {players.length} players •{" "}
            {o.randomImposters
              ? "Surprise roles"
              : `${count} imposter${count === 1 ? "" : "s"}`}
          </p>
        </div>
        <GameArt game="imposter" />
      </div>
      {onPlayers && (
        <Button onClick={onPlayers}>
          Edit crew · {players.length} players
        </Button>
      )}
      <TeamSetup game="imposter" />
      <section className="setup-section" aria-labelledby="roles-heading">
        <div className="setup-section-title">
          <Fingerprint size={25} />
          <h2 id="roles-heading">The secret identities</h2>
        </div>
        <div className="imposter-counter">
          <div>
            <strong>Number of imposters</strong>
            <small>
              {o.randomImposters
                ? "We’ll choose a balanced number."
                : "Keep the liars outnumbered."}
            </small>
          </div>
          <div className="stepper">
            <button
              aria-label="Fewer imposters"
              disabled={o.randomImposters || count <= 1}
              onClick={() => setOptions({ imposters: count - 1 })}
            >
              <Minus size={20} />
            </button>
            <output aria-live="polite" aria-label="Number of imposters">
              {o.randomImposters ? "?" : count}
            </output>
            <button
              aria-label="More imposters"
              disabled={o.randomImposters || count >= max}
              onClick={() => setOptions({ imposters: count + 1 })}
            >
              <Plus size={20} />
            </button>
          </div>
        </div>
        <Toggle
          label="Surprise number of imposters"
          description="Let the phone deal the roles."
          checked={o.randomImposters}
          onChange={(randomImposters) => setOptions({ randomImposters })}
        />
        <div className="rule-switches">
          <Toggle
            label="Give imposters a hint"
            description="A familiar related word to help them blend in."
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
                <option value="word">Related word · easier to blend in</option>
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
        </div>
      </section>
      <section className="setup-section" aria-labelledby="packs-heading">
        <div className="setup-section-title">
          <Stack size={25} />
          <h2 id="packs-heading">Pick the conversation</h2>
          <span>{selected.length || "All"} packs</span>
        </div>
        <p className="section-description">
          Mix topics and keep playing. Unseen words come first; older words
          return after the pool is used. Grow your collection in Packs.
        </p>
        <fieldset className="pack-deck">
          <legend className="sr-only">Word packs</legend>
          {packs.map((pack, index) => {
            const checked = o.packIds.includes(pack.id);
            return (
              <label
                key={pack.id}
                className={`pack-tile ${checked ? "is-picked" : ""}`}
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() =>
                    setOptions({
                      packIds: checked
                        ? o.packIds.filter((id) => id !== pack.id)
                        : [...o.packIds, pack.id],
                    })
                  }
                />
                <span className="pack-monogram" aria-hidden="true">
                  {pack.name.slice(0, 1)}
                  <span
                    style={{ transform: `rotate(${index % 2 ? 12 : -12}deg)` }}
                  />
                </span>
                <span className="pack-tile-copy">
                  <strong>{pack.name}</strong>
                  <small>{pack.adult ? "18+" : "Play & replay"}</small>
                </span>
                <span className="pack-check" aria-hidden="true">
                  {checked && <Check size={16} weight="bold" />}
                </span>
              </label>
            );
          })}
        </fieldset>
        <p className="section-description">
          {selected.length
            ? `${selected.length} selected. Tap a pack to add or remove it.`
            : "No selection uses all available family packs."}
        </p>
      </section>
      <section className="setup-section" aria-labelledby="pace-heading">
        <div className="setup-section-title">
          <Timer size={25} />
          <h2 id="pace-heading">Find your pace</h2>
        </div>
        <fieldset>
          <legend>Discussion time</legend>
          <div className="time-options">
            {[0, 60, 120, 180, 300].map((seconds) => (
              <button
                key={seconds}
                aria-pressed={o.seconds === seconds}
                onClick={() => setOptions({ seconds })}
              >
                {o.seconds === seconds && (
                  <motion.span
                    className="time-selected"
                    layoutId="discussion-time"
                    transition={{ type: "spring", stiffness: 420, damping: 34 }}
                  />
                )}
                <span>
                  {seconds === 0 ? "No timer" : seconds / 60}
                  {seconds !== 0 && <small>min</small>}
                </span>
              </button>
            ))}
          </div>
        </fieldset>
        <div className="round-selects">
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
        </div>
      </section>
      <details className="round-rules">
        <summary>How to play Imposter</summary>
        <ol>
          {gameById("imposter").rules.map((rule) => (
            <li key={rule}>{rule}</li>
          ))}
        </ol>
      </details>
      <div className="round-launch">
        <div>
          <strong>Ready to deal?</strong>
          <small>
            {players.length} players ·{" "}
            {o.seconds === 0 ? "No timer" : `${o.seconds / 60} min discussion`}
          </small>
        </div>
        <Button
          className="primary"
          disabled={!!teamError(players, "imposter", o)}
          onClick={onStart}
        >
          Quick start
          <ArrowRight size={22} />
        </Button>
      </div>
    </Screen>
  );
}
