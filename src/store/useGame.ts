import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type {
  Player,
  Preferences,
  GameOptions,
  Session,
  Pack,
  GameId,
} from "../lib/types";
import { assignRoles, shuffle } from "../lib/logic";
import { freshOrder, remember } from "../lib/variety";
import { likely, takes } from "../content/prompts";
import { safeStorage } from "../lib/storage";
import builtInPacks from "../content/packs.json";
import locations from "../content/locations.json";
export const avatars = [
  "🐸",
  "🦊",
  "🐼",
  "🐙",
  "🦁",
  "🐨",
  "🦄",
  "🐯",
  "🐧",
  "🦋",
  "🐻",
  "🐵",
  "🦉",
  "🐱",
  "🐶",
  "🐰",
  "🦖",
  "🐢",
  "🐝",
  "🐬",
];
export const colors = [
  "#FFD60A",
  "#FF8A3D",
  "#2EE6A6",
  "#38BDF8",
  "#FF3D8B",
  "#b79af5",
];
export const defaultOptions: GameOptions = {
  imposters: 1,
  randomImposters: false,
  hint: true,
  hintStyle: "word",
  voteFlowVersion: 2,
  charadesMode: "heads-up",
  chaos: false,
  seconds: 120,
  packIds: ["food", "animals"],
  voteMode: "point",
  points: 2,
  doctor: true,
  detective: true,
  jester: false,
  bodyguard: false,
  vigilante: false,
  showRoles: true,
  manual: false,
  tilt: false,
  intensity: "Family",
  partyMode: "likely",
};
const initialPreferences: Preferences = {
  design: "club",
  dark:
    typeof matchMedia === "function" &&
    matchMedia("(prefers-color-scheme: dark)").matches,
  family: true,
  adult: false,
  sound: true,
  volume: 0.3,
  haptics: true,
  narrator: true,
  voice: "",
  rate: 0.9,
  largeText: false,
  contrast: false,
};
type State = {
  players: Player[];
  preferences: Preferences;
  options: GameOptions;
  session: Session | null;
  customPacks: Pack[];
  variety: Record<string, string[]>;
  setPlayers: (players: Player[]) => void;
  setPreferences: (p: Partial<Preferences>) => void;
  setOptions: (o: Partial<GameOptions>) => void;
  start: (game: GameId) => void;
  patch: (s: Partial<Session>) => void;
  finish: (result: string, winners: string[]) => void;
  quit: () => void;
  addPack: (p: Pack) => void;
  removePack: (id: string) => void;
  resetScores: () => void;
};
export const useGame = create<State>()(
  persist(
    (set, get) => ({
      players: [],
      preferences: initialPreferences,
      options: defaultOptions,
      session: null,
      customPacks: [],
      variety: {},
      setPlayers: (players) => set({ players }),
      setPreferences: (p) =>
        set((s) => ({ preferences: { ...s.preferences, ...p } })),
      setOptions: (o) => set((s) => ({ options: { ...s.options, ...o } })),
      start: (game) => {
        const { players, options, preferences, customPacks, variety } = get();
        if (
          players.length <
          (game === "mafia"
            ? 5
            : game === "charades" && options.charadesMode === "classic"
              ? 4
              : 3)
        )
          return;
        const all = [...builtInPacks, ...customPacks].filter(
          (p) => !p.adult || (!preferences.family && preferences.adult),
        );
        const selected = all.filter((p) => options.packIds.includes(p.id));
        const available = selected.length
          ? selected
          : all.filter((p) => !p.adult);
        const ordered = freshOrder(
          available.flatMap((p) => p.words),
          variety[game],
        );
        const word = ordered[0];
        const pack = available.find((p) => p.words.includes(word))!;
        const deck = ordered;
        const locationName = freshOrder(
          locations.map((l) => l.name),
          variety.spy,
        )[0];
        const location = locations.find((l) => l.name === locationName)!;
        const startingPlayer = freshOrder(
          players.map((p) => p.id),
          variety.starters,
        )[0];
        const roles = assignRoles(players, game, options);
        if (game === "spy")
          players.forEach((p, i) => {
            if (roles[p.id] !== "Spy")
              roles[p.id] = location.roles[i % location.roles.length];
          });
        const seconds =
          game === "charades" && options.seconds !== 0 ? 60 : options.seconds;
        const safeOptions = {
          ...options,
          intensity: preferences.family
            ? "Family"
            : options.intensity === "Spicy" && !preferences.adult
              ? "Friends"
              : options.intensity,
        } as GameOptions;
        const promptKey = `party:${safeOptions.partyMode}:${safeOptions.intensity}`;
        const promptDeck =
          game === "party"
            ? freshOrder(
                (safeOptions.partyMode === "takes" ? takes : likely)[
                  safeOptions.intensity
                ],
                variety[promptKey],
              )
            : undefined;
        const nextVariety: Record<string, string[]> = {
          ...variety,
          starters: remember(variety.starters, [startingPlayer]),
        };
        if (game === "imposter" || game === "spy")
          nextVariety[game] = remember(variety[game], [
            game === "spy" ? location.name : word,
          ]);
        if (promptDeck)
          nextVariety[promptKey] = remember(variety[promptKey], [
            promptDeck[0],
          ]);
        set({
          variety: nextVariety,
          session: {
            id: crypto.randomUUID(),
            game,
            phase:
              game === "charades"
                ? "ready"
                : game === "party"
                  ? "prompt"
                  : "peek",
            options: safeOptions,
            roles,
            secret: game === "spy" ? location.name : word,
            category: pack.name,
            decoy: shuffle(pack.words.filter((w) => w !== word))[0],
            peekIndex: 0,
            alive: players.map((p) => p.id),
            votes: {},
            voterIndex: 0,
            accused: null,
            round: 1,
            night: {},
            history: [],
            result: "",
            winners: [],
            awarded: false,
            deck,
            cardIndex: 0,
            correct: 0,
            skipped: 0,
            teamScores: [0, 0],
            team: 0,
            timerRemaining: seconds,
            timerRunning: false,
            paused: false,
            startingPlayer,
            promptDeck,
            direction: Math.random() < 0.5 ? "clockwise" : "anticlockwise",
            guessOptions:
              game === "spy"
                ? locations.map((l) => l.name)
                : shuffle([
                    word,
                    ...shuffle(pack.words.filter((w) => w !== word)).slice(
                      0,
                      5,
                    ),
                  ]),
            partyVotes: {},
            promptIndex: 0,
          },
        });
      },
      patch: (s) =>
        set((state) => {
          if (!state.session) return {};
          const session = { ...state.session, ...s };
          const variety = { ...state.variety };
          if (
            session.game === "charades" &&
            ["acting", "actor-peek"].includes(session.phase)
          ) {
            const word = session.deck[session.cardIndex % session.deck.length];
            if (word) variety.charades = remember(variety.charades, [word]);
          }
          if (
            session.game === "party" &&
            session.phase === "prompt" &&
            session.promptDeck
          ) {
            const key = `party:${session.options.partyMode}:${session.options.intensity}`;
            const prompt =
              session.promptDeck[
                session.promptIndex % session.promptDeck.length
              ];
            if (prompt) variety[key] = remember(variety[key], [prompt]);
          }
          return { session, variety };
        }),
      finish: (result, winners) =>
        set((state) => {
          if (!state.session || state.session.awarded) return {};
          return {
            session: {
              ...state.session,
              result,
              winners,
              phase: "results",
              timerRunning: false,
              awarded: true,
            },
            players: state.players.map((p) => ({
              ...p,
              score:
                p.score +
                (winners.includes(p.id) ? state.session!.options.points : 0),
            })),
          };
        }),
      quit: () => set({ session: null }),
      addPack: (p) => set((s) => ({ customPacks: [...s.customPacks, p] })),
      removePack: (id) =>
        set((s) => ({ customPacks: s.customPacks.filter((p) => p.id !== id) })),
      resetScores: () =>
        set((s) => ({ players: s.players.map((p) => ({ ...p, score: 0 })) })),
    }),
    {
      name: "hudl-game-v1",
      version: 1,
      merge: (persisted, current) => {
        const saved = persisted as Partial<State> | undefined;
        const options = { ...defaultOptions, ...saved?.options };
        if (
          options.voteFlowVersion !== 2 ||
          saved?.options?.voteFlowVersion !== 2
        ) {
          options.voteMode = "point";
          options.voteFlowVersion = 2;
        }
        return {
          ...current,
          ...saved,
          preferences: { ...initialPreferences, ...saved?.preferences },
          options,
        };
      },
      storage: createJSONStorage(() => safeStorage),
      partialize: (s) => ({
        players: s.players,
        preferences: s.preferences,
        options: s.options,
        customPacks: s.customPacks,
        variety: s.variety,
        session: s.session
          ? { ...s.session, timerRunning: false, paused: true }
          : null,
      }),
    },
  ),
);
