import { adultLikely } from "../content/adult-likely";
import friends from "../content/friends-18.json";
import { likely, takes } from "../content/prompts";
import type { GameOptions, Preferences } from "./types";
export const friendsTopics = [...new Set(friends.map((q) => q.category))];
export function partyIntensity(
  options: GameOptions,
  preferences: Pick<Preferences, "adult" | "family">,
): GameOptions["intensity"] {
  if (preferences.family) return "Family";
  if (
    ["Spicy", "After Dark 18+", "Friends 18+"].includes(options.intensity) &&
    !preferences.adult
  )
    return "Friends";
  if (
    options.partyMode === "takes" &&
    ["After Dark 18+", "Friends 18+"].includes(options.intensity)
  )
    return "Friends";
  return options.intensity;
}
export function partyPool(options: GameOptions) {
  if (options.intensity === "Friends 18+") {
    const selection = friends.filter(
      (q) =>
        !options.friendsTopic ||
        options.friendsTopic === "All topics" ||
        q.category === options.friendsTopic,
    );
    return (selection.length ? selection : friends).map((q) =>
      q.question.replace(/^Who is most likely to\s+/i, "").replace(/\?$/, ""),
    );
  }
  if (options.intensity === "After Dark 18+") return adultLikely;
  return (options.partyMode === "takes" ? takes : likely)[options.intensity];
}
export function partyPoolKey(options: GameOptions) {
  return `party:${options.partyMode}:${options.intensity}${options.intensity === "Friends 18+" ? `:${options.friendsTopic || "All topics"}` : ""}`;
}
