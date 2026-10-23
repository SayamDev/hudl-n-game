import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import fs from "node:fs";
const dir = ".impeccable/review/branded-deck";
fs.mkdirSync(dir, { recursive: true });
async function seed(page: any) {
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
  for (const name of [
    "Bilal",
    "Junaid",
    "Sayam",
    "Alexandria Longname",
    "Ria",
  ]) {
    await page.getByLabel("Player name", { exact: true }).fill(name);
    await page.getByRole("button", { name: "Add player", exact: true }).click();
  }
  await page.getByRole("button", { name: "Let’s play, all 5 of us" }).click();
  await page.getByRole("button", { name: "Quick start" }).click();
  return page.evaluate(() => JSON.parse(localStorage.getItem("hudl-game-v1")!));
}
async function load(page: any, saved: any) {
  await page.addInitScript(
    (data: any) => localStorage.setItem("hudl-game-v1", JSON.stringify(data)),
    saved,
  );
  await page.reload();
  const resume = page.getByRole("button", { name: "Resume game" });
  if (await resume.isVisible()) await resume.click();
  await expect(page.locator(".stage")).toHaveCSS(
    "transform",
    "matrix(1, 0, 0, 1, 0, 0)",
  );
}
async function scan(page: any, name: string) {
  await page.screenshot({ path: `${dir}/${name}.png`, fullPage: true });
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth > innerWidth,
    ),
  ).toBe(false);
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
}
test("private deck stays reachable, stable and immediately secret-free after release", async ({
  page,
}) => {
  const saved = await seed(page);
  saved.state.session.secret = "Pizza";
  saved.state.session.category = "Food";
  saved.state.session.roles[saved.state.players[0].id] = "Imposter";
  for (const [width, height] of [
    [320, 740],
    [390, 844],
    [820, 1180],
    [1440, 1000],
  ]) {
    await page.setViewportSize({ width, height });
    saved.state.preferences.dark = width === 820;
    await load(page, saved);
    const hold = page.getByRole("button", {
      name: "Hold to peek",
      exact: true,
    });
    await expect(hold).toBeEnabled({ timeout: 6000 });
    await scan(page, `sealed-${width}`);
    const before = await hold.boundingBox();
    if (width < 800) expect(before!.y + before!.height).toBeLessThan(height);
    await hold.focus();
    await page.keyboard.down("Space");
    await expect(page.locator(".imposter-hint strong")).toHaveText("Cheese");
    const during = await hold.boundingBox();
    expect(Math.abs(before!.y - during!.y)).toBeLessThan(1);
    if (width === 390) await scan(page, "held-390");
    await page.keyboard.up("Space");
    await expect(
      page.locator(".imposter-hint,.imposter-role,.secret-word"),
    ).toHaveCount(0);
    await expect(page.locator(".peek-cue")).toHaveText(
      "Secret hidden. Ready to pass.",
    );
  }
  saved.state.preferences.deckStyle = false;
  await load(page, saved);
  await expect(page.locator(".sleeve-motion")).toHaveCount(0);
  await expect(page.locator(".peek-identity")).toBeHidden();
});
test("round result rows keep rank avatar name and points in separate columns in both designs", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  const saved = await seed(page);
  saved.state.session.phase = "results";
  saved.state.session.awarded = true;
  saved.state.session.result = "The crew wins!";
  saved.state.session.winners = saved.state.players
    .slice(0, 2)
    .map((p: any) => p.id);
  saved.state.players[0].score = 12;
  saved.state.players[1].score = 12;
  for (const [width, height] of [
    [320, 740],
    [390, 844],
    [820, 1180],
    [1440, 1000],
  ]) {
    await page.setViewportSize({ width, height });
    saved.state.preferences.dark = width === 1440;
    await load(page, saved);
    await expect(page.locator(".score-entry")).toHaveCount(5);
    const separated = await page
      .locator(".score-entry")
      .evaluateAll((rows: any[]) =>
        rows.every((row) => {
          const parts = [
            ".score-rank",
            ".avatar",
            ".score-player",
            ".score-points",
          ].map((s) => row.querySelector(s).getBoundingClientRect());
          return parts.every((p, i) => !i || p.left >= parts[i - 1].right - 1);
        }),
      );
    expect(separated).toBe(true);
    await scan(page, `results-${width}`);
  }
  saved.state.preferences.deckStyle = false;
  await load(page, saved);
  await expect(page.locator(".winner-artwork")).toHaveCount(0);
  await expect(page.locator(".win-animation")).toBeVisible();
  await scan(page, "results-previous");
});
