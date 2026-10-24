import { describe, it, expect, beforeEach } from "vitest";
import { createSpyMatch, resolveSpyRound, nextSpyMatch } from "./spy-match";
import type { Session } from "./types";
import { defaultOptions, useGame } from "../store/useGame";
const players = ["a", "b", "c"].map((id) => ({
  id,
  name: id,
  avatar: "🐸",
  color: "red",
  score: 0,
}));
beforeEach(() => {
  useGame.setState({
    players,
    options: { ...defaultOptions, spyRounds: 3 },
    session: null,
    variety: {},
  });
  useGame.getState().start("spy");
});
function round(timeout = false) {
  const s = structuredClone(useGame.getState().session!);
  s.roles = { a: "Spy", b: "Local", c: "Local" };
  s.spyMatch = {
    ...createSpyMatch(["a", "b", "c"], "b", 3),
    initiator: "b",
    timeout,
  };
  return s;
}
describe("Spyfall official scoring and complete matches", () => {
  it("awards two points for escaping and four for a correct guess or false accusation", () => {
    for (const outcome of [
      "escaped",
      "correct-guess",
      "wrong-accusation",
    ] as const) {
      const result = resolveSpyRound(round(), outcome);
      expect(result.spyMatch!.roundAwards).toEqual({
        a: outcome === "escaped" ? 2 : 4,
        b: 0,
        c: 0,
      });
    }
  });
  it("awards each local one point and the successful pre-timeout accuser one extra", () => {
    expect(resolveSpyRound(round(), "caught").spyMatch!.roundAwards).toEqual({
      a: 0,
      b: 2,
      c: 1,
    });
    expect(
      resolveSpyRound(round(true), "caught").spyMatch!.roundAwards,
    ).toEqual({ a: 0, b: 1, c: 1 });
    expect(
      resolveSpyRound(round(), "wrong-guess").spyMatch!.roundAwards,
    ).toEqual({ a: 0, b: 1, c: 1 });
  });
  it("does not settle a completed round twice or mutate its input", () => {
    const s = round(),
      copy = structuredClone(s);
    const result = resolveSpyRound(s, "caught");
    expect(s).toEqual(copy);
    expect(resolveSpyRound({ ...s, ...result }, "escaped")).toEqual({});
  });
  it("resets round-only state and appoints the previous spy as dealer", () => {
    const s = resolveSpyRound(round(), "caught").spyMatch!;
    const next = nextSpyMatch({ ...s, accusers: ["b", "c"] });
    expect(next.dealer).toBe("a");
    expect(next.accusers).toEqual([]);
    expect(next.scores).toEqual({ a: 0, b: 2, c: 1 });
    expect(next.settled).toBe(false);
  });
  it("deals fresh locations for the selected number of rounds and awards the match exactly once", () => {
    for (let i = 1; i <= 3; i++) {
      const s = useGame.getState().session!;
      expect(s.round).toBe(i);
      expect(s.spyMatch!.rounds).toBe(3);
      useGame.getState().patch(resolveSpyRound(s, "escaped"));
      const settled = useGame.getState().session!;
      if (i < 3) {
        useGame.getState().nextSpyRound();
        const next = useGame.getState().session!;
        expect(next.secret).not.toBe(s.secret);
        expect(next.startingPlayer).toBe(settled.spyMatch!.lastSpy);
        expect(next.phase).toBe("peek");
      } else {
        const scores = settled.spyMatch!.scores;
        useGame.getState().finish("Match done", ["a"], scores);
        const before = useGame.getState().players;
        useGame.getState().finish("Duplicate", ["a"], scores);
        expect(useGame.getState().players).toEqual(before);
        expect(before.reduce((sum, p) => sum + p.score, 0)).toBe(6);
      }
    }
  });
  it("preserves an old saved Spyfall round as a one-round match", () => {
    const s = round();
    delete s.spyMatch;
    const result = resolveSpyRound(s, "escaped");
    expect(result.spyMatch!.rounds).toBe(1);
  });
});
