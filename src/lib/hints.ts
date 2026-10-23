import hints from "../content/hints.json";
const words: Record<string, string> = hints;
/** Familiar associations, authored for the starter vocabulary. Never manufacture a clue for an unknown custom word. */
export function hintFor(secret: string) {
  const key = secret.trim().toLocaleLowerCase();
  return Object.hasOwn(words, key) ? words[key] : undefined;
}
