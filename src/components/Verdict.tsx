import { NoirIllustration } from "./NoirArt";
import { useGame } from "../store/useGame";
import { useRef, useState } from "react";
import { ArrowUp, Fingerprint } from "@phosphor-icons/react";
import { Avatar, Button } from "./ui";
import { feedback } from "../lib/feedback";
import type { Player } from "../lib/types";
/** Public group reveal. Swipe is optional; native button gives the same result without waiting. */
export function Verdict({
  player,
  caught,
  onContinue,
}: {
  player: Player;
  caught: boolean;
  onContinue: () => void;
}) {
  const noir = useGame(
    (s) =>
      s.preferences.deckStyle !== false &&
      !["classic", "club-original"].includes(s.preferences.design),
  );
  const [open, setOpen] = useState(false),
    [lift, setLift] = useState(0);
  const pointer = useRef<{ id: number; y: number } | null>(null);
  const reveal = () => {
    if (!open) {
      setOpen(true);
      setLift(0);
      feedback("success");
    }
  };
  return (
    <>
      <div className={`verdict-art ${open ? "is-open" : ""}`}>
        <div className="verdict-identity">
          <Avatar player={player} big />
        </div>
        <div
          className="verdict-envelope"
          aria-hidden="true"
          style={{ transform: open ? undefined : `translateY(${lift}px)` }}
          onPointerDown={(e) => {
            if (open) return;
            pointer.current = { id: e.pointerId, y: e.clientY };
            e.currentTarget.setPointerCapture(e.pointerId);
          }}
          onPointerMove={(e) => {
            if (pointer.current?.id === e.pointerId)
              setLift(
                Math.max(-90, Math.min(0, e.clientY - pointer.current.y)),
              );
          }}
          onPointerUp={(e) => {
            if (
              pointer.current?.id === e.pointerId &&
              e.clientY - pointer.current.y < -45
            )
              reveal();
            pointer.current = null;
            setLift(0);
          }}
          onPointerCancel={() => {
            pointer.current = null;
            setLift(0);
          }}
        >
          {noir ? (
            <div className="noir-verdict-cover">
              <NoirIllustration hero />
              <span>
                EVERY ALIBI
                <br />
                HAS A CRACK.
              </span>
            </div>
          ) : (
            <svg viewBox="0 0 240 190">
              <rect
                x="24"
                y="20"
                width="192"
                height="148"
                rx="14"
                fill="#d4fa77"
              />
              <path
                d="m24 42 96 65 96-65M24 154l70-60m122 60-70-60"
                fill="none"
                stroke="#19211c"
                strokeWidth="4"
              />
              <circle cx="120" cy="106" r="30" fill="#19211c" />
              <path
                d="m103 101 13 4-4 10-9-4zm34 0-13 4 4 10 9-4z"
                fill="#d4fa77"
              />
            </svg>
          )}
          <Fingerprint size={32} weight="bold" />
        </div>
      </div>
      {open ? (
        <div className="verdict-copy" role="status">
          <h2 className="reveal-title">
            {caught ? "THE IMPOSTER!" : "INNOCENT!"}
          </h2>
          <p>
            {caught
              ? "Caught red-handed. But there’s one last chance…"
              : "That poker face fooled everyone."}
          </p>
        </div>
      ) : (
        <p className="verdict-instruction">
          {noir
            ? "The vote is in. Swipe up on the card, or tap below."
            : "The vote is in. Swipe up on the envelope, or tap below."}
        </p>
      )}
      {open ? (
        <Button className="primary" onClick={onContinue}>
          {caught ? "One last guess" : "See results"}
        </Button>
      ) : (
        <Button className="primary" onClick={reveal}>
          <ArrowUp size={22} />
          Reveal identity
        </Button>
      )}
    </>
  );
}
