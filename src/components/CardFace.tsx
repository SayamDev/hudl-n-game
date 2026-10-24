/** Approved decorative faces. Selection depends on the game, never a secret role. */
export type CardWorld =
  | "imposter"
  | "mafia"
  | "spy"
  | "heads-up"
  | "charades"
  | "party"
  | "secret-hitler";
export function CardFace({ world }: { world: CardWorld }) {
  if (world === "secret-hitler")
    return (
      <img
        className="card-face-art"
        src={`${import.meta.env.BASE_URL}art/after-hours/secret-hitler.webp`}
        alt=""
        aria-hidden="true"
      />
    );
  const index = [
    "imposter",
    "mafia",
    "spy",
    "heads-up",
    "charades",
    "party",
  ].indexOf(world);
  return (
    <svg
      className="card-face-art"
      viewBox={`${(index % 3) * 418} ${Math.floor(index / 3) * 627} 418 627`}
      preserveAspectRatio="none"
      aria-hidden="true"
      focusable="false"
      data-card-world={world}
    >
      <image
        href={`${import.meta.env.BASE_URL}art/after-hours/card-faces.webp`}
        width="1254"
        height="1254"
      />
    </svg>
  );
}
