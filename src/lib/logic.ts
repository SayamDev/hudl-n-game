import LZString from "lz-string";
import type { Pack, Player, GameOptions } from "./types";
export function shuffle<T>(items: T[], random = Math.random): T[] {
  const a = [...items];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
export function assignRoles(
  players: Player[],
  game: string,
  options: GameOptions,
  random = Math.random,
) {
  const order = shuffle(players, random);
  const roles: Record<string, string> = {};
  order.forEach(
    (p) =>
      (roles[p.id] =
        game === "mafia" ? "Villager" : game === "spy" ? "Local" : "Crew"),
  );
  if (game === "mafia") {
    const count = Math.max(1, Math.floor(players.length / 4));
    order.slice(0, count).forEach((p) => (roles[p.id] = "Mafia"));
    const special = [
      options.doctor && "Doctor",
      options.detective && "Detective",
      options.jester && "Jester",
      options.bodyguard && "Bodyguard",
      options.vigilante && "Vigilante",
    ].filter(Boolean) as string[];
    special
      .slice(0, Math.max(0, players.length - count - 1))
      .forEach((r, i) => (roles[order[count + i].id] = r));
  } else {
    const max = Math.max(1, Math.floor((players.length - 1) / 2));
    const n =
      game === "spy"
        ? 1
        : options.randomImposters
          ? 1 + Math.floor(random() * max)
          : Math.min(max, Math.max(1, options.imposters));
    order
      .slice(0, n)
      .forEach((p) => (roles[p.id] = game === "spy" ? "Spy" : "Imposter"));
  }
  return roles;
}
export function resolveVotes(votes: Record<string, string>) {
  const counts: Record<string, number> = {};
  Object.values(votes).forEach((id) => (counts[id] = (counts[id] || 0) + 1));
  const max = Math.max(0, ...Object.values(counts));
  const leaders = Object.keys(counts).filter((k) => counts[k] === max);
  return {
    counts,
    winner: leaders.length === 1 ? leaders[0] : null,
    tied: leaders.length > 1,
  };
}
export function mafiaWinner(alive: string[], roles: Record<string, string>) {
  const mafia = alive.filter((id) => roles[id] === "Mafia").length;
  return mafia === 0
    ? "Village"
    : mafia >= alive.length - mafia
      ? "Mafia"
      : null;
}
export function resolveNight(
  alive: string[],
  roles: Record<string, string>,
  actions: Record<string, string>,
) {
  const dead = new Set<string>();
  const victim = actions.Mafia;
  if (victim && victim !== actions.Doctor) {
    if (victim === actions.Bodyguard) {
      const guard = alive.find((id) => roles[id] === "Bodyguard");
      if (guard) dead.add(guard);
    } else dead.add(victim);
  }
  if (actions.Vigilante && actions.Vigilante !== actions.Doctor)
    dead.add(actions.Vigilante);
  return alive.filter((id) => dead.has(id));
}
export const normalize = (s: string) =>
  s
    .trim()
    .toLocaleLowerCase()
    .replace(/[^\p{L}\p{N}]/gu, "");
export function validatePack(value: unknown): Pack {
  if (!value || typeof value !== "object")
    throw Error("This pack link is not valid.");
  const p = value as Partial<Pack>;
  if (
    typeof p.name !== "string" ||
    !p.name.trim() ||
    p.name.length > 50 ||
    !Array.isArray(p.words) ||
    p.words.length < 6 ||
    p.words.length > 200 ||
    p.words.some((w) => typeof w !== "string" || !w.trim() || w.length > 60)
  )
    throw Error("Use a name and 6-200 words, each under 60 characters.");
  const words = [...new Set(p.words.map((w) => w.trim()))];
  if (words.length < 6) throw Error("Add at least six different words.");
  return {
    id: crypto.randomUUID(),
    name: p.name.trim(),
    words,
    adult: !!p.adult,
  };
}
export function encodePack(pack: Pack) {
  return LZString.compressToEncodedURIComponent(
    JSON.stringify({ name: pack.name, words: pack.words, adult: pack.adult }),
  );
}
export function decodePack(encoded: string) {
  if (encoded.length > 16000) throw Error("This pack link is too large.");
  const decoded = LZString.decompressFromEncodedURIComponent(encoded);
  if (!decoded || decoded.length > 30000)
    throw Error("This pack link could not be read.");
  return validatePack(JSON.parse(decoded));
}
