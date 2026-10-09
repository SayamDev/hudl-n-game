import { useReducedMotion } from "motion/react";
import {
  Detective,
  Fingerprint,
  GlobeHemisphereWest,
  DeviceMobile,
  HandPointing,
  UsersThree,
} from "@phosphor-icons/react";
import { avatars } from "../store/useGame";
import type { GameId } from "../lib/types";
const palette = [
  "#d4fa77",
  "#dacdeb",
  "#c9e4d7",
  "#f0d0b3",
  "#cbdcf0",
  "#ffa38d",
];
export function Identity({
  seed,
  large = false,
}: {
  seed: string;
  large?: boolean;
}) {
  const known = avatars.indexOf(seed);
  const hash =
    known >= 0
      ? known
      : Array.from(seed).reduce(
          (n, c) => (n * 31 + c.codePointAt(0)!) >>> 0,
          7,
        );
  const n = hash % 6;
  const color = palette[n];
  const variant = (hash + Math.floor(hash / 6)) % 4;
  return (
    <svg
      className={`identity ${large ? "identity-large" : ""}`}
      viewBox="0 0 80 80"
      aria-hidden="true"
      data-identity={hash}
    >
      <rect
        x="3"
        y="3"
        width="74"
        height="74"
        rx={variant === 0 ? 37 : variant === 1 ? 16 : 25}
        fill={color}
      />
      {variant === 2 && (
        <path d="M3 28 28 3h18L3 46Z" fill="#19211c" opacity=".15" />
      )}
      <path
        d={
          variant === 1
            ? "M15 28h50v27H15Z"
            : variant === 3
              ? "M13 32 40 24 67 32 61 53H19Z"
              : "M13 30h54v18l-9 9H22l-9-9Z"
        }
        fill="#19211c"
      />
      <g className="identity-eyes" fill={color}>
        <path
          d={
            variant === 0
              ? "M22 38h13v6H22Z"
              : variant === 1
                ? "m22 38 13-3v9H22Z"
                : "M23 35h11v12H23Z"
          }
        />
        <path d={variant === 3 ? "M46 38h13v5H46Z" : "M46 35h11v12H46Z"} />
      </g>
      <path
        d={
          variant === 2
            ? "M32 61h16"
            : variant === 1
              ? "m35 62 10-3"
              : "M37 61h6"
        }
        fill="none"
        stroke="#19211c"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <path d={`M${12 + n * 5} 13h8`} stroke="#19211c" strokeWidth="3" />
    </svg>
  );
}
const glyphs = {
  imposter: Fingerprint,
  mafia: Detective,
  spy: GlobeHemisphereWest,
  charades: DeviceMobile,
  party: HandPointing,
};
export function GameArt({ game }: { game: GameId }) {
  const Glyph = glyphs[game];
  const reduce = useReducedMotion();
  return (
    <div
      className={`deck-art deck-art-${game} ${reduce ? "motion-off" : ""}`}
      aria-hidden="true"
    >
      <div className="deck-art-shadow" />
      <div className="deck-art-face">
        <Glyph weight="duotone" />
        <span className="deck-art-detail">
          {game === "imposter" ? (
            "?"
          ) : game === "mafia" ? (
            <UsersThree weight="fill" />
          ) : game === "spy" ? (
            <span className="radar-dot" />
          ) : game === "charades" ? (
            "GO!"
          ) : (
            "YOU"
          )}
        </span>
      </div>
    </div>
  );
}
