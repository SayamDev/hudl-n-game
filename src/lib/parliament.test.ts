import { describe, it, expect } from "vitest";
import {
  createParliament,
  parliamentTurn,
  eligibleChancellors,
  powerAt,
  roleBrief,
} from "./parliament";
import type { Parliament, Policy } from "./parliament";
import { adultLikely } from "../content/adult-likely";
import { useGame, defaultOptions } from "../store/useGame";
const ids = Array.from({ length: 10 }, (_, i) => `p${i}`);
const fresh = (n = 7): Parliament => ({
  ...createParliament(ids.slice(0, n), () => 0.5),
  phase: "nominate" as const,
});
function election(s: Parliament, yes = true) {
  let t = parliamentTurn(s, {
    type: "nominate",
    id: eligibleChancellors(s)[0],
  });
  for (const id of t.alive) t = parliamentTurn(t, { type: "vote", id, yes });
  return parliamentTurn(t, { type: "continue" });
}
describe("Secret Hitler rules", () => {
  it("chooses presidency independently from the role shuffle", () => {
    let seed = 718;
    const random = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
    const presidents = new Set<string>();
    for (let i = 0; i < 40; i++) {
      const s = createParliament(ids.slice(0, 7), random);
      presidents.add(s.roles[s.president]);
    }
    expect(presidents.has("Liberal")).toBe(true);
    expect(presidents.has("Hitler")).toBe(true);
  });
  it("finishes complete games for every crew size without losing policies", () => {
    for (let n = 5; n <= 10; n++) {
      let s: Parliament = fresh(n),
        steps = 0;
      while (s.phase !== "over" && steps++ < 200) {
        if (s.phase === "nominate") s = election(s);
        else if (s.phase === "president")
          s = parliamentTurn(s, { type: "discard", index: 0 });
        else if (s.phase === "chancellor")
          s = parliamentTurn(s, { type: "enact", index: 0 });
        else if (s.phase === "power")
          s = parliamentTurn(s, {
            type: "target",
            id:
              s.power === "peek"
                ? s.president
                : s.alive.find(
                    (id) =>
                      id !== s.president &&
                      (s.power !== "investigate" ||
                        !s.investigated.includes(id)),
                  )!,
          });
        else s = parliamentTurn(s, { type: "continue" });
        expect(
          s.deck.length +
            s.discard.length +
            s.hand.length +
            s.liberal +
            s.fascist,
        ).toBe(17);
      }
      expect(s.phase).toBe("over");
      expect(s.winner).not.toBe("");
    }
  });

  it("deals correct factions for every supported count", () => {
    for (let n = 5; n <= 10; n++) {
      const s = fresh(n);
      expect(Object.values(s.roles).filter((r) => r === "Hitler")).toHaveLength(
        1,
      );
      expect(
        Object.values(s.roles).filter((r) => r === "Fascist"),
      ).toHaveLength(Math.floor((n - 3) / 2));
      expect(s.deck.filter((p) => p === "Liberal")).toHaveLength(6);
      expect(s.deck.filter((p) => p === "Fascist")).toHaveLength(11);
    }
    expect(() => fresh(4)).toThrow();
  });
  it("gives Hitler ally knowledge only in 5–6 player games", () => {
    for (const n of [5, 6, 7, 10]) {
      const s = fresh(n),
        id = Object.keys(s.roles).find((p) => s.roles[p] === "Hitler")!;
      expect(roleBrief(s, id, (id) => id)).toContain(
        n <= 6 ? "Your allies:" : "you do not know them",
      );
    }
  });
  it("enforces chancellor term limits and the five-player exception", () => {
    const s = fresh();
    s.previousPresident = "p1";
    s.previousChancellor = "p2";
    expect(eligibleChancellors(s)).not.toContain("p1");
    expect(eligibleChancellors(s)).not.toContain("p2");
    s.alive = s.alive.slice(0, 5);
    s.president = "p0";
    expect(eligibleChancellors(s)).toContain("p1");
    expect(eligibleChancellors(s)).not.toContain("p2");
  });
  it("rejects duplicate ballots and tied elections", () => {
    let s = fresh(6);
    s = parliamentTurn(s, { type: "nominate", id: eligibleChancellors(s)[0] });
    s = parliamentTurn(s, { type: "vote", id: "p0", yes: true });
    expect(
      parliamentTurn(s, { type: "vote", id: "p0", yes: false }).ballots.p0,
    ).toBe(true);
    s.alive.forEach(
      (id, i) => (s = parliamentTurn(s, { type: "vote", id, yes: i < 3 })),
    );
    s = parliamentTurn(s, { type: "continue" });
    expect(s.phase).toBe("nominate");
    expect(s.failures).toBe(1);
  });
  it("tracks three failures, enacts without powers and clears term limits", () => {
    let s = fresh();
    s.fascist = 3;
    s.previousPresident = "p1";
    s.previousChancellor = "p2";
    s.deck[0] = "Fascist";
    for (let i = 0; i < 3; i++) s = election(s, false);
    expect(s.fascist).toBe(4);
    expect(s.phase).toBe("policy");
    expect(s.power).toBe("");
    expect(s.failures).toBe(0);
    expect(s.previousChancellor).toBe("");
  });
  it("moves a private three-card hand to a two-card hand and conserves policies", () => {
    let s = election(fresh());
    expect(s.phase).toBe("president");
    expect(s.hand).toHaveLength(3);
    s = parliamentTurn(s, { type: "discard", index: 0 });
    expect(s.phase).toBe("chancellor");
    expect(s.hand).toHaveLength(2);
    s = parliamentTurn(s, { type: "enact", index: 0 });
    expect(s.liberal + s.fascist).toBe(1);
    expect(s.deck.length + s.discard.length + s.liberal + s.fascist).toBe(17);
  });
  it("wins immediately for Hitler elected after three Fascist policies", () => {
    let s = fresh();
    s.fascist = 3;
    const hitler = Object.keys(s.roles).find((id) => s.roles[id] === "Hitler")!;
    s.president = s.alive.find((id) => id !== hitler)!;
    s = parliamentTurn(s, { type: "nominate", id: hitler });
    for (const id of s.alive)
      s = parliamentTurn(s, { type: "vote", id, yes: true });
    s = parliamentTurn(s, { type: "continue" });
    expect(s.winner).toBe("Fascist");
    expect(s.phase).toBe("over");
  });
  it("wins on fifth Liberal and sixth Fascist policies", () => {
    for (const policy of ["Liberal", "Fascist"] as Policy[]) {
      let s: Parliament = {
        ...fresh(),
        phase: "chancellor",
        hand: [policy, policy],
        liberal: policy === "Liberal" ? 4 : 0,
        fascist: policy === "Fascist" ? 5 : 0,
      };
      s = parliamentTurn(s, { type: "enact", index: 0 });
      expect(s.winner).toBe(policy);
      expect(s.phase).toBe("over");
    }
  });
  it("uses player-count-specific executive powers", () => {
    expect([1, 2, 3, 4, 5].map((n) => powerAt(5, n))).toEqual([
      "",
      "",
      "peek",
      "execution",
      "execution",
    ]);
    expect([1, 2, 3].map((n) => powerAt(7, n))).toEqual([
      "",
      "investigate",
      "special",
    ]);
    expect([1, 2, 3].map((n) => powerAt(9, n))).toEqual([
      "investigate",
      "investigate",
      "special",
    ]);
  });
  it("investigates party membership without revealing Hitler and prevents repeats", () => {
    let s: Parliament = { ...fresh(), phase: "power", power: "investigate" };
    const h = Object.keys(s.roles).find((id) => s.roles[id] === "Hitler")!;
    s.president = s.alive.find((id) => id !== h)!;
    s = parliamentTurn(s, { type: "target", id: h });
    expect(s.privateInfo).toContain("Fascist");
    expect(s.privateInfo).not.toContain("Hitler");
    expect(s.investigated).toContain(h);
    s.phase = "power";
    expect(parliamentTurn(s, { type: "target", id: h }).phase).toBe("power");
  });
  it("resumes normal presidency after a special election", () => {
    let s: Parliament = {
      ...fresh(),
      president: "p0",
      phase: "power",
      power: "special",
    };
    s = parliamentTurn(s, { type: "target", id: "p4" });
    expect(s.president).toBe("p4");
    s = election(s, false);
    expect(s.president).toBe("p1");
  });
  it("removes a player without revealing their role, and killing Hitler wins", () => {
    let s: Parliament = { ...fresh(), phase: "power", power: "execution" };
    const h = Object.keys(s.roles).find((id) => s.roles[id] === "Hitler")!;
    s.president = s.alive.find((id) => id !== h)!;
    s = parliamentTurn(s, { type: "target", id: h });
    expect(s.winner).toBe("Liberal");
    expect(s.alive).not.toContain(h);
  });
  it("supports veto acceptance, refusal and tracker chaos", () => {
    let s: Parliament = {
      ...fresh(),
      phase: "chancellor",
      fascist: 5,
      hand: ["Liberal", "Fascist"],
    };
    s = parliamentTurn(s, { type: "veto" });
    expect(s.phase).toBe("veto");
    const denied = parliamentTurn(s, { type: "deny-veto" });
    expect(denied.vetoDenied).toBe(true);
    expect(parliamentTurn(denied, { type: "veto" }).phase).toBe("chancellor");
    const accepted = parliamentTurn(s, { type: "accept-veto" });
    expect(accepted.hand).toHaveLength(0);
    expect(accepted.failures).toBe(1);
    expect(accepted.phase).toBe("nominate");
  });
  it("never mutates previous state or changes peeked deck order", () => {
    const s: Parliament = { ...fresh(5), phase: "power", power: "peek" };
    const before = structuredClone(s);
    const next = parliamentTurn(s, { type: "target", id: s.president });
    expect(s).toEqual(before);
    expect(next.deck).toEqual(s.deck);
    expect(next.privateInfo).toContain(s.deck.slice(0, 3).join(", "));
  });
});
describe("adult content and supported crews", () => {
  it("ships sixty unique original adult prompts", () =>
    expect(new Set(adultLikely).size).toBe(60));
  it("gates adult deals and stores actual parliament roles", () => {
    const players = ids
      .slice(0, 5)
      .map((id, i) => ({ id, name: id, avatar: "🐸", color: "red", score: 0 }));
    useGame.setState({
      players,
      options: { ...defaultOptions, intensity: "After Dark 18+" },
      preferences: {
        ...useGame.getState().preferences,
        family: true,
        adult: false,
      },
    });
    useGame.getState().start("party");
    expect(useGame.getState().session!.options.intensity).toBe("Family");
    expect(
      useGame
        .getState()
        .session!.promptDeck?.some((p) => adultLikely.includes(p)),
    ).toBe(false);
    useGame.setState({
      preferences: {
        ...useGame.getState().preferences,
        family: false,
        adult: true,
      },
    });
    useGame.getState().start("party");
    expect(useGame.getState().session!.promptDeck).toHaveLength(60);
    expect(
      useGame
        .getState()
        .session!.promptDeck?.every((p) => adultLikely.includes(p)),
    ).toBe(true);
    useGame.getState().start("secret-hitler");
    const s = useGame.getState().session!;
    expect(s.roles).toEqual(s.parliament!.roles);
    expect(s.parliament!.phase).toBe("roles");
  });
});
