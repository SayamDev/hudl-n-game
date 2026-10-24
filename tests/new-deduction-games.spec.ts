import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
async function crew(
  page: import("@playwright/test").Page,
  game: string,
  n: number,
) {
  await page.addInitScript(() =>
    localStorage.setItem("hudl-welcome-v1", "true"),
  );
  await page.goto("/");
  await page
    .locator("article")
    .filter({ has: page.getByRole("heading", { name: game, exact: true }) })
    .getByRole("button", { name: "Let’s play", exact: true })
    .click();
  for (const name of [
    "Maya",
    "Noah",
    "Zara",
    "Leo",
    "Ari",
    "Sam",
    "Jo",
    "Ash",
    "Bo",
    "Kit",
  ].slice(0, n)) {
    await page
      .getByRole("textbox", { name: "Player name", exact: true })
      .fill(name);
    await page.getByRole("button", { name: "Add player", exact: true }).click();
  }
  await page
    .getByRole("button", { name: `Let’s play, all ${n} of us` })
    .click();
}
test("Secret Hitler deals private roles, seals ballots and passes policies without leaking them", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await crew(page, "Secret Hitler", 5);
  await page.getByRole("button", { name: "Quick start", exact: true }).click();
  for (let i = 0; i < 5; i++) {
    await expect(
      page.getByRole("button", { name: "Open private card" }),
    ).toBeVisible();
    await expect(page.locator(".parliament-private h2")).toHaveCount(0);
    await page.getByRole("button", { name: "Open private card" }).click();
    await expect(page.locator(".parliament-private h2")).toBeVisible();
    if (i === 0) {
      await page.evaluate(() => window.dispatchEvent(new Event("blur")));
      await expect(page.locator(".parliament-private h2")).toHaveCount(0);
      await page.getByRole("button", { name: "Open private card" }).click();
    }
    await page
      .getByRole("button", {
        name: i < 4 ? /Hide & pass to/ : "Hide & begin election",
      })
      .click();
  }
  await page.screenshot({
    path: ".impeccable/review/parliament-phone.png",
    fullPage: true,
  });
  await page.locator(".player-option").first().click();
  for (let i = 0; i < 5; i++) {
    await page.getByRole("button", { name: /I’m .* · vote/ }).click();
    await page.getByRole("button", { name: "Yes · elect" }).click();
  }
  await expect(
    page.getByRole("heading", { name: "Government elected" }),
  ).toBeVisible();
  await expect(page.locator(".parliament-stage li")).toHaveCount(5);
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  await expect(page.locator(".policy-tile")).toHaveCount(0);
  await page.getByRole("button", { name: "Open private card" }).click();
  await expect(page.locator(".policy-tile")).toHaveCount(3);
  await page.locator(".policy-tile").first().click();
  await expect(page.locator(".policy-tile")).toHaveCount(0);
  await page.getByRole("button", { name: "Open private card" }).click();
  await expect(page.locator(".policy-tile")).toHaveCount(2);
  await page.locator(".policy-tile").first().click();
  await expect(
    page.getByRole("heading", { name: /policy enacted/ }),
  ).toBeVisible();
  expect(errors).toEqual([]);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth > innerWidth,
    ),
  ).toBe(false);
  const accessibility = await new AxeBuilder({ page })
    .include(".parliament-stage")
    .withTags(["wcag2a", "wcag2aa"])
    .analyze();
  expect(accessibility.violations).toEqual([]);
});
test("Spyfall uses eight minutes, persistent private cards, and unanimous accusation", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await crew(page, "Spyfall", 3);
  await page.getByRole("button", { name: "Quick start", exact: true }).click();
  for (let i = 0; i < 3; i++) {
    await page
      .getByRole("button", { name: "Reveal card", exact: true })
      .click();
    await expect(page.locator(".secret-word")).toBeVisible();
    await page.mouse.up();
    await expect(page.locator(".secret-word")).toBeVisible();
    await page
      .getByRole("button", { name: i < 2 ? /Pass to/ : "Everyone’s ready" })
      .click();
  }
  await expect(page.locator(".timer")).toContainText(/(8:00|7:)/);
  await page.getByRole("button", { name: "Make an accusation" }).click();
  await page.locator(".player-options .button").first().click();
  await expect(
    page.getByRole("heading", { name: "Does everyone else agree?" }),
  ).toBeVisible();
  await page.getByRole("button", { name: /Everyone else agrees/ }).click();
  await expect(page.locator(".results-stage")).toBeVisible();
});
test("adult pack is opt-in and both new covers load in light and dark presentations", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await crew(page, "Most Likely To", 3);
  await expect(
    page.getByRole("option", { name: "After Dark 18+", exact: true }),
  ).toHaveCount(0);
  await expect(page.locator(".scene-transition")).toHaveCount(0);
  await page
    .getByRole("checkbox", { name: "Enable 18+ prompts for this adult group" })
    .check();
  await page
    .getByRole("combobox", { name: "Intensity", exact: true })
    .selectOption("After Dark 18+");
  await page.getByRole("button", { name: "Quick start", exact: true }).click();
  await expect(page.locator(".lede")).toContainText("After Dark 18+");
  await expect(
    page.getByRole("button", { name: "Skip this prompt" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Pause game", exact: true }).click();
  await page
    .getByRole("button", { name: "Leave this game", exact: true })
    .click();
  await page.getByRole("button", { name: "Leave round", exact: true }).click();
  for (const dark of [false, true]) {
    await page.setViewportSize(
      dark ? { width: 1280, height: 900 } : { width: 390, height: 844 },
    );
    await page.evaluate((dark) => {
      const key = Object.keys(localStorage).find((k) => {
        try {
          return JSON.parse(localStorage.getItem(k)!).state?.preferences;
        } catch {
          return false;
        }
      })!;
      const saved = JSON.parse(localStorage.getItem(key)!);
      saved.state.session = null;
      saved.state.preferences.dark = dark;
      localStorage.setItem(key, JSON.stringify(saved));
    }, dark);
    await page.reload();
    for (const name of ["Spyfall", "Secret Hitler"]) {
      const article = page
        .locator("article")
        .filter({ has: page.getByRole("heading", { name, exact: true }) });
      await article.scrollIntoViewIfNeeded();
      const img = article.locator("img");
      await expect(img).toBeVisible();
      expect(
        await img.evaluate(
          (i: HTMLImageElement) => i.complete && i.naturalWidth > 0,
        ),
      ).toBe(true);
    }
    await page.screenshot({
      path: `.impeccable/review/new-games-${dark ? "dark" : "light"}.png`,
      fullPage: true,
    });
  }
});
