import { Avatar } from "./ui";
import type { Player } from "../lib/types";
/** One score layout for both round results and the running leaderboard. */
export function Scoreboard({
  players,
  winners = [],
  points = 0,
}: {
  players: Player[];
  winners?: string[];
  points?: number;
}) {
  return (
    <div className="score-list" role="list" aria-label="Player scores">
      {[...players]
        .sort((a, b) => b.score - a.score)
        .map((player) => {
          const rank = players.filter((p) => p.score > player.score).length + 1;
          const won = winners.includes(player.id);
          return (
            <div
              className={`score-entry ${won ? "round-winner" : ""}`}
              role="listitem"
              key={player.id}
            >
              <span className="score-rank" aria-label={`Rank ${rank}`}>
                {rank}
              </span>
              <Avatar player={player} />
              <strong className="score-player">
                {player.name}
                {won && <small>+{points} this game</small>}
              </strong>
              <b className="score-points">
                {player.score}
                <small>pts</small>
              </b>
            </div>
          );
        })}
    </div>
  );
}
