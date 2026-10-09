export const en = {
  brand: "hudl n game",
  tagline: "Huddle up. Pass the phone. Cause chaos.",
  play: "Let’s play",
  back: "Back to the party",
  settings: "Settings",
  offline: "Offline ready",
  privacy: "Privacy",
  pause: "Chaos, on hold.",
  resume: "Resume game",
} as const;
export type TranslationKey = keyof typeof en;
export const t = (key: TranslationKey): string => en[key];
