import {
  ArrowUpRight,
  ArrowRight,
  UsersThree,
  Clock,
  Detective,
  MoonStars,
  MapPin,
  HandWaving,
  ChatCircleDots,
} from "@phosphor-icons/react";
import { lobbyGames } from "../games/registry";
import { useGame } from "../store/useGame";
import type { GameId } from "../lib/types";
const icons = {
  imposter: Detective,
  mafia: MoonStars,
  spy: MapPin,
  charades: HandWaving,
  party: ChatCircleDots,
};
export function ClubLogo() {
  return (
    <span className="club-logo">
      <svg viewBox="0 0 48 48" aria-hidden="true">
        <path d="M9 8v32h9V28h12v12h9V8h-9v12H18V8Z" fill="currentColor" />
        <path d="m20 20 8 8m0-8-8 8" stroke="var(--bg)" strokeWidth="3" />
      </svg>
      <span>
        hudl<span className="club-logo-sub">n game</span>
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
  return (
    <div className="club-home">
      <section className="club-intro">
        <h1 tabIndex={-1}>
          Good company.
          <br />
          <span>Bad alibis.</span>
        </h1>
        <p>One phone. A room full of suspects.</p>
      </section>
      <section className="club-games" aria-label="Choose a party game">
        {lobbyGames.map((g, i) => {
          const Icon = icons[g.id];
          return (
            <article
              key={g.lobbyKey}
              className={`club-game club-${g.id} ${i === 0 ? "club-featured" : ""}`}
            >
              <div className="club-game-title">
                <Icon size={28} weight="bold" aria-hidden="true" />
                <h2>{g.name}</h2>
              </div>
              <p>{g.subtitle}</p>
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
              {i === 0 && (
                <div className="club-secret-art" aria-hidden="true">
                  <div className="club-card-back" />
                  <div className="club-card-front">
                    <Detective weight="fill" />
                    <span>
                      TRUST
                      <br />
                      NOBODY.
                    </span>
                  </div>
                </div>
              )}
              <div className="club-game-actions">
                <button
                  className="club-play"
                  onClick={() => {
                    if (g.charadesMode)
                      useGame
                        .getState()
                        .setOptions({ charadesMode: g.charadesMode });
                    choose(g.id);
                  }}
                >
                  Let’s play
                  <ArrowUpRight size={22} />
                </button>
                <button
                  className="club-rules"
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
            </article>
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
