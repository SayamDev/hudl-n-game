import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
test("Spyfall plays a full three-round match, preserves accusations and banks official points once", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.addInitScript(() =>
    localStorage.setItem("hudl-welcome-v1", "true"),
  );
  await page.goto("/");
  await page
    .getByRole("button", { name: "Let’s play Spyfall", exact: true })
    .click();
  for (const name of ["Maya", "Noah", "Zara"]) {
    await page
      .getByRole("textbox", { name: "Player name", exact: true })
      .fill(name);
    await page.getByRole("button", { name: "Add player", exact: true }).click();
  }
  await page.getByRole("button", { name: "Let’s play, all 3 of us" }).click();
  await page
    .getByRole("combobox", { name: "Match length", exact: true })
    .selectOption("3");
  await page.getByRole("button", { name: "Quick start", exact: true }).click();
  for (let round = 1; round <= 3; round++) {
    for (let i = 0; i < 3; i++) {
      await page
        .getByRole("button", { name: "Reveal card", exact: true })
        .click();
      await expect(page.locator(".secret-word")).toBeVisible();
      await page
        .getByRole("button", { name: i < 2 ? /Pass to/ : "Everyone’s ready" })
        .click();
    }
    await expect(page.locator(".lede")).toContainText(`Round ${round} of 3`);
    if (round === 1) {
      await page
        .getByRole("button", { name: "Make an accusation", exact: true })
        .click();
      await page.getByRole("button", { name: "Maya", exact: true }).click();
      await page.getByRole("button", { name: "Noah", exact: true }).click();
      await expect(
        page.getByRole("button", {
          name: "I’m the spy · guess the location",
          exact: true,
        }),
      ).toHaveCount(0);
      await page
        .getByRole("button", { name: "Not unanimous · keep questioning" })
        .click();
      await page
        .getByRole("button", { name: "Make an accusation", exact: true })
        .click();
      await expect(
        page.getByRole("button", { name: "Maya", exact: true }),
      ).toHaveCount(0);
      await page
        .getByRole("button", { name: "Cancel · keep questioning" })
        .click();
    }
    const saved = await page.evaluate(
      () => JSON.parse(localStorage.getItem("hudl-game-v1")!).state,
    );
    await page
      .getByRole("button", {
        name: "I’m the spy · guess the location",
        exact: true,
      })
      .click();
    await page
      .getByRole("button", { name: saved.session.secret, exact: true })
      .click();
    await expect(page.locator(".spy-round-stage")).toBeVisible();
    const publicState = await page.evaluate(
      () => JSON.parse(localStorage.getItem("hudl-game-v1")!).state,
    );
    expect(
      Object.values(publicState.session.spyMatch.scores).reduce(
        (a: number, b) => a + Number(b),
        0,
      ),
    ).toBe(round * 4);
    expect(
      publicState.players.every((p: { score: number }) => p.score === 0),
    ).toBe(true);
    if (round === 3) {
      await page.screenshot({
        path: ".impeccable/review/spyfall-match-phone.png",
        fullPage: true,
      });
      const axe = await new AxeBuilder({ page })
        .include(".spy-round-stage")
        .withTags(["wcag2a", "wcag2aa"])
        .analyze();
      expect(axe.violations).toEqual([]);
    }
    await page
      .getByRole("button", {
        name:
          round < 3
            ? `Deal round ${round + 1} · pass to Maya`
            : "See match results",
      })
      .click();
  }
  await expect(page.locator(".results-stage")).toBeVisible();
  const total = await page.evaluate(() =>
    JSON.parse(localStorage.getItem("hudl-game-v1")!).state.players.reduce(
      (s: number, p: { score: number }) => s + p.score,
      0,
    ),
  );
  expect(total).toBe(12);
  await page
    .getByRole("button", { name: "Rematch with this crew", exact: true })
    .click();
  await expect(
    page.getByRole("button", { name: "Reveal card", exact: true }),
  ).toBeVisible();
  const next = await page.evaluate(
    () => JSON.parse(localStorage.getItem("hudl-game-v1")!).state,
  );
  expect(next.session.spyMatch.rounds).toBe(3);
  expect(
    next.players.reduce((s: number, p: { score: number }) => s + p.score, 0),
  ).toBe(12);
});
test("lobby controls have distinct names, help matches current behavior and empty scores has a clear next step", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.addInitScript(() =>
    localStorage.setItem("hudl-welcome-v1", "true"),
  );
  await page.goto("/");
  const names = await page
    .locator(".night-play")
    .evaluateAll((buttons) => buttons.map((b) => b.getAttribute("aria-label")));
  expect(names.every(Boolean)).toBe(true);
  expect(new Set(names).size).toBe(names.length);
  await page
    .getByRole("button", { name: "Scores", exact: true })
    .last()
    .click();
  await expect(
    page.getByRole("heading", { name: "Your first win starts here." }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Pick a game", exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Settings", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Social Club", exact: true }),
  ).toBeHidden();
  await page.getByText("Appearance and legacy themes", { exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Social Club", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByText(/Other private cards stay open until/),
  ).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth > innerWidth,
    ),
  ).toBe(false);
});
test("cached app and a playable party round remain available offline", async ({
  page,
  context,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.addInitScript(() =>
    localStorage.setItem("hudl-welcome-v1", "true"),
  );
  await page.goto("/");
  await page.evaluate(() => navigator.serviceWorker.ready.then(() => true));
  await page.reload();
  await expect(
    page.getByRole("button", {
      name: "Let’s play Most Likely To",
      exact: true,
    }),
  ).toBeVisible();
  await context.setOffline(true);
  await page.reload();
  await page
    .getByRole("button", { name: "Let’s play Most Likely To", exact: true })
    .click();
  for (const name of ["Maya", "Noah", "Zara"]) {
    await page
      .getByRole("textbox", { name: "Player name", exact: true })
      .fill(name);
    await page.getByRole("button", { name: "Add player", exact: true }).click();
  }
  await page.getByRole("button", { name: "Let’s play, all 3 of us" }).click();
  await page.getByRole("button", { name: "Quick start", exact: true }).click();
  await expect(page.locator(".prompt-card h2")).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Skip this prompt", exact: true }),
  ).toBeVisible();
});
