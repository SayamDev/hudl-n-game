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
      viewBox={`${index % 2} ${Math.floor((index % 4) / 2)} 1 1`}
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
      data-portrait={index}
    >
      <image
        href={`${import.meta.env.BASE_URL}art/after-hours/portraits-${Math.floor(index / 4) + 1}.jpg`}
        width="2"
        height="2"
      />
    </svg>
  );
}
export function WorldArt({
  world,
}: {
  world:
    | "imposter"
    | "mafia"
    | "spy"
    | "heads-up"
    | "charades"
    | "party"
    | "secret-hitler";
}) {
  if (world === "spy" || world === "secret-hitler")
    return (
      <img
        className="world-illustration"
        data-world-art={world}
        src={`${import.meta.env.BASE_URL}art/after-hours/${world === "spy" ? "spyfall" : "secret-hitler"}.webp`}
        alt=""
        aria-hidden="true"
        style={{ objectFit: "cover" }}
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
