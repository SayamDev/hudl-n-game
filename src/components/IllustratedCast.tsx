import { avatars } from "../store/useGame";
export function portraitIndex(seed: string) {
  const known = avatars.indexOf(seed);
  return known >= 0
    ? known
    : Array.from(seed).reduce((n, c) => (n * 31 + c.codePointAt(0)!) >>> 0, 7) %
        20;
}
export function IllustratedPortrait({ seed }: { seed: string }) {
  const index = portraitIndex(seed);
  return (
    <svg
      className="illustrated-portrait"
      viewBox={`${(index % 5) * 280} ${Math.floor(index / 5) * 280} 280 280`}
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
      data-portrait={index}
    >
      <image
        href={`${import.meta.env.BASE_URL}art/after-hours/character-atlas.jpg`}
        width="1400"
        height="1120"
      />
    </svg>
  );
}
export function WorldArt({
  world,
}: {
  world: "imposter" | "mafia" | "spy" | "heads-up" | "charades" | "party";
}) {
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
      className="world-illustration"
      viewBox={`${(index % 3) * 512} ${Math.floor(index / 3) * 512} 512 512`}
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
      data-world-art={world}
    >
      <image
        href={`${import.meta.env.BASE_URL}art/after-hours/world-atlas.jpg`}
        width="1536"
        height="1024"
      />
    </svg>
  );
}
