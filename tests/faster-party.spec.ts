import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import fs from "node:fs";
const dir = ".impeccable/review/faster-party";
fs.mkdirSync(dir, { recursive: true });
test.beforeEach(async ({ page }) => {
  await page.addInitScript(() =>
    localStorage.setItem("hudl-welcome-v1", "true"),
  );
});
async function setup(page: any, classic = false) {
  await page.goto("/");
  if (classic)
    await page
      .getByRole("button", { name: "Play Charades", exact: true })
      .click();
  else
    await page
      .locator("article")
      .filter({
        has: page.getByRole("heading", { name: "Imposter", exact: true }),
      })
      .getByRole("button", { name: "Let’s play" })
      .click();
  for (const name of classic
    ? ["Maya", "Noah", "Zara", "Leo"]
    : ["Maya", "Noah", "Zara"]) {
    await page.getByLabel("Player name", { exact: true }).fill(name);
    await page.getByRole("button", { name: "Add player", exact: true }).click();
  }
  await page
    .getByRole("button", { name: `Let’s play, all ${classic ? 4 : 3} of us` })
    .click();
}
async function restore(page: any, change: (saved: any) => void) {
  const saved = await page.evaluate(() =>
    JSON.parse(localStorage.getItem("hudl-game-v1")!),
  );
  change(saved);
  await page.addInitScript(
    (data) => localStorage.setItem("hudl-game-v1", JSON.stringify(data)),
    saved,
  );
  await page.reload();
  await page.getByRole("button", { name: "Resume game" }).click();
}
async function peek(page: any) {
  const hold = page.getByRole("button", { name: "Hold to peek", exact: true });
  await expect(hold).toBeEnabled({ timeout: 6000 });
  await hold.focus();
  await page.keyboard.down("Space");
  await expect(page.locator(".secret-word,.imposter-role")).toBeVisible();
  await page.keyboard.up("Space");
}
test("familiar word hint, no timer, quick vote and swipe verdict protect secrets", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.setViewportSize({ width: 390, height: 844 });
  await setup(page);
  await expect(page.getByLabel("Voting style")).toHaveValue("point");
  await page.getByRole("button", { name: "No timer", exact: true }).click();
  await page.screenshot({ path: `${dir}/setup-phone.png`, fullPage: true });
  await page.getByRole("button", { name: "Quick start" }).click();
  await restore(page, (s) => {
    s.state.session.secret = "Pizza";
    s.state.session.category = "Food";
    s.state.session.roles[s.state.players[0].id] = "Imposter";
  });
  const hold = page.getByRole("button", { name: "Hold to peek" });
  await expect(hold).toBeEnabled({ timeout: 6000 });
  await hold.focus();
  await page.keyboard.down("Space");
  await expect(page.locator(".imposter-hint strong")).toHaveText("Cheese");
  await page.screenshot({ path: `${dir}/word-hint.png`, fullPage: true });
  await page.keyboard.up("Space");
  await expect(page.locator(".imposter-hint")).toHaveCount(0);
  await page.getByRole("button", { name: "Hide & pass" }).click();
  for (let i = 1; i < 3; i++) {
    await peek(page);
    await page
      .getByRole("button", {
        name: i === 2 ? "Everyone’s ready" : "Hide & pass",
        exact: true,
      })
      .click();
  }
  await expect(page.getByText("No timer · Play at your pace")).toBeVisible();
  await expect(page.getByRole("timer")).toHaveCount(0);
  await page.clock.install();
  await page.clock.runFor(180000);
  expect(
    await page.evaluate(
      () =>
        JSON.parse(localStorage.getItem("hudl-game-v1")!).state.session
          .timerRemaining,
    ),
  ).toBe(0);
  await page.getByRole("button", { name: "Time to vote" }).click();
  await expect(
    page.getByRole("heading", { name: "Point on three!" }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "It’s a tie — keep discussing" })
    .click();
  await expect(page.getByRole("status")).toContainText("No one is eliminated");
  await page.getByRole("button", { name: "Maya", exact: true }).click();
  await page.getByRole("button", { name: "Reveal the accused" }).click();
  await expect(
    page.getByRole("heading", { name: "THE IMPOSTER!", exact: true }),
  ).toHaveCount(0);
  await page.clock.runFor(600);
  await page.screenshot({ path: `${dir}/verdict-sealed.png`, fullPage: true });
  const envelope = await page.locator(".verdict-envelope").boundingBox();
  await page.mouse.move(
    envelope!.x + envelope!.width / 2,
    envelope!.y + envelope!.height * 0.75,
  );
  await page.mouse.down();
  await page.mouse.move(envelope!.x + envelope!.width / 2, envelope!.y + 20, {
    steps: 5,
  });
  await page.mouse.up();
  await expect(
    page.getByRole("heading", { name: "THE IMPOSTER!", exact: true }),
  ).toBeVisible();
  await page.clock.runFor(600);
  await page.screenshot({ path: `${dir}/verdict-open.png`, fullPage: true });
  await expect(page.locator(".stage")).toHaveCSS("opacity", "1");
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
});
test("legacy active secret ballots are retained while future rounds use quick voting", async ({
  page,
}) => {
  await setup(page);
  await page.getByRole("button", { name: "Quick start" }).click();
  await restore(page, (s) => {
    delete s.state.options.voteFlowVersion;
    s.state.options.voteMode = "secret";
    s.state.session.phase = "vote";
    s.state.session.options.voteMode = "secret";
    s.state.session.voterIndex = 1;
    s.state.session.votes = { [s.state.players[0].id]: s.state.players[2].id };
  });
  const state = await page.evaluate(
    () => JSON.parse(localStorage.getItem("hudl-game-v1")!).state,
  );
  expect(state.options.voteMode).toBe("point");
  expect(state.session.options.voteMode).toBe("secret");
  expect(Object.keys(state.session.votes)).toHaveLength(1);
  await expect(
    page.getByRole("heading", { name: "Pass to Noah", exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Use quick group vote" }).click();
  await expect(
    page.getByRole("heading", { name: "Point on three!" }),
  ).toBeVisible();
});
test("classic Charades is discoverable, private, untimed and advances to another actor", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await setup(page, true);
  await expect(page.getByLabel("Play style")).toHaveValue("classic");
  await page.getByLabel("Turn timer").selectOption("0");
  await page.getByRole("button", { name: "Quick start" }).click();
  await page.getByRole("button", { name: "Draw your prompt" }).click();
  await expect(
    page.getByRole("heading", { name: "Pass to Maya", exact: true }),
  ).toBeVisible();
  const secret = await page.evaluate(() => {
    const s = JSON.parse(localStorage.getItem("hudl-game-v1")!).state.session;
    return s.deck[s.cardIndex % s.deck.length];
  });
  await expect(page.locator(".secret-word")).toHaveCount(0);
  await peek(page);
  await page.getByRole("button", { name: "Hide & start acting" }).click();
  await expect(
    page.getByRole("heading", { name: "Maya, act it out!", exact: true }),
  ).toBeVisible();
  await expect(page.getByText(secret, { exact: true })).toHaveCount(0);
  await expect(page.getByRole("timer")).toHaveCount(0);
  await expect(page.locator(".stage")).toHaveCSS("opacity", "1");
  await page.screenshot({ path: `${dir}/charades-acting.png`, fullPage: true });
  await page.keyboard.press("ArrowRight");
  await expect(
    page.getByRole("heading", { name: "Pass to Zara", exact: true }),
  ).toBeVisible();
  expect(
    await page.evaluate(
      () =>
        JSON.parse(localStorage.getItem("hudl-game-v1")!).state.session.correct,
    ),
  ).toBe(1);
  await peek(page);
  await page.getByRole("button", { name: "Hide & start acting" }).click();
  await page.getByRole("button", { name: "Finish turn early" }).click();
  await page.getByRole("button", { name: "Pass to Team 2" }).click();
  await page.getByRole("button", { name: "Draw your prompt" }).click();
  await expect(
    page.getByRole("heading", { name: "Pass to Noah", exact: true }),
  ).toBeVisible();
  await expect(page.locator(".stage")).toHaveCSS("opacity", "1");
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
});
test("timed Charades pauses between private actor cards, reduced-motion verdict works by keyboard", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await setup(page, true);
  await page.getByRole("button", { name: "Quick start" }).click();
  await page.getByRole("button", { name: "Draw your prompt" }).click();
  await peek(page);
  await page.clock.install();
  await page.getByRole("button", { name: "Hide & start acting" }).click();
  await page.clock.runFor(5100);
  await page.keyboard.press("ArrowRight");
  const remaining = await page.evaluate(
    () =>
      JSON.parse(localStorage.getItem("hudl-game-v1")!).state.session
        .timerRemaining,
  );
  expect(remaining).toBe(55);
  await page.clock.runFor(20000);
  expect(
    await page.evaluate(
      () =>
        JSON.parse(localStorage.getItem("hudl-game-v1")!).state.session
          .timerRemaining,
    ),
  ).toBe(55);
  await restore(page, (s) => {
    s.state.session.game = "imposter";
    s.state.session.phase = "reveal";
    s.state.session.accused = s.state.players[0].id;
    s.state.session.roles[s.state.players[0].id] = "Crew";
  });
  const reveal = page.getByRole("button", { name: "Reveal identity" });
  await reveal.focus();
  await page.keyboard.press("Enter");
  await expect(page.getByRole("heading", { name: "INNOCENT!" })).toBeVisible();
  await expect(page.locator(".verdict-envelope")).toHaveCSS(
    "transition-duration",
    "0s",
  );
});
