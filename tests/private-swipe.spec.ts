import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import fs from "node:fs";
test("swipe reveal is dark for both roles, conceals before named handoff, and tracks clues", async ({
  page,
}) => {
  await page.addInitScript(() =>
    localStorage.setItem("hudl-welcome-v1", "true"),
  );
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await page
    .locator("article")
    .filter({
      has: page.getByRole("heading", { name: "Imposter", exact: true }),
    })
    .getByRole("button", { name: "Let’s play" })
    .click();
  for (const name of ["Maya", "Noah", "Zara"]) {
    await page.getByLabel("Player name", { exact: true }).fill(name);
    await page.getByRole("button", { name: "Add player", exact: true }).click();
  }
  await page.getByRole("button", { name: "Let’s play, all 3 of us" }).click();
  await page.getByRole("button", { name: "Quick start" }).click();
  const saved = await page.evaluate(() =>
    JSON.parse(localStorage.getItem("hudl-game-v1")!),
  );
  saved.state.session.roles[saved.state.players[0].id] = "Imposter";
  saved.state.session.roles[saved.state.players[1].id] = "Crew";
  saved.state.session.secret = "Pizza";
  saved.state.session.options.hint = true;
  saved.state.session.options.chaos = false;
  await page.addInitScript(
    (s) => localStorage.setItem("hudl-game-v1", JSON.stringify(s)),
    saved,
  );
  await page.reload();
  await page.getByRole("button", { name: "Resume game" }).click();
  await expect(
    page.getByRole("heading", { name: "Your turn Maya" }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Hide & pass to Noah" }),
  ).toBeDisabled();
  await expect(
    page.getByRole("button", { name: "Reveal my secret" }),
  ).toBeEnabled();
  const box = await page.locator(".private-swipe").boundingBox();
  await page.mouse.move(box!.x + 30, box!.y + box!.height - 12);
  await page.mouse.down();
  await page.mouse.move(box!.x + 30, box!.y + 20, { steps: 12 });
  await page.mouse.up();
  await expect(
    page.getByRole("heading", { name: "IMPOSTER", exact: true }),
  ).toBeVisible();
  const revealBox = await page.locator(".private-secret").boundingBox();
  await page.mouse.move(revealBox!.x + 30, revealBox!.y + 30);
  await page.mouse.down();
  await page.mouse.move(revealBox!.x + 30, revealBox!.y + 120, { steps: 10 });
  await page.mouse.up();
  await expect(
    page.getByRole("heading", { name: "IMPOSTER", exact: true }),
  ).toHaveCount(0);
  await page.getByRole("button", { name: "Reveal my secret" }).click();
  const ground = await page
    .locator(".private-secret")
    .evaluate((el) => getComputedStyle(el).backgroundColor);
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
  await page.getByRole("button", { name: "Hide & pass to Noah" }).click();
  await expect(
    page.getByRole("heading", { name: "IMPOSTER", exact: true }),
  ).toHaveCount(0);
  await expect(
    page.getByRole("heading", { name: "Your turn Noah" }),
  ).toBeVisible();
  const reveal = page.getByRole("button", { name: "Reveal my secret" });
  await expect(reveal).toBeEnabled();
  await reveal.focus();
  await page.keyboard.press("Enter");
  await expect(
    page.getByRole("heading", { name: "Pizza", exact: true }),
  ).toBeVisible();
  expect(
    await page
      .locator(".private-secret")
      .evaluate((el) => getComputedStyle(el).backgroundColor),
  ).toBe(ground);
  await page.keyboard.press("Escape");
  await expect(
    page.getByRole("heading", { name: "Pizza", exact: true }),
  ).toHaveCount(0);
  await page.getByRole("button", { name: "Resume game" }).click();
  for (const width of [320, 390, 820, 1440]) {
    await page.setViewportSize({ width, height: width > 700 ? 1000 : 844 });
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth > innerWidth,
      ),
    ).toBe(false);
    const passBox = await page
      .getByRole("button", { name: "Hide & pass to Zara" })
      .boundingBox();
    expect(passBox!.y + passBox!.height).toBeLessThanOrEqual(
      width > 700 ? 1000 : 844,
    );
    fs.mkdirSync(".impeccable/review/private-swipe", { recursive: true });
    await page.screenshot({
      path: `.impeccable/review/private-swipe/${width}.png`,
      fullPage: true,
    });
  }
  await page.getByRole("button", { name: "Hide & pass to Zara" }).click();
  await page.getByRole("button", { name: "Reveal my secret" }).click();
  await page.getByRole("button", { name: "Hide & start clues" }).click();
  const turn = await page.locator(".start-player strong").textContent();
  await page.getByRole("button", { name: /Next clue/ }).click();
  expect(await page.locator(".start-player strong").textContent()).not.toBe(
    turn,
  );
});
