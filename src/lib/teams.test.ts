import { describe, it, expect } from "vitest";
import { cleanTeams, defaultTeams, roundTeams, teamError } from "./teams";
import { assignRoles } from "./logic";
import { defaultOptions, useGame } from "../store/useGame";
import type { Player, Session } from "./types";
const players: Player[] = Array.from({ length: 6 }, (_, i) => ({
  id: String(i),
  name: `Person ${i}`,
  avatar: "",
  color: "",
  score: 0,
}));
const groups = [
  { id: "a", name: "Night Owls", playerIds: ["0", "1"] },
  { id: "b", name: "Wild Cards", playerIds: ["2", "3"] },
  { id: "c", name: "Plot Twist", playerIds: ["4", "5"] },
];
describe("chosen groups", () => {
  it("removes departed people and duplicates without silently moving their partners", () => {
    expect(
      cleanTeams(
        [
          { ...groups[0], playerIds: ["0", "1", "removed"] },
          { ...groups[1], playerIds: ["0", "2"] },
        ],
        players.slice(0, 3),
      ).map((t) => t.playerIds),
    ).toEqual([["0", "1"], ["2"]]);
  });
  it("requires complete assignments and an actor plus guesser in classic Charades", () => {
    expect(
      teamError(players, "charades", {
        ...defaultOptions,
        charadesMode: "classic",
        teams: groups,
      }),
    ).toBe("");
    expect(
      teamError(players, "charades", {
        ...defaultOptions,
        charadesMode: "classic",
        teams: [
          { ...groups[0], playerIds: ["0"] },
          { ...groups[1], playerIds: ["1", "2", "3", "4", "5"] },
        ],
      }),
    ).toContain("actor and a guesser");
    expect(
      teamError(players, "imposter", {
        ...defaultOptions,
        teams: groups.slice(0, 2),
      }),
    ).toContain("everyone");
  });
  it("snapshots chosen teams, supports three Charades turns and awards a person only once", () => {
    useGame.setState({
      players,
      session: null,
      options: { ...defaultOptions, teams: groups, charadesMode: "classic" },
    });
    useGame.getState().start("charades");
    expect(useGame.getState().session?.teams).toEqual(groups);
    expect(useGame.getState().session?.teamScores).toEqual([0, 0, 0]);
    useGame.getState().finish("Wild Cards win", ["2", "3"]);
    useGame.getState().finish("Again", ["2", "3"]);
    expect(useGame.getState().players.map((p) => p.score)).toEqual([
      0, 0, 2, 2, 0, 0,
    ]);
  });
  it("never uses chosen groups to allocate Imposter roles", () => {
    expect(
      assignRoles(
        players,
        "imposter",
        { ...defaultOptions, teams: groups },
        () => 0.5,
      ),
    ).toEqual(assignRoles(players, "imposter", defaultOptions, () => 0.5));
    useGame.setState({
      players,
      session: null,
      options: { ...defaultOptions, teams: groups },
    });
    useGame.getState().start("imposter");
    const s = useGame.getState().session!;
    expect(Object.values(s.roles).filter((r) => r === "Imposter")).toHaveLength(
      1,
    );
    expect(s.teams).toEqual(groups);
  });
  it("preserves alternating groups for old saved Charades sessions", () => {
    expect(roundTeams({} as Session, players)).toEqual(defaultTeams(players));
  });
});
