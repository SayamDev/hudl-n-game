import { describe, it, expect } from "vitest";
import {
  assignRoles,
  resolveVotes,
  mafiaWinner,
  resolveNight,
  encodePack,
  decodePack,
  normalize,
} from "./logic";
import { defaultOptions } from "../store/useGame";
import type { Player } from "./types";
import packs from "../content/packs.json";
import { likely, takes } from "../content/prompts";
const players: Player[] = Array.from({ length: 8 }, (_, i) => ({
  id: String(i),
  name: `Player ${i}`,
  avatar: "",
  color: "",
  score: 0,
}));
describe("role assignment", () => {
  it("preserves a crew majority even when too many imposters requested", () => {
    const r = assignRoles(
      players,
      "imposter",
      { ...defaultOptions, imposters: 99 },
      () => 0.5,
    );
    expect(Object.values(r).filter((x) => x === "Imposter")).toHaveLength(3);
    expect(Object.keys(r)).toHaveLength(8);
  });
  it("gives exactly one spy", () =>
    expect(
      Object.values(assignRoles(players, "spy", defaultOptions)).filter(
        (x) => x === "Spy",
      ),
    ).toHaveLength(1));
  it("keeps a villager with all optional roles at minimum player count", () => {
    const roles = Object.values(
      assignRoles(players.slice(0, 5), "mafia", {
        ...defaultOptions,
        jester: true,
        bodyguard: true,
        vigilante: true,
      }),
    );
    expect(roles).toContain("Villager");
    expect(roles.filter((r) => r === "Mafia")).toHaveLength(1);
  });
});
describe("voting and winning", () => {
  it("returns no accused for a tie", () =>
    expect(resolveVotes({ a: "x", b: "y" })).toMatchObject({
      winner: null,
      tied: true,
    }));
  it("chooses a unique plurality", () =>
    expect(resolveVotes({ a: "x", b: "x", c: "y" }).winner).toBe("x"));
  it("empty voting never invents a winner", () =>
    expect(resolveVotes({}).winner).toBeNull());
  it("detects parity and village victory", () => {
    expect(mafiaWinner(["a", "b"], { a: "Mafia", b: "Doctor" })).toBe("Mafia");
    expect(mafiaWinner(["b"], { a: "Mafia", b: "Doctor" })).toBe("Village");
    expect(
      mafiaWinner(["a", "b", "c"], { a: "Mafia", b: "Doctor", c: "Villager" }),
    ).toBeNull();
  });
  it("doctor prevents a kill and bodyguard substitutes themself", () => {
    const roles = { a: "Mafia", b: "Bodyguard", c: "Villager" };
    expect(
      resolveNight(["a", "b", "c"], roles, { Mafia: "c", Doctor: "c" }),
    ).toEqual([]);
    expect(
      resolveNight(["a", "b", "c"], roles, { Mafia: "c", Bodyguard: "c" }),
    ).toEqual(["b"]);
  });
});
describe("share packs", () => {
  it("round-trips Unicode without trusting incoming identifiers", () => {
    const p = {
      id: "untrusted",
      name: "Our café",
      words: ["Éclair", "東京", "Pancake", "Pizza", "Ice cream", "Waffle"],
    };
    const decoded = decodePack(encodePack(p));
    expect(decoded.words).toEqual(p.words);
    expect(decoded.id).not.toBe(p.id);
  });
  it("rejects malformed and oversized links", () => {
    expect(() => decodePack("bad-link")).toThrow();
    expect(() => decodePack("x".repeat(16001))).toThrow();
  });
  it("normalizes case and whitespace for final guesses", () =>
    expect(normalize(" Ice Cream! ")).toBe(normalize("ice cream")));
});
describe("offline content", () => {
  it("ships 15 packs of at least 40 unique words", () => {
    expect(packs.length).toBeGreaterThanOrEqual(15);
    for (const p of packs) {
      expect(new Set(p.words).size).toBeGreaterThanOrEqual(40);
    }
  });
  it("ships 60 unique prompts per mode and intensity", () => {
    for (const pool of [likely, takes])
      for (const prompts of Object.values(pool))
        expect(new Set(prompts).size).toBeGreaterThanOrEqual(60);
  });
});
