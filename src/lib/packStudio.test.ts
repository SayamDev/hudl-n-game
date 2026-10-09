import { it, expect } from "vitest";
import { makeOfflineMix, mixThemes } from "./packStudio";
it("all curated themes produce the requested unique family word counts", () => {
  for (const theme of mixThemes)
    for (const count of [12, 24, 36]) {
      const pack = makeOfflineMix(theme.id, count);
      expect(pack.words).toHaveLength(count);
      expect(new Set(pack.words).size).toBe(count);
      expect(pack.adult).toBe(false);
    }
});
it("remixing uses unseen eligible words first", () => {
  const first = makeOfflineMix("snacks", 12);
  const next = makeOfflineMix("snacks", 12, first.words);
  expect(next.words.some((w) => first.words.includes(w))).toBe(false);
});
