import { it, expect } from "vitest";
import { hintFor } from "./hints";
import packs from "../content/packs.json";
it("every starter word has a familiar one-word association that does not repeat its secret", () => {
  for (const word of packs.flatMap((p) => p.words)) {
    const hint = hintFor(word);
    expect(hint, word).toBeTruthy();
    expect(hint).toMatch(/^[\p{L}]+$/u);
    expect(hint!.toLowerCase()).not.toBe(word.toLowerCase());
  }
});
it("uses concrete clue associations, and never invents a custom-word clue", () => {
  expect(hintFor(" Pizza ")).toBe("Cheese");
  expect(hintFor("Penguin")).toBe("Ice");
  expect(hintFor("Pesto")).toBe("Sauce");
  expect(hintFor("Date")).toBe("Fruit");
  expect(hintFor("A private family joke")).toBeUndefined();
  expect(hintFor("constructor")).toBeUndefined();
  expect(hintFor("__proto__")).toBeUndefined();
});
