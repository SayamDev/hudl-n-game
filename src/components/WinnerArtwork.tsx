import { Trophy } from "@phosphor-icons/react";
import { Avatar } from "./ui";
import type { Player } from "../lib/types";
export function WinnerArtwork({ players }: { players: Player[] }) {
  return (
    <div className="winner-artwork" aria-hidden="true">
      <span className="winner-ticket winner-ticket-back">
        <span>hudl n game</span>
      </span>
      <span className="winner-ticket winner-ticket-front">
        <span className="winner-stamp">
          <Trophy weight="fill" size={26} />
        </span>
        <span className="winner-cast">
          {players.slice(0, 3).map((p) => (
            <Avatar key={p.id} player={p} big />
          ))}
        </span>
        <span className="winner-ticket-label">
          {players.length ? "THE WINNING ALIBI" : "THAT’S A WRAP"}
        </span>
      </span>
    </div>
  );
}
