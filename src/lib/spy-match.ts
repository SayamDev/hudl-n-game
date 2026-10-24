import type { Session } from "./types";
export type SpyMatch = {
  dealer: string;
  rounds: number;
  scores: Record<string, number>;
  accusers: string[];
  initiator: string | null;
  timeout: boolean;
  settled: boolean;
  roundAwards: Record<string, number>;
  outcome: string;
  lastSpy: string;
};
export type SpyOutcome =
  "caught" | "wrong-accusation" | "correct-guess" | "wrong-guess" | "escaped";
export function createSpyMatch(
  ids: string[],
  dealer: string,
  rounds = 5,
): SpyMatch {
  return {
    dealer,
    rounds: Math.max(1, Math.min(10, Math.floor(rounds) || 5)),
    scores: Object.fromEntries(ids.map((id) => [id, 0])),
    accusers: [],
    initiator: null,
    timeout: false,
    settled: false,
    roundAwards: {},
    outcome: "",
    lastSpy: "",
  };
}
export function spyMatch(s: Session): SpyMatch {
  return s.spyMatch || createSpyMatch(s.alive, s.startingPlayer, 1);
}
export function resolveSpyRound(
  s: Session,
  outcome: SpyOutcome,
): Partial<Session> {
  const match = spyMatch(s);
  if (match.settled) return {};
  const spy = Object.keys(s.roles).find((id) => s.roles[id] === "Spy");
  if (!spy) return {};
  const awards = Object.fromEntries(s.alive.map((id) => [id, 0]));
  const localWin = outcome === "caught" || outcome === "wrong-guess";
  if (localWin) {
    s.alive.filter((id) => id !== spy).forEach((id) => (awards[id] = 1));
    if (
      outcome === "caught" &&
      !match.timeout &&
      match.initiator &&
      match.initiator !== spy
    )
      awards[match.initiator]++;
  } else
    awards[spy] =
      outcome === "correct-guess" || outcome === "wrong-accusation" ? 4 : 2;
  const scores = Object.fromEntries(
    s.alive.map((id) => [id, (match.scores[id] || 0) + awards[id]]),
  );
  const message = {
    caught: "The spy was caught.",
    "wrong-accusation": "An innocent player was accused.",
    "correct-guess": "The spy found the location.",
    "wrong-guess": "The spy guessed the wrong location.",
    escaped: "The spy escaped the final vote.",
  }[outcome];
  return {
    phase: "spy-round",
    timerRunning: false,
    spyMatch: {
      ...match,
      scores,
      settled: true,
      roundAwards: awards,
      outcome: message,
      lastSpy: spy,
    },
    history: [
      ...s.history,
      `Round ${s.round}: ${message} Location: ${s.secret}.`,
    ],
  };
}
export function nextSpyMatch(match: SpyMatch): SpyMatch {
  return {
    ...match,
    dealer: match.lastSpy,
    accusers: [],
    initiator: null,
    timeout: false,
    settled: false,
    roundAwards: {},
    outcome: "",
    lastSpy: "",
  };
}
