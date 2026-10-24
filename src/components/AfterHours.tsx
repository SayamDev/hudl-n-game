import { NoirIllustration } from "./NoirArt";
import { Identity } from "./Identity";
import { motion, useReducedMotion } from "motion/react";
import {
  ArrowUpRight,
  ArrowRight,
  UsersThree,
  Clock,
} from "@phosphor-icons/react";
import { useGame } from "../store/useGame";
import { lobbyGames } from "../games/registry";
import type { GameId } from "../lib/types";

export function AfterHoursHome({
  choose,
  rules,
  crew,
}: {
  choose: (id: GameId) => void;
  rules: (id: GameId) => void;
  crew: () => void;
}) {
  const players = useGame((s) => s.players),
    reduce = useReducedMotion();
  return (
    <div className="after-hours-home">
      <section className="night-intro">
        <h1 tabIndex={-1}>
          Good company.
          <br />
          <em>Bad alibis.</em>
        </h1>
        <p>One phone. A room full of suspects.</p>
        <div className="alibi-lineup night-alibis" aria-hidden="true">
          <Identity seed="🦊" />
          <Identity seed="🐸" />
          <Identity seed="🐙" />
        </div>
      </section>
      <section className="night-games" aria-label="Choose a party game">
        {lobbyGames.map((g, i) => (
          <motion.article
            key={g.lobbyKey}
            className={`night-game night-${g.id} ${g.charadesMode === "classic" ? "night-silent-charades" : ""} ${i === 0 ? "night-featured" : ""}`}
            initial={false}
            whileInView={reduce ? {} : { transform: "translateY(0px)" }}
            viewport={{ once: true, amount: 0.2 }}
          >
            <motion.div
              className="night-art"
              initial={
                reduce
                  ? false
                  : {
                      transform:
                        i === 0
                          ? "rotate(-8deg) translateY(14px)"
                          : "translateY(12px)",
                    }
              }
              whileInView={{ transform: "rotate(0deg) translateY(0px)" }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ type: "spring", duration: 0.65, bounce: 0.16 }}
            >
              <NoirIllustration game={g.id} hero={i === 0} />
            </motion.div>
            <div className="night-game-copy">
              <h2>{g.name}</h2>
              <p>{g.subtitle}</p>
              <div className="night-meta">
                <span>
                  <UsersThree size={14} />
                  {g.min}–20
                </span>
                <span>
                  <Clock size={14} />
                  {g.duration}
                </span>
              </div>
              <div className="night-actions">
                <button
                  className="night-play"
                  aria-label={
                    g.charadesMode === "classic" ? "Play Charades" : undefined
                  }
                  onClick={() => {
                    if (g.id === "charades")
                      useGame
                        .getState()
                        .setOptions({ charadesMode: g.charadesMode });
                    choose(g.id);
                  }}
                >
                  {g.charadesMode === "classic"
                    ? "Play Charades"
                    : "Let’s play"}{" "}
                  <ArrowUpRight size={21} />
                </button>
                <button
                  className="night-rules"
                  aria-label={`How to play ${g.name}`}
                  onClick={() => {
                    if (g.charadesMode)
                      useGame
                        .getState()
                        .setOptions({ charadesMode: g.charadesMode });
                    rules(g.id);
                  }}
                >
                  How to play
                </button>
              </div>
            </div>
          </motion.article>
        ))}
      </section>
      <button className="night-crew" onClick={crew}>
        <UsersThree size={25} />
        <span>
          <strong>
            {players.length
              ? `${players.length} in your crew`
              : "Bring your people"}
          </strong>
          <small>
            {players.length
              ? "Same crew? New alibis."
              : "Add names. Make a night of it."}
          </small>
        </span>
        <ArrowRight size={22} />
      </button>
    </div>
  );
}
export function RoundRail({ phase }: { phase: string }) {
  const index =
    phase === "peek" ? 0 : phase === "discuss" ? 1 : phase === "vote" ? 2 : 3;
  return (
    <div
      className="round-rail"
      aria-label={`Round progress: ${["Roles", "Clues", "Accuse", "Reveal"][index]}`}
    >
      {["Roles", "Clues", "Accuse", "Reveal"].map((label, i) => (
        <span
          key={label}
          className={i === index ? "is-current" : i < index ? "is-done" : ""}
        >
          {i === index && (
            <motion.i
              layoutId="round-marker"
              transition={{ type: "spring", duration: 0.35, bounce: 0 }}
            />
          )}
          <span>{label}</span>
        </span>
      ))}
    </div>
  );
}
