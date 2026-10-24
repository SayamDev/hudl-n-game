import { test, expect } from "@playwright/test";
import { createHash } from "node:crypto";
const names = [
  "spy",
  "carnival-mask",
  "bandit",
  "cyborg-face",
  "invisible-face",
  "jester-hat",
  "mustache",
  "pirate-captain",
  "robot-helmet",
  "vr-headset",
  "wizard-face",
  "woman-elf-face",
  "fox-head",
  "owl",
  "rogue",
  "domino-mask",
  "architect-mask",
  "bird-mask",
  "ninja-head",
  "raccoon-head",
];
test.beforeEach(async ({ page }) => {
  await page.addInitScript(() =>
    localStorage.setItem("hudl-welcome-v1", "true"),
  );
});
test("After Hours uses local distinct artwork and fonts, with visible credits and a working style revert", async ({
  page,
}) => {
  await page.goto("/");
  await page.evaluate(() => document.fonts.ready);
  await expect(page.locator(".after-hours-home")).toBeVisible();
  const hashes = new Set();
  for (const name of names) {
    const r = await page.request.get(`/art/after-hours/alibis/${name}.svg`);
    expect(r.status()).toBe(200);
    hashes.add(
      createHash("sha256")
        .update(await r.body())
        .digest("hex"),
    );
  }
  expect(hashes.size).toBe(20);
  expect(
    (
      await page.request.get("/fonts/bebas-neue/BebasNeue-Regular.ttf")
    ).status(),
  ).toBe(200);
  expect(
    (
      await page.request.get("/art/after-hours/club-illustrations.jpg")
    ).status(),
  ).toBe(200);
  await page.getByRole("button", { name: "Privacy", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Artwork & type" }),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: "Game-icons.net" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Settings", exact: true }).click();
  await page
    .getByRole("checkbox", { name: "After Hours art & motion", exact: false })
    .uncheck();
  await page
    .getByRole("button", { name: "hudl n game home", exact: true })
    .click();
  await expect(page.locator(".after-hours-home")).toHaveCount(0);
  await expect(page.locator(".club-home")).toBeVisible();
});
test("public verdict artwork remains visible in both earlier designs", async ({
  page,
}) => {
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
  for (const design of ["club-original", "classic"]) {
    saved.state.preferences.design = design;
    saved.state.preferences.deckStyle = true;
    saved.state.session.phase = "reveal";
    saved.state.session.accused = saved.state.players[0].id;
    await page.addInitScript(
      (s) => localStorage.setItem("hudl-game-v1", JSON.stringify(s)),
      saved,
    );
    await page.reload();
    const resume = page.getByRole("button", { name: "Resume game" });
    if (await resume.isVisible()) await resume.click();
    await expect(page.locator(".noir-verdict-cover")).toHaveCount(0);
    await expect(page.locator(".verdict-envelope > svg").first()).toBeVisible();
    await page.getByRole("button", { name: "Reveal identity" }).click();
    await expect(
      page.getByRole("button", { name: /One last guess|See results/ }),
    ).toBeVisible();
  }
});
