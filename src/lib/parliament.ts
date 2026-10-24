// Secret Hitler digital adaptation; CC BY-NC-SA 4.0. See docs/secret-hitler-license.md.
import { shuffle } from "./logic";
export type Policy = "Liberal" | "Fascist";
export type Parliament = {
  order: string[];
  roles: Record<string, string>;
  alive: string[];
  president: string;
  chancellor: string;
  previousPresident: string;
  previousChancellor: string;
  resumePresident: string;
  liberal: number;
  fascist: number;
  failures: number;
  deck: Policy[];
  discard: Policy[];
  hand: Policy[];
  ballots: Record<string, boolean>;
  phase:
    | "roles"
    | "nominate"
    | "ballot"
    | "ballot-result"
    | "president"
    | "chancellor"
    | "veto"
    | "policy"
    | "power"
    | "private-power"
    | "over";
  power: string;
  investigated: string[];
  privateInfo: string;
  winner: Policy | "";
  message: string;
  vetoDenied: boolean;
};
export function createParliament(
  ids: string[],
  random = Math.random,
): Parliament {
  if (ids.length < 5 || ids.length > 10)
    throw new Error("Secret Hitler needs 5–10 players.");
  const order = shuffle(ids, random),
    roles: Record<string, string> = {};
  const fascists = Math.floor((ids.length - 3) / 2);
  order.forEach(
    (id, i) =>
      (roles[id] = i === 0 ? "Hitler" : i <= fascists ? "Fascist" : "Liberal"),
  );
  return {
    order: ids,
    roles,
    alive: [...ids],
    president: ids[Math.floor(random() * ids.length)],
    chancellor: "",
    previousPresident: "",
    previousChancellor: "",
    resumePresident: "",
    liberal: 0,
    fascist: 0,
    failures: 0,
    deck: shuffle<Policy>(
      [...Array(6).fill("Liberal"), ...Array(11).fill("Fascist")],
      random,
    ),
    discard: [],
    hand: [],
    ballots: {},
    phase: "roles",
    power: "",
    investigated: [],
    privateInfo: "",
    winner: "",
    message: "",
    vetoDenied: false,
  };
}
export function eligibleChancellors(s: Parliament) {
  return s.alive.filter(
    (id) =>
      id !== s.president &&
      id !== s.previousChancellor &&
      (s.alive.length <= 5 || id !== s.previousPresident),
  );
}
export function roleBrief(
  s: Parliament,
  id: string,
  name: (id: string) => string,
) {
  const role = s.roles[id];
  const allies = Object.keys(s.roles).filter(
    (p) => p !== id && s.roles[p] !== "Liberal",
  );
  return role === "Liberal"
    ? "You know no other roles. Enact five Liberal policies or remove Hitler."
    : role === "Hitler" && s.order.length >= 7
      ? "Your allies know you; you do not know them. Reach six Fascist policies or become Chancellor after three."
      : `Your allies: ${allies.map((p) => `${name(p)} (${s.roles[p]})`).join(", ")}. Reach six Fascist policies or elect Hitler Chancellor after three.`;
}
function replenish(s: Parliament) {
  if (s.deck.length < 3) {
    s.deck = shuffle([...s.deck, ...s.discard]);
    s.discard = [];
  }
}
function nextAlive(s: Parliament, id: string) {
  const n = s.order.indexOf(id);
  for (let i = 1; i <= s.order.length; i++) {
    const p = s.order[(n + i) % s.order.length];
    if (s.alive.includes(p)) return p;
  }
  return id;
}
function next(s: Parliament) {
  s.president = s.resumePresident || nextAlive(s, s.president);
  if (!s.alive.includes(s.president)) s.president = nextAlive(s, s.president);
  s.resumePresident = "";
  s.chancellor = "";
  s.ballots = {};
  s.hand = [];
  s.privateInfo = "";
  s.power = "";
  s.vetoDenied = false;
  s.phase = "nominate";
}
export function powerAt(count: number, n: number) {
  if (n === 4 || n === 5) return "execution";
  if (count <= 6) return n === 3 ? "peek" : "";
  if (count <= 8) return n === 2 ? "investigate" : n === 3 ? "special" : "";
  return n === 1 || n === 2 ? "investigate" : n === 3 ? "special" : "";
}
function enact(s: Parliament, p: Policy, chaos = false) {
  s.failures = 0;
  s.message = `${p} policy enacted${chaos ? " by the election tracker" : ""}.`;
  if (p === "Liberal") s.liberal++;
  else s.fascist++;
  if (s.liberal === 5 || s.fascist === 6) {
    s.winner = s.liberal === 5 ? "Liberal" : "Fascist";
    s.phase = "over";
    return;
  }
  s.power = !chaos && p === "Fascist" ? powerAt(s.order.length, s.fascist) : "";
  if (chaos) {
    s.previousPresident = "";
    s.previousChancellor = "";
  }
  replenish(s);
  s.phase = "policy";
}
function failed(s: Parliament) {
  s.failures++;
  if (s.failures === 3) {
    replenish(s);
    enact(s, s.deck.shift()!, true);
  } else next(s);
}
export type ParliamentAction =
  | { type: "begin" | "continue" | "veto" | "accept-veto" | "deny-veto" }
  | { type: "nominate" | "target"; id: string }
  | { type: "vote"; id: string; yes: boolean }
  | { type: "discard" | "enact"; index: number };
export function parliamentTurn(
  state: Parliament,
  a: ParliamentAction,
): Parliament {
  const s = structuredClone(state);
  if (s.phase === "over") return s;
  if (a.type === "begin" && s.phase === "roles") s.phase = "nominate";
  if (
    a.type === "nominate" &&
    s.phase === "nominate" &&
    eligibleChancellors(s).includes(a.id)
  ) {
    s.chancellor = a.id;
    s.phase = "ballot";
  }
  if (
    a.type === "vote" &&
    s.phase === "ballot" &&
    s.alive.includes(a.id) &&
    !(a.id in s.ballots)
  ) {
    s.ballots[a.id] = a.yes;
    if (Object.keys(s.ballots).length === s.alive.length)
      s.phase = "ballot-result";
  }
  if (a.type === "continue") {
    if (s.phase === "ballot-result") {
      if (Object.values(s.ballots).filter(Boolean).length <= s.alive.length / 2)
        failed(s);
      else {
        s.previousPresident = s.president;
        s.previousChancellor = s.chancellor;
        if (s.fascist >= 3 && s.roles[s.chancellor] === "Hitler") {
          s.winner = "Fascist";
          s.message =
            "Hitler was elected Chancellor after three Fascist policies.";
          s.phase = "over";
        } else {
          replenish(s);
          s.hand = s.deck.splice(0, 3);
          s.phase = "president";
        }
      }
    } else if (s.phase === "policy") {
      if (s.power) s.phase = "power";
      else next(s);
    } else if (s.phase === "private-power") next(s);
  }
  if (a.type === "discard" && s.phase === "president" && s.hand[a.index]) {
    s.discard.push(...s.hand.splice(a.index, 1));
    s.phase = "chancellor";
  }
  if (a.type === "enact" && s.phase === "chancellor" && s.hand[a.index]) {
    const p = s.hand[a.index];
    s.discard.push(...s.hand.filter((_, i) => i !== a.index));
    s.hand = [];
    enact(s, p);
  }
  if (
    a.type === "veto" &&
    s.phase === "chancellor" &&
    s.fascist >= 5 &&
    !s.vetoDenied
  )
    s.phase = "veto";
  if (a.type === "accept-veto" && s.phase === "veto") {
    s.discard.push(...s.hand);
    s.hand = [];
    failed(s);
  }
  if (a.type === "deny-veto" && s.phase === "veto") {
    s.vetoDenied = true;
    s.phase = "chancellor";
  }
  if (s.phase === "power" && s.power === "peek" && a.type === "target") {
    replenish(s);
    s.privateInfo = `Next policies, in order: ${s.deck.slice(0, 3).join(", ")}.`;
    s.phase = "private-power";
  } else if (
    a.type === "target" &&
    s.phase === "power" &&
    s.alive.includes(a.id) &&
    a.id !== s.president
  ) {
    if (s.power === "investigate" && !s.investigated.includes(a.id)) {
      s.investigated.push(a.id);
      s.privateInfo = `${a.id}: ${s.roles[a.id] === "Liberal" ? "Liberal" : "Fascist"} party membership.`;
      s.phase = "private-power";
    } else if (s.power === "special") {
      s.resumePresident = nextAlive(s, s.president);
      s.president = a.id;
      s.chancellor = "";
      s.ballots = {};
      s.phase = "nominate";
      s.power = "";
    } else if (s.power === "execution") {
      s.alive = s.alive.filter((p) => p !== a.id);
      if (s.roles[a.id] === "Hitler") {
        s.winner = "Liberal";
        s.message = "Hitler was removed from office.";
        s.phase = "over";
      } else next(s);
    }
  }
  return s;
}
