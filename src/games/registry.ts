import type { GameDefinition } from "../lib/types";
const sharedScreens = {
  settings: () =>
    import("../components/Setup").then((m) => ({ default: m.GameSettings })),
  results: () => import("../components/Results"),
};
export const games: GameDefinition[] = [
  {
    ...sharedScreens,
    id: "imposter",
    name: "Imposter",
    subtitle: "One word. One liar. Trust nobody.",
    color: "purple",
    emoji: "👀",
    min: 3,
    duration: "5-10 min",
    rules: [
      "Everyone holds to peek at a secret word. The imposter gets no word.",
      "Take turns giving one-word clues. Keep it clever, not obvious.",
      "Discuss, then vote. Ties trigger a new vote.",
      "Catch the imposter, but watch out: one correct final guess steals the win.",
    ],
    load: () => import("./Imposter"),
  },
  {
    ...sharedScreens,
    id: "mafia",
    name: "Mafia",
    subtitle: "Goodnight, village. Good luck.",
    color: "pink",
    emoji: "🌙",
    min: 5,
    duration: "10-20 min",
    rules: [
      "Peek at your role, then close your eyes for night.",
      "Only the called role opens their eyes and uses the phone. Pass discreetly.",
      "Mafia agree on a victim. The Doctor saves and Detective investigates.",
      "By day, discuss and vote someone out. Village wins when no Mafia remain; Mafia wins at parity.",
    ],
    load: () => import("./Mafia"),
  },
  {
    ...sharedScreens,
    id: "spy",
    name: "Spyfall",
    subtitle: "Same place. One very lost spy.",
    color: "mint",
    emoji: "🛸",
    min: 3,
    max: 8,
    duration: "8 min",
    rules: [
      "Everyone sees a location and role except the spy.",
      "Ask each other questions about the location without naming it.",
      "Accuse a player: everyone else must agree. Catch the spy to win; accusing a local gives the spy the win.",
      "The spy may interrupt to guess the location. A wrong guess gives the locals the win.",
    ],
    load: () => import("./Spy"),
  },
  {
    ...sharedScreens,
    id: "secret-hitler",
    name: "Secret Hitler",
    subtitle: "Elect a government. Question every motive.",
    color: "purple",
    emoji: "🗳️",
    min: 5,
    max: 10,
    duration: "30–45 min",
    rules: [
      "Secret Liberal and Fascist teams compete through elections and policies.",
      "Pass the phone privately for roles, votes and policy choices. Never reveal a private hand to the table.",
      "Liberals win with five policies or Hitler’s removal. Fascists win with six policies or Hitler elected Chancellor after three.",
      "The app manages term limits, failed elections, presidential powers and vetoes. Noncommercial CC BY-NC-SA 4.0 adaptation; full credits inside the game.",
    ],
    load: () => import("./SecretHitler"),
  },

  {
    ...sharedScreens,
    id: "charades",
    name: "Heads Up!",
    subtitle: "Hold the screen up. Your team gives the clues.",
    color: "yellow",
    emoji: "🎭",
    min: 3,
    duration: "60 sec turns",
    rules: [
      "Split into two teams, alternating players in your crew list.",
      "One player holds the phone facing their teammates.",
      "Your teammates describe the word without saying it. Guess as many as you can.",
      "Enable and practise tilt before starting: screen toward the floor for correct, toward the ceiling to skip. Return upright between gestures. Or use buttons / the right and left arrow keys. Two turns decide the winner.",
    ],
    load: () => import("./Charades"),
  },
  {
    ...sharedScreens,
    id: "party",
    name: "Most Likely To",
    subtitle: "You know exactly who it is.",
    color: "blue",
    emoji: "👉",
    min: 3,
    duration: "5 prompts",
    rules: [
      "Read the prompt aloud. Everyone points on three.",
      "Tap the person with the most fingers pointing at them, or record a tie.",
      "Hot Takes: pass the phone and privately set your agreement, then reveal the group split.",
      "Five prompts make a round. Skip anything the group does not want to answer.",
    ],
    load: () => import("./Party"),
  },
];
export const gameById = (id: string) => games.find((g) => g.id === id)!;

// Two distinct lobby choices share the team-round engine, not a combined card.
export const charadesGame = {
  ...gameById("charades"),
  name: "Charades",
  subtitle: "Your team guesses. You act. Not a word.",
  min: 4,
  rules: [
    "Split into two teams with at least two players each.",
    "The actor privately checks the prompt, then hides it before acting.",
    "Act silently while your teammates guess. No words or sounds.",
    "Tap Correct or Skip, then pass to the next actor. Play timed or without a timer.",
  ],
};
export const lobbyGames = games.flatMap<
  GameDefinition & { lobbyKey: string; charadesMode?: "heads-up" | "classic" }
>((game) =>
  game.id === "charades"
    ? [
        { ...game, lobbyKey: "heads-up", charadesMode: "heads-up" as const },
        {
          ...charadesGame,
          lobbyKey: "silent-charades",
          charadesMode: "classic" as const,
        },
      ]
    : [{ ...game, lobbyKey: game.id, charadesMode: undefined }],
);
export const gamePresentation = (id: string, mode?: string) =>
  id === "charades" && mode === "classic" ? charadesGame : gameById(id);
