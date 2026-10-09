import { beforeEach, describe, expect, it } from "vitest";
import { freshOrder, remember } from "./variety";
import { useGame, defaultOptions } from "../store/useGame";

describe("round variety", () => {
  beforeEach(() =>
    useGame.setState({
      players: ["a", "b", "c"].map((id) => ({
        id,
        name: id,
        avatar: "🐸",
        color: "",
        score: 0,
      })),
      options: { ...defaultOptions, packIds: ["test"] },
      customPacks: [
        {
          id: "test",
          name: "Test",
          adult: false,
          words: ["One", "Two", "Three", "Four", "Five", "Six"],
        },
      ],
      variety: {},
      session: null,
    }),
  );
  it("prefers unseen words, deduplicates casing, then recycles oldest", () => {
    expect(
      freshOrder(
        ["APPLE", "apple", "Pear", "Plum"],
        ["Pear", "apple"],
        () => 0.5,
      ),
    ).toEqual(["Plum", "Pear", "apple"]);
  });
  it("moves a remembered value to the end without growing duplicates", () => {
    expect(remember(["Pear", "Apple"], ["PEAR"])).toEqual(["Apple", "PEAR"]);
  });
  it("uses every eligible secret before repeating and rotates starters", () => {
    const secrets: string[] = [],
      starters: string[] = [];
    for (let i = 0; i < 6; i++) {
      useGame.getState().start("imposter");
      const s = useGame.getState().session!;
      secrets.push(s.secret);
      starters.push(s.startingPlayer);
    }
    expect(new Set(secrets).size).toBe(6);
    expect(new Set(starters.slice(0, 3)).size).toBe(3);
    useGame.getState().start("imposter");
    expect(useGame.getState().session!.secret).toBe(secrets[0]);
  });
  it("records only displayed charades words, leaving unseen cards fresh", () => {
    useGame.getState().start("charades");
    expect(useGame.getState().variety.charades).toBeUndefined();
    useGame.getState().patch({ phase: "acting" });
    const shown = useGame.getState().session!.deck[0];
    expect(useGame.getState().variety.charades).toEqual([shown]);
    useGame.getState().start("charades");
    expect(useGame.getState().session!.deck[0]).not.toBe(shown);
  });
  it("remembers displayed party prompts in a separate content pool", () => {
    useGame.getState().start("party");
    const first = useGame.getState().session!.promptDeck![0];
    useGame.getState().start("party");
    expect(useGame.getState().session!.promptDeck![0]).not.toBe(first);
    expect(useGame.getState().variety["party:likely:Family"]).toHaveLength(2);
  });
  it("does not reuse the immediately previous spy location", () => {
    useGame.getState().start("spy");
    const first = useGame.getState().session!.secret;
    useGame.getState().start("spy");
    expect(useGame.getState().session!.secret).not.toBe(first);
  });
});
