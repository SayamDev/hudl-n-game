import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import fs from "node:fs";
const shots = ".impeccable/review/branded-gameplay";
fs.mkdirSync(shots, { recursive: true });
test("branded gameplay artwork and main controls fit phones, tablets, desktop and landscape", async ({
  page,
}) => {
  await page.addInitScript(() =>
    localStorage.setItem("hudl-welcome-v1", "true"),
  );
  await page.goto("/");
  await page
    .locator("article")
    .filter({
      has: page.getByRole("heading", { name: "Imposter", exact: true }),
    })
    .getByRole("button", { name: "Let’s play" })
    .click();
  for (const name of ["Alexandria", "Noah", "Zara", "Leo", "Amira"]) {
    await page.getByLabel("Player name", { exact: true }).fill(name);
    await page.getByRole("button", { name: "Add player", exact: true }).click();
  }
  await page.getByRole("button", { name: "Let’s play, all 5 of us" }).click();
  await page.getByRole("button", { name: "Quick start" }).click();
  const saved = await page.evaluate(() =>
    JSON.parse(localStorage.getItem("hudl-game-v1")!),
  );
  for (const { game, mode, phase, action } of [
    {
      game: "charades",
      mode: "heads-up",
      phase: "ready",
      action: "Start the turn",
    },
    {
      game: "charades",
      mode: "classic",
      phase: "ready",
      action: "Draw your prompt",
    },
    { game: "spy", mode: "heads-up", phase: "peek", action: "Pass to Noah" },
    { game: "mafia", mode: "heads-up", phase: "peek", action: "Pass to Noah" },
    {
      game: "imposter",
      mode: "heads-up",
      phase: "peek",
      action: "Pass to Noah",
    },
    {
      game: "party",
      mode: "heads-up",
      phase: "prompt",
      action: "Point on three",
    },
  ]) {
    const fixture = structuredClone(saved);
    Object.assign(fixture.state.session, {
      game,
      phase,
      peekIndex: 0,
      paused: false,
      secret: "International airport",
      category: "Places",
      timerRunning: false,
    });
    if (game === "imposter") fixture.state.preferences.swipeReveal = false;
    fixture.state.session.options.charadesMode = mode;
    fixture.state.session.options.seconds = 0;
    fixture.state.session.roles[fixture.state.players[0].id] =
      game === "spy" ? "Spy" : "Mafia";
    await page.addInitScript(
      (s) => localStorage.setItem("hudl-game-v1", JSON.stringify(s)),
      fixture,
    );
    await page.reload();
    const resume = page.getByRole("button", { name: "Resume game" });
    if (await resume.isVisible()) await resume.click();
    await expect(page.locator("main .stage > h1")).toBeVisible();
    await page.waitForLoadState("networkidle");
    if (phase === "peek")
      await expect(
        page.getByRole("button", { name: "Hold to peek" }),
      ).toBeEnabled();
    for (const [width, height] of [
      [320, 568],
      [320, 740],
      [390, 844],
      [820, 1024],
      [1440, 900],
      [844, 390],
    ]) {
      await page.setViewportSize({ width, height });
      // Let viewport-unit and compositor updates settle before measuring.
      await page.evaluate(
        () =>
          new Promise((resolve) =>
            requestAnimationFrame(() => requestAnimationFrame(resolve)),
          ),
      );
      await page.evaluate(() => {
        scrollTo({ top: 0, behavior: "instant" });
        return document.fonts.ready;
      });
      const button = page.getByRole("button", { name: action, exact: true });
      const rect = await button.boundingBox();
      expect(rect!.y, `${game}/${mode} top at ${width}`).toBeGreaterThanOrEqual(
        0,
      );
      expect
        .soft(
          rect!.y + rect!.height,
          `${game}/${mode} bottom at ${width}x${height}`,
        )
        .toBeLessThanOrEqual(height);
      expect(rect!.height).toBeGreaterThanOrEqual(44);
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
      ).toBe(true);
      expect
        .soft(
          await page.evaluate(() => document.documentElement.scrollHeight),
          `${game}/${mode} document at ${width}x${height}`,
        )
        .toBeLessThanOrEqual(height + 2);
      await page.evaluate(() =>
        Promise.allSettled(
          document
            .getAnimations()
            .filter((a) => a.effect?.getTiming().iterations !== Infinity)
            .map((a) => a.finished),
        ),
      );
      await page.evaluate(
        () =>
          new Promise((resolve) =>
            requestAnimationFrame(() => requestAnimationFrame(resolve)),
          ),
      );
      await page.screenshot({
        path: `${shots}/${game}-${mode}-${width}-${height}.png`,
        animations: "disabled",
      });
      if (width === 390) {
        if (phase === "peek") {
          const card = await page.locator(".stable-secret").boundingBox();
          const closed = await page.locator(".secret-content h2").boundingBox();
          expect(closed!.y).toBeGreaterThan(card!.y);
          expect(closed!.y + closed!.height).toBeLessThan(
            card!.y + card!.height,
          );
        }
        expect((await new AxeBuilder({ page }).analyze()).violations).toEqual(
          [],
        );
        if (phase === "peek") {
          const hold = page.getByRole("button", { name: "Hold to peek" });
          await hold.focus();
          const before = await hold.boundingBox();
          await page.keyboard.down("Space");
          await expect(page.locator(".secret-word")).toBeVisible();
          const bounds = await page.locator(".stable-secret").boundingBox();
          const word = await page.locator(".secret-word").boundingBox();
          expect(word!.y).toBeGreaterThanOrEqual(bounds!.y);
          expect(word!.y + word!.height).toBeLessThanOrEqual(
            bounds!.y + bounds!.height,
          );
          await page.screenshot({
            path: `${shots}/${game}-held-390.png`,
            animations: "disabled",
          });
          await page.keyboard.up("Space");
          await expect(page.locator(".secret-word")).toHaveCount(0);
          expect(
            Math.abs((await hold.boundingBox())!.y - before!.y),
          ).toBeLessThan(1);
        }
      }
    }
    if (phase === "ready") {
      await page.getByRole("button", { name: action }).click();
      await expect(
        page.locator(mode === "classic" ? ".branded-peek" : ".charades-word"),
      ).toBeVisible();
    }
  }
});
