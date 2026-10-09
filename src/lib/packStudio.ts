import packs from "../content/packs.json";
import { freshOrder } from "./variety";
export const mixThemes = [
  {
    id: "snacks",
    name: "Snack attack",
    description: "Food worth fighting over.",
    packs: ["food"],
  },
  {
    id: "screen",
    name: "Screen time",
    description: "Movies, games and big opinions.",
    packs: ["movies-and-tv", "gaming", "music"],
  },
  {
    id: "holiday",
    name: "Out of office",
    description: "Places, holidays, questionable plans.",
    packs: ["on-holiday", "places"],
  },
  {
    id: "wild",
    name: "Wild company",
    description: "Animals with main-character energy.",
    packs: ["animals", "superpowers"],
  },
  {
    id: "anything",
    name: "Anything goes",
    description: "A little of everything. All family-friendly.",
    packs: [],
  },
];
export function makeOfflineMix(
  id: string,
  count: number,
  previous: string[] = [],
) {
  const theme = mixThemes.find((t) => t.id === id) || mixThemes[0];
  const pool = packs
    .filter(
      (p) => !p.adult && (!theme.packs.length || theme.packs.includes(p.id)),
    )
    .flatMap((p) => p.words);
  return {
    name: theme.name,
    words: freshOrder(pool, previous).slice(0, count),
    adult: false,
  };
}
