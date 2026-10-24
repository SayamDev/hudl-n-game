import { test, expect } from "@playwright/test";
import fs from "node:fs";
test("Heads Up and Charades have separate cards and correctly sized actions in both current styles", async ({
  page,
}) => {
  await page.addInitScript(() =>
    localStorage.setItem("hudl-welcome-v1", "true"),
  );
  for (const width of [390, 820, 1440]) {
    await page.setViewportSize({ width, height: 1000 });
    for (const refined of [true, false]) {
      await page.goto("/");
      if (!refined) {
        await page
          .getByRole("button", { name: "Settings", exact: true })
          .click();
        await page
          .getByRole("checkbox", {
            name: "After Hours art & motion",
            exact: false,
          })
          .uncheck();
        await page
          .getByRole("button", { name: "hudl n game home", exact: true })
          .click();
      }
      const heads = page
        .locator("article")
        .filter({
          has: page.getByRole("heading", { name: "Heads Up!", exact: true }),
        });
      const silent = page
        .locator("article")
        .filter({
          has: page.getByRole("heading", { name: "Charades", exact: true }),
        });
      await expect(heads).toHaveCount(1);
      await expect(silent).toHaveCount(1);
      await expect(
        heads.getByRole("button", { name: "Play Charades", exact: true }),
      ).toHaveCount(0);
      for (const card of [heads, silent])
        for (const button of await card.getByRole("button").all()) {
          const box = await button.boundingBox();
          expect(box!.height).toBeLessThanOrEqual(80);
          expect(box!.height).toBeGreaterThanOrEqual(44);
        }
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth > innerWidth,
        ),
      ).toBe(false);
      await silent
        .getByRole("button", { name: "How to play Charades", exact: true })
        .click();
      await expect(
        page.getByRole("heading", {
          name: "How to play Charades",
          exact: true,
        }),
      ).toBeVisible();
      await expect(
        page.getByText(
          "Act silently while your teammates guess. No words or sounds.",
        ),
      ).toBeVisible();
      await page.keyboard.press("Escape");
      fs.mkdirSync(".impeccable/review/lobby-fix", { recursive: true });
      await page.screenshot({
        path: `.impeccable/review/lobby-fix/${width}-${refined}.png`,
        fullPage: true,
      });
      await page.evaluate(() => localStorage.removeItem("hudl-game-v1"));
    }
  }
});
