import type { GameId, GameOptions } from "../lib/types";
const illustration = `${import.meta.env.BASE_URL}art/after-hours/club-illustrations.jpg`;
/** Only illustration regions from the original generated sheet are rendered. Text and controls are real DOM. */
export function NoirIllustration({
  game = "imposter",
  hero = false,
  charadesMode,
}: {
  game?: GameId;
  hero?: boolean;
  charadesMode?: GameOptions["charadesMode"];
}) {
  const index = {
    mafia: 0,
    spy: 1,
    charades: charadesMode === "classic" ? 3 : 2,
    party: 4,
    imposter: 0,
  }[game];
  const view = hero ? "0 140 535 600" : `${50 + index * 190} 842 170 150`;
  return (
    <svg
      className={`noir-illustration ${hero ? "noir-hero-art" : ""}`}
      viewBox={view}
      aria-hidden="true"
      focusable="false"
      preserveAspectRatio="xMidYMid slice"
    >
      <image href={illustration} width="1024" height="1536" />
    </svg>
  );
}
