import { Trophy } from "@phosphor-icons/react";
import { Avatar } from "./ui";
import type { Player } from "../lib/types";
export function WinnerArtwork({ players }: { players: Player[] }) {
  return (
    <div className="winner-artwork" aria-hidden="true">
      <svg className="victory-burst" viewBox="0 0 440 260" focusable="false">
        {Array.from({ length: 12 }, (_, i) => (
          <g
            key={i}
            style={{
              transform: `rotate(${i * 30}deg)`,
              transformOrigin: "220px 130px",
            }}
          >
            <path
              className="victory-ray"
              d="M220 12v18m-5 10 10 4"
              fill="none"
              stroke={i % 2 ? "#b88ae9" : "#d5fa43"}
              strokeWidth="3"
            />
          </g>
        ))}
      </svg>
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
