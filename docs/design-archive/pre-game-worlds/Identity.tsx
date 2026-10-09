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
  const variant = hash % 5;
  const accessory = Math.floor(hash / 5) % 4;
  const bodies = [
    "M14 5H66L76 27V61L59 76H21L4 59V27Z",
    "M16 9H64V24H76V66H4V24H16Z",
    "M40 3 76 26 68 69 40 77 12 69 4 26Z",
    "M9 4H58L76 22V76H22L4 58V9Z",
    "M17 3H63L77 40 63 77H17L3 40Z",
  ];
  return (
    <svg
      className={`identity ${large ? "identity-large" : ""}`}
      viewBox="0 0 80 80"
      aria-hidden="true"
      data-identity={hash}
    >
      <path d={bodies[variant]} fill={color} />
      {accessory === 1 && (
        <path
          d="M5 17 62 74M17 5 75 62"
          stroke="#19211c"
          strokeWidth="4"
          opacity=".22"
        />
      )}
      {accessory === 2 && <path d="M5 13H75V24H5Z" fill="#19211c" />}
      {accessory === 3 && <path d="m40 6 6 10-6 10-6-10Z" fill="#19211c" />}
      <g className="identity-eyes" fill="#19211c">
        {variant === 0 ? (
          <>
            <path d="M12 29h56v23H12Z" />
            <path d="m21 35 12 3v6H21m26-6 12-3v9H47" fill={color} />
          </>
        ) : variant === 1 ? (
          <>
            <circle cx="25" cy="40" r="14" />
            <circle cx="55" cy="40" r="14" />
            <path d="M36 38h9" stroke="#19211c" strokeWidth="5" />
            <circle cx="25" cy="40" r="5" fill={color} />
            <path d="M49 38h12v5H49Z" fill={color} />
          </>
        ) : variant === 2 ? (
          <>
            <path d="m11 31 25 5-5 17H17Zm33 5 25-5-6 22H49Z" />
            <path d="m23 39 6 1m23 0 6-1" stroke={color} strokeWidth="4" />
          </>
        ) : variant === 3 ? (
          <>
            <path d="M11 30h29v25H11Z" />
            <path
              d="m47 35 17 8-17 8"
              fill="none"
              stroke="#19211c"
              strokeWidth="6"
            />
            <path d="M21 38h9v9h-9Z" fill={color} />
          </>
        ) : (
          <>
            <path d="M12 29h56v25H12Z" />
            <circle cx="40" cy="41" r="12" fill={color} />
            <circle cx="40" cy="41" r="6" />
          </>
        )}
      </g>
      <path
        d={
          variant === 0
            ? "M29 63h22"
            : variant === 1
              ? "m31 60 9 6 9-6"
              : variant === 2
                ? "m29 65 22-6"
                : variant === 3
                  ? "M29 63h8m6 0h8"
                  : "M34 62h12"
        }
        fill="none"
        stroke="#19211c"
        strokeWidth="4"
        strokeLinecap="round"
      />
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
