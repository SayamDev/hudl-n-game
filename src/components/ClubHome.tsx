import { AfterHoursHome } from "./AfterHours";
import {
  ArrowUpRight,
  ArrowRight,
  UsersThree,
  Clock,
} from "@phosphor-icons/react";
import OriginalHome, { ClubLogo as OriginalLogo } from "./ClubHomeOriginal";
import { GameArt, Identity } from "./Identity";
import { motion, useReducedMotion } from "motion/react";
import { games } from "../games/registry";
import { useGame } from "../store/useGame";
import type { GameId } from "../lib/types";
export function ClubLogo() {
  const design = useGame((s) => s.preferences.design);
  if (design === "club-original") return <OriginalLogo />;
  return (
    <span className="club-logo">
      <span>
        hudl
        <span className="club-logo-sub">
          <i>n</i> game<span className="logo-period">.</span>
        </span>
      </span>
    </span>
  );
}
export default function ClubHome({
  choose,
  rules,
  crew,
}: {
  choose: (id: GameId) => void;
  rules: (id: GameId) => void;
  crew: () => void;
}) {
  const players = useGame((s) => s.players);
  const design = useGame((s) => s.preferences.design);
  const refined = useGame((s) => s.preferences.deckStyle !== false);
  const reduce = useReducedMotion();
  if (design === "club-original")
    return <OriginalHome choose={choose} rules={rules} crew={crew} />;
  if (refined)
    return <AfterHoursHome choose={choose} rules={rules} crew={crew} />;
  return (
    <div className="club-home">
      <section className="club-intro">
        <div>
          <h1 tabIndex={-1}>
            Good company.
            <br />
            <span>Bad alibis.</span>
          </h1>
          <p>One phone. A room full of suspects.</p>
        </div>
        <div className="alibi-lineup" aria-hidden="true">
          <Identity seed="🦊" />
          <Identity seed="🐸" />
          <Identity seed="🐙" />
        </div>
      </section>
      <section className="club-games" aria-label="Choose a party game">
        {games.map((g, i) => {
          return (
            <motion.article
              initial={reduce ? false : { y: 18, rotate: i % 2 ? 1 : -1 }}
              whileInView={{ y: 0, rotate: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{
                duration: 0.5,
                delay: 0,
                ease: [0.16, 1, 0.3, 1],
              }}
              key={g.id}
              className={`club-game club-${g.id} ${i === 0 ? "club-featured" : ""}`}
            >
              <div className="club-game-title">
                {i !== 0 && <GameArt game={g.id} onScroll />}
                <h2>{g.name}</h2>
              </div>
              <p>
                {g.id === "charades"
                  ? "Heads Up or classic Charades. Pick your stage."
                  : g.subtitle}
              </p>
              <div className="club-meta">
                <span>
                  <UsersThree size={15} />
                  {g.min}–20 players
                </span>
                <span>
                  <Clock size={15} />
                  {g.duration}
                </span>
              </div>
              {i === 0 && <GameArt game={g.id} onScroll />}
              <div className="club-game-actions">
                <button
                  className="club-play"
                  onClick={() => {
                    if (g.id === "charades")
                      useGame
                        .getState()
                        .setOptions({ charadesMode: "heads-up" });
                    choose(g.id);
                  }}
                >
                  Let’s play
                  <ArrowUpRight size={22} />
                </button>
                <button
                  className="club-rules"
                  aria-label={`How to play ${g.name}`}
                  onClick={() => rules(g.id)}
                >
                  How to play
                </button>
                {g.id === "charades" && (
                  <button
                    className="club-rules charades-launch"
                    onClick={() => {
                      useGame
                        .getState()
                        .setOptions({ charadesMode: "classic" });
                      choose("charades");
                    }}
                  >
                    Play Charades <ArrowRight size={18} />
                  </button>
                )}
              </div>
            </motion.article>
          );
        })}
      </section>
      <button className="club-crew" onClick={crew}>
        <UsersThree size={26} />
        <span>
          <strong>
            {players.length
              ? `${players.length} in your crew`
              : "Get the crew together"}
          </strong>
          <small>
            {players.length
              ? "Your people are saved. Edit the lineup."
              : "Add names once. Keep the night going."}
          </small>
        </span>
        <ArrowRight size={23} />
      </button>
    </div>
  );
}
