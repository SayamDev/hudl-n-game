import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import fs from "node:fs";
test("distinct illustrated worlds, stable cast portraits and question turns", async ({
  page,
}) => {
  await page.addInitScript(() =>
    localStorage.setItem("hudl-welcome-v1", "true"),
  );
  await page.setViewportSize({ width: 390, height: 1000 });
  await page.goto("/");
  await expect(page.locator(".night-games")).toBeVisible();
  fs.mkdirSync(".impeccable/review/game-worlds", { recursive: true });
  await page.waitForLoadState("networkidle");
  await page.screenshot({
    path: ".impeccable/review/game-worlds/home-390.png",
    fullPage: true,
  });
  await page
    .locator("article")
    .filter({
      has: page.getByRole("heading", { name: "Imposter", exact: true }),
    })
    .getByRole("button", { name: "Let’s play" })
    .click();
  for (const name of ["Maya", "Noah", "Zara", "Leo", "Ari"]) {
    await page.getByLabel("Player name", { exact: true }).fill(name);
    await page.getByRole("button", { name: "Add player", exact: true }).click();
  }
  await page.getByRole("button", { name: "Let’s play, all 5 of us" }).click();
  await page.getByRole("button", { name: "Quick start" }).click();
  const saved = await page.evaluate(() =>
    JSON.parse(localStorage.getItem("hudl-game-v1")!),
  );
  fs.mkdirSync(".impeccable/review/game-worlds", { recursive: true });
  for (const [game, mode, phase] of [
    ["mafia", "heads-up", "night"],
    ["spy", "heads-up", "discuss"],
    ["charades", "heads-up", "ready"],
    ["charades", "classic", "ready"],
    ["party", "heads-up", "prompt"],
  ]) {
    const s = structuredClone(saved);
    Object.assign(s.state.session, { game, phase, paused: false });
    s.state.session.options.charadesMode = mode;
    s.state.session.roles[s.state.players[0].id] = "Spy";
    await page.addInitScript(
      (s) => localStorage.setItem("hudl-game-v1", JSON.stringify(s)),
      s,
    );
    await page.reload();
    const resume = page.getByRole("button", { name: "Resume game" });
    if (await resume.isVisible()) await resume.click();
    await expect(page.locator("main .stage > h1")).toBeVisible();
    for (const width of [390, 1440]) {
      await page.setViewportSize({ width, height: 1000 });
      await page.evaluate(() => document.fonts.ready);
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth > innerWidth,
        ),
      ).toBe(false);
      await page.evaluate(() => scrollTo({ top: 0, behavior: "instant" }));
      await page.screenshot({
        path: `.impeccable/review/game-worlds/${game}-${mode}-${width}.png`,
        fullPage: true,
      });
    }
    if (game === "spy") {
      await expect(page.locator(".investigation-world")).toBeVisible();
      const before = await page
        .locator(".investigation-world h2")
        .textContent();
      await page.getByRole("button", { name: /Next question/ }).click();
      expect(
        await page.locator(".investigation-world h2").textContent(),
      ).not.toBe(before);
    }
    if (game === "mafia")
      await expect(
        page.getByRole("list", { name: "Council cycle" }),
      ).toBeVisible();
    expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
  }
  const seeds = [
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
  const s = structuredClone(saved);
  s.state.session = null;
  s.state.players = seeds.map((avatar, i) => ({
    ...s.state.players[0],
    id: `cast-${i}`,
    name: `Guest ${i + 1}`,
    avatar,
  }));
  await page.addInitScript(
    (s) => localStorage.setItem("hudl-game-v1", JSON.stringify(s)),
    s,
  );
  await page.reload();
  await page.getByRole("button", { name: "Crew", exact: true }).click();
  const portraits = page.locator(".crew-list .illustrated-portrait");
  await expect(portraits).toHaveCount(20);
  const views = await portraits.evaluateAll((els) =>
    els.map((el) => el.getAttribute("viewBox")),
  );
  expect(new Set(views).size).toBe(20);
  for (const file of ["character-atlas.jpg", "world-atlas.jpg"])
    expect((await page.request.get(`/art/after-hours/${file}`)).status()).toBe(
      200,
    );
});
