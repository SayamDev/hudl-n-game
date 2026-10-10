import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
test.beforeEach(async ({ page }) => {
  await page.addInitScript(() =>
    localStorage.setItem("hudl-welcome-v1", "true"),
  );
});
async function start(page: any, game = "Heads Up!") {
  await page.goto("/");
  await page
    .locator("article")
    .filter({ has: page.getByRole("heading", { name: game, exact: true }) })
    .getByRole("button", { name: "Let’s play" })
    .click();
  for (const name of ["Maya", "Noah", "Zara"]) {
    await page.getByLabel("Player name", { exact: true }).fill(name);
    await page.getByRole("button", { name: "Add player", exact: true }).click();
  }
  await page.getByRole("button", { name: "Let’s play, all 3 of us" }).click();
  await page.getByRole("button", { name: "Quick start" }).click();
}
async function tilt(page: any, beta: number, gamma = 0) {
  await page.evaluate(
    ({ beta, gamma }: any) =>
      window.dispatchEvent(
        new DeviceOrientationEvent("deviceorientation", { beta, gamma }),
      ),
    { beta, gamma },
  );
}
async function neutral(page: any, landscape = false) {
  for (let i = 0; i < 5; i++) {
    await tilt(page, landscape ? 0 : 90, landscape ? 90 : 0);
    await page.waitForTimeout(80);
  }
}
async function gesture(page: any, beta: number) {
  await tilt(page, beta);
  await page.waitForTimeout(180);
  await tilt(page, beta);
}
test("tilt practice and actual scoring require deliberate gestures and reset; keyboard works while paused safely", async ({
  page,
}) => {
  await start(page);
  await page.bringToFront();
  await page.getByRole("button", { name: "Enable tilt controls" }).click();
  await neutral(page, true);
  await gesture(page, -170);
  await expect(page.getByText("Correct gesture recognised!")).toBeVisible();
  expect(
    await page.evaluate(
      () =>
        JSON.parse(localStorage.getItem("hudl-game-v1")!).state.session.correct,
    ),
  ).toBe(0);
  await page.getByRole("button", { name: "Start the clock" }).focus();
  await page.keyboard.press("Enter");
  await gesture(page, 170);
  await expect(page.getByText("0 correct · 0 skipped")).toBeVisible();
  await neutral(page, true);
  await gesture(page, 170);
  await expect(page.getByText("1 correct · 0 skipped")).toBeVisible();
  await gesture(page, 170);
  await expect(page.getByText("1 correct · 0 skipped")).toBeVisible();
  await neutral(page);
  await gesture(page, 0);
  await expect(page.getByText("1 correct · 1 skipped")).toBeVisible();
  await page.keyboard.press("ArrowRight");
  await page.keyboard.press("ArrowLeft");
  await expect(page.getByText("2 correct · 2 skipped")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toBeVisible();
  await neutral(page);
  await gesture(page, 170);
  await page.keyboard.press("ArrowRight");
  await expect(page.getByText("2 correct · 2 skipped")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await page.getByRole("button", { name: "Finish turn early" }).focus();
  await page.keyboard.press("Enter");
  await expect(
    page.getByRole("heading", { name: "Team 1: 2 points!" }),
  ).toBeVisible();
});
test("motion denial and missing sensor have clear button/keyboard fallback", async ({
  page,
}) => {
  await page.addInitScript(() =>
    Object.defineProperty(DeviceOrientationEvent, "requestPermission", {
      configurable: true,
      value: async () => "denied",
    }),
  );
  await start(page);
  await page.getByRole("button", { name: "Enable tilt controls" }).click();
  await expect(page.getByRole("status")).toContainText(
    "permission wasn’t allowed",
  );
  await page.evaluate(() =>
    Object.defineProperty(DeviceOrientationEvent, "requestPermission", {
      configurable: true,
      value: async () => "granted",
    }),
  );
  await page.getByRole("button", { name: "Enable tilt controls" }).click();
  await expect(page.getByRole("status")).toContainText(
    "No motion data received",
    { timeout: 7000 },
  );
  await page.getByRole("button", { name: "Start the clock" }).click();
  await page.keyboard.press("ArrowRight");
  await expect(page.getByText("1 correct · 0 skipped")).toBeVisible();
});
test("reveal remains stationary, words and hints are strong, secrets disappear on release and Escape", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await start(page, "Imposter");
  const saved = await page.evaluate(() =>
    JSON.parse(localStorage.getItem("hudl-game-v1")!),
  );
  for (const [role, secret] of [
    ["Imposter", "Pineapple"],
    ["Crew", "Extraordinarily spectacular birthday celebration"],
  ]) {
    saved.state.session.roles[saved.state.players[0].id] = role;
    saved.state.session.options.hint = true;
    saved.state.session.options.chaos = false;
    saved.state.session.category = "Food";
    saved.state.session.secret = secret;
    await page.addInitScript(
      (data) => localStorage.setItem("hudl-game-v1", JSON.stringify(data)),
      saved,
    );
    await page.reload();
    await page.getByRole("button", { name: "Resume game" }).click();
    const hold = page.getByRole("button", { name: "Hold to peek" });
    await expect(hold).toBeEnabled({ timeout: 6000 });
    await hold.focus();
    const before = await hold.boundingBox();
    const scroll = await page.evaluate(() => scrollY);
    await page.keyboard.down("Space");
    const after = await page
      .getByRole("button", { name: "Release to hide" })
      .boundingBox();
    expect(Math.abs(before!.y - after!.y)).toBeLessThan(1);
    expect(await page.evaluate(() => scrollY)).toBe(scroll);
    if (role === "Imposter")
      await expect(page.locator(".imposter-hint strong")).toHaveText("Food");
    else
      await expect(
        page.getByRole("heading", { name: secret, exact: true }),
      ).toBeVisible();
    expect(
      await page
        .locator(".secret-content")
        .evaluate((el) => el.scrollHeight <= el.clientHeight + 1),
    ).toBe(true);
    expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
    await page.keyboard.up("Space");
    await expect(page.locator(".imposter-hint,.secret-word")).toHaveCount(0);
    await page.keyboard.down("Enter");
    await page.keyboard.press("Escape");
    await page.keyboard.up("Enter");
    await expect(page.locator(".imposter-hint,.secret-word")).toHaveCount(0);
    await expect(page.getByRole("dialog")).toBeVisible();
  }
});
