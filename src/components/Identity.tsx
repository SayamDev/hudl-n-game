import { NoirIllustration } from "./NoirArt";
import { motion, useReducedMotion } from "motion/react";
import {
  Detective,
  Fingerprint,
  GlobeHemisphereWest,
  HandWaving,
  MapPin,
  HandPointing,
} from "@phosphor-icons/react";
import { avatars, useGame } from "../store/useGame";
import type { GameId } from "../lib/types";
const palette = [
  "#d4fa77",
  "#bcb0ff",
  "#76e3c7",
  "#ff9e7a",
  "#ffd65e",
  "#91c9ff",
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
  const noir = useGame(
    (s) =>
      s.preferences.deckStyle !== false &&
      !["classic", "club-original"].includes(s.preferences.design),
  );
  const emblems = [
    "spy",
    "carnival-mask",
    "bandit",
    "cyborg-face",
    "invisible-face",
    "jester-hat",
    "mustache",
    "pirate-captain",
    "robot-helmet",
    "vr-headset",
    "wizard-face",
    "woman-elf-face",
    "fox-head",
    "owl",
    "rogue",
    "domino-mask",
    "architect-mask",
    "bird-mask",
    "ninja-head",
    "raccoon-head",
  ];
  if (noir)
    return (
      <svg
        className={`identity identity-noir ${large ? "identity-large" : ""}`}
        viewBox="0 0 80 80"
        aria-hidden="true"
        data-identity={hash}
      >
        <path
          d="M12 2H68L78 12V68L68 78H12L2 68V12Z"
          fill="#111016"
          stroke={palette[hash % 6]}
          strokeWidth="2"
        />
        <image
          href={`${import.meta.env.BASE_URL}art/after-hours/alibis/${emblems[hash % 20]}.svg`}
          x="12"
          y="10"
          width="56"
          height="56"
          style={{ mixBlendMode: "screen" }}
        />
        <path d="M24 72h32" stroke={palette[hash % 6]} strokeWidth="2" />
      </svg>
    );
  const color = palette[hash % 6],
    shape = hash % 10,
    alternate = Math.floor(hash / 10) % 2;
  const silhouettes = [
    "M16 17 27 7 39 17 53 5 65 17 73 32V67L61 76H17L7 65V31Z",
    "M20 15H60L73 34V69L60 76H20L7 69V34Z",
    "M40 4 72 25V61L40 77 8 61V25Z",
    "M16 10H62L72 22V72H8V22Z",
    "M27 4H53L67 20V68L53 77H27L13 68V20Z",
    "M8 18 24 6 40 18 56 6 72 18V64L56 76 40 65 24 76 8 64Z",
    "M16 6H64V17H74V62L61 76H19L6 62V17H16Z",
    "M40 5 73 38 62 72H18L7 38Z",
    "M9 10H56L73 28V71H24L9 56Z",
    "M22 5H58L72 21V59L58 75H22L8 59V21Z",
  ];
  return (
    <svg
      className={`identity identity-character-${shape} ${large ? "identity-large" : ""}`}
      viewBox="0 0 80 80"
      aria-hidden="true"
      data-identity={hash}
    >
      <path d={silhouettes[shape]} fill={color} />
      {shape === 1 && (
        <>
          <path
            d="M17 28V14Q40-4 63 14V28"
            fill="none"
            stroke="#19211c"
            strokeWidth="6"
          />
          <rect x="5" y="28" width="10" height="23" rx="4" fill="#19211c" />
          <rect x="65" y="28" width="10" height="23" rx="4" fill="#19211c" />
        </>
      )}
      {shape === 3 && (
        <>
          <path d="M10 25 17 6H56L66 25Z" fill="#19211c" />
          <path d="M5 25H76" stroke="#19211c" strokeWidth="7" />
          <path d="M18 17H58" stroke={color} strokeWidth="4" />
        </>
      )}
      {shape === 4 && (
        <>
          <path d="M40 6V1" stroke="#19211c" strokeWidth="5" />
          <circle cx="40" cy="5" r="5" fill="#19211c" />
        </>
      )}
      {shape === 6 && <path d="M11 18h58v9H11Z" fill="#19211c" />}
      {shape === 8 && (
        <path
          d="m13 11 16 15-16 15M56 9v17h17"
          stroke="#19211c"
          strokeWidth="5"
          fill="none"
        />
      )}
      <g className="identity-eyes" fill="#19211c">
        {shape === 0 ? (
          <>
            <path d="m14 32 24 5-4 16H19Zm28 5 24-5-5 21H46Z" />
            <path d="M24 41h6m20 0h6" stroke={color} strokeWidth="4" />
          </>
        ) : shape === 1 ? (
          <>
            <rect x="18" y="34" width="17" height="17" rx="8" />
            <rect x="45" y="34" width="17" height="17" rx="8" />
            <circle cx="29" cy="39" r="3" fill="#fff8e8" />
            <circle cx="56" cy="39" r="3" fill="#fff8e8" />
          </>
        ) : shape === 2 ? (
          <>
            <path d="M12 31h56v22H12Z" />
            <path
              d="m19 38 12 8m-12 0 12-8m17 0h12m-12 8h12"
              stroke={color}
              strokeWidth="4"
            />
          </>
        ) : shape === 3 ? (
          <>
            <path d="M15 36h21v15H15Zm29 0h21v15H44Z" />
            <path d="M35 39h10" stroke="#19211c" strokeWidth="4" />
            <path d="m21 38 6 10m23-10 6 10" stroke={color} strokeWidth="3" />
          </>
        ) : shape === 4 ? (
          <>
            <circle cx="40" cy="38" r="21" />
            <circle cx="40" cy="38" r="13" fill="#fff8e8" />
            <circle cx={alternate ? 35 : 45} cy="38" r="7" />
          </>
        ) : shape === 5 ? (
          <>
            <path d="m15 34 18-6v23H15Zm32-6 18 6v17H47Z" />
            <path d="M24 36v7m32-7v7" stroke={color} strokeWidth="4" />
          </>
        ) : shape === 6 ? (
          <>
            <circle cx="25" cy="43" r="12" />
            <circle cx="55" cy="43" r="12" />
            <path d="M36 40h8" stroke="#19211c" strokeWidth="4" />
            <circle cx="25" cy="43" r="6" fill={color} />
            <circle cx="55" cy="43" r="6" fill={color} />
          </>
        ) : shape === 7 ? (
          <>
            <path d="M19 35h16v18H19Z" />
            <path
              d="m48 36 13 7-13 7"
              stroke="#19211c"
              strokeWidth="5"
              fill="none"
            />
          </>
        ) : shape === 8 ? (
          <>
            <path d="m21 36 11 3m16-3 11 3" stroke="#19211c" strokeWidth="5" />
            <path d="M23 43v8m29-8v8" stroke="#19211c" strokeWidth="5" />
          </>
        ) : (
          <>
            <path d="M16 28h48v24H16Z" />
            <path
              d="M25 34v11m8-11v11m14-11v11m8-11v11"
              stroke={color}
              strokeWidth="3"
            />
          </>
        )}
      </g>
      {shape % 3 === 0 ? (
        <path d="M26 61h28l-8 9H33Z" fill="#19211c" />
      ) : shape % 3 === 1 ? (
        <path
          d="m29 61 11 5 11-5"
          fill="none"
          stroke="#19211c"
          strokeWidth="4"
          strokeLinecap="round"
        />
      ) : (
        <path
          d="m28 64 23-6"
          stroke="#19211c"
          strokeWidth="4"
          strokeLinecap="round"
        />
      )}
      {alternate === 1 && (
        <>
          <circle cx="12" cy="61" r="5" fill="#fff8e8" />
          <path d="m60 59 8 9m-8 0 8-9" stroke="#19211c" strokeWidth="3" />
        </>
      )}
    </svg>
  );
}

export function GameArt({
  game,
  onScroll = false,
}: {
  game: GameId;
  onScroll?: boolean;
}) {
  const reduce = useReducedMotion();
  const noir = useGame(
    (s) =>
      s.preferences.deckStyle !== false &&
      !["classic", "club-original"].includes(s.preferences.design),
  );
  if (noir)
    return (
      <motion.div
        className={`game-emblem noir-game-emblem game-emblem-${game}`}
        aria-hidden="true"
        initial={false}
        whileInView={reduce ? {} : { transform: "rotate(0deg)" }}
        viewport={{ once: true }}
      >
        <NoirIllustration game={game} hero={game === "imposter"} />
      </motion.div>
    );

  return (
    <motion.div
      className={`game-emblem game-emblem-${game}`}
      aria-hidden="true"
      initial={
        onScroll && !reduce
          ? { transform: "translateY(18px) rotate(-10deg)" }
          : false
      }
      whileInView={
        onScroll ? { transform: "translateY(0) rotate(0deg)" } : undefined
      }
      viewport={{ once: true, amount: 0.5 }}
      transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
    >
      {game === "imposter" ? (
        <>
          <span className="suspect-cast">
            <Identity seed="🦊" />
            <Identity seed="🐸" />
            <Identity seed="🐙" />
          </span>
          <span className="emblem-censor">?</span>
        </>
      ) : game === "mafia" ? (
        <>
          <span className="mafia-moon" />
          <Detective weight="fill" />
        </>
      ) : game === "spy" ? (
        <>
          <span className="spy-orbit" />
          <GlobeHemisphereWest weight="regular" />
          <MapPin className="spy-pin" weight="fill" />
        </>
      ) : game === "charades" ? (
        <>
          <span className="stage-spotlight" />
          <HandWaving weight="fill" />
          <span className="stage-cue">
            ACT
            <br />
            IT OUT
          </span>
        </>
      ) : (
        <>
          <HandPointing weight="fill" />
          <span className="party-call">YOU!</span>
        </>
      )}
    </motion.div>
  );
}
