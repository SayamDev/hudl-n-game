import { describe, it, expect } from "vitest";
import friends from "../content/friends-18.json";
import {
  partyPool,
  partyIntensity,
  partyPoolKey,
  friendsTopics,
} from "./party-pool";
import { defaultOptions, useGame } from "../store/useGame";
describe("Friends 18+ supplied questions", () => {
  it("retains all 244 supplied questions and twelve topics", () => {
    expect(friends).toHaveLength(244);
    expect(new Set(friends.map((q) => q.id)).size).toBe(244);
    expect(friendsTopics).toHaveLength(12);
    expect(
      friends.every((q) => q.question.startsWith("Who is most likely to ")),
    ).toBe(true);
  });
  it("uses the exact question fragment once under the shared heading", () => {
    const pool = partyPool({ ...defaultOptions, intensity: "Friends 18+" });
    expect(pool).toHaveLength(244);
    expect(pool[0]).toBe("slap someone in public");
    expect(
      pool.every(
        (p) => !p.endsWith("?") && !p.startsWith("Who is most likely"),
      ),
    ).toBe(true);
  });
  it("filters every supplied topic and falls back safely for removed topics", () => {
    for (const topic of friendsTopics) {
      const options = {
        ...defaultOptions,
        intensity: "Friends 18+" as const,
        friendsTopic: topic,
      };
      expect(partyPool(options)).toHaveLength(
        friends.filter((q) => q.category === topic).length,
      );
      expect(partyPoolKey(options)).toContain(topic);
    }
    expect(
      partyPool({
        ...defaultOptions,
        intensity: "Friends 18+",
        friendsTopic: "stale",
      }),
    ).toHaveLength(244);
  });
  it("keeps adult pools gated in family mode and for Hot Takes", () => {
    const options = { ...defaultOptions, intensity: "Friends 18+" as const };
    expect(partyIntensity(options, { family: true, adult: true })).toBe(
      "Family",
    );
    expect(partyIntensity(options, { family: false, adult: false })).toBe(
      "Friends",
    );
    expect(
      partyIntensity(
        { ...options, partyMode: "takes" },
        { family: false, adult: true },
      ),
    ).toBe("Friends");
    expect(partyIntensity(options, { family: false, adult: true })).toBe(
      "Friends 18+",
    );
  });
  it("deals only the chosen topic with a separate variety history", () => {
    useGame.setState({
      players: ["a", "b", "c"].map((id) => ({
        id,
        name: id,
        avatar: "🐸",
        color: "red",
        score: 0,
      })),
      preferences: {
        ...useGame.getState().preferences,
        family: false,
        adult: true,
      },
      options: {
        ...defaultOptions,
        intensity: "Friends 18+",
        friendsTopic: "Public chaos",
      },
    });
    useGame.getState().start("party");
    const session = useGame.getState().session!;
    expect(session.promptDeck).toEqual(
      expect.arrayContaining(partyPool(session.options)),
    );
    expect(session.promptDeck).toHaveLength(13);
    expect(
      useGame.getState().variety["party:likely:Friends 18+:Public chaos"],
    ).toHaveLength(1);
  });
});
