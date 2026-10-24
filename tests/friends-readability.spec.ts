import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
async function start(
  page: import("@playwright/test").Page,
  game: string,
  n: number,
  dark = false,
) {
  await page.addInitScript(() =>
    localStorage.setItem("hudl-welcome-v1", "true"),
  );
  await page.goto("/");
  if (dark)
    await page.getByRole("button", { name: "Switch to dark mode" }).click();
  await page
    .locator("article")
    .filter({ has: page.getByRole("heading", { name: game, exact: true }) })
    .getByRole("button", { name: /^Let’s play / })
    .click();
  for (const name of ["Maya", "Noah", "Zara", "Leo", "Ari"].slice(0, n)) {
    await page
      .getByRole("textbox", { name: "Player name", exact: true })
      .fill(name);
    await page.getByRole("button", { name: "Add player", exact: true }).click();
  }
  await page
    .getByRole("button", { name: `Let’s play, all ${n} of us` })
    .click();
}
for (const dark of [false, true])
  test(`private role controls are readable and compact in ${dark ? "dark" : "light"} mode`, async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await start(page, "Secret Hitler", 5, dark);
    await page
      .getByRole("button", { name: "Quick start", exact: true })
      .click();
    await page.getByRole("button", { name: "Open private card" }).click();
    const close = page.getByRole("button", {
      name: "Close private card",
      exact: true,
    });
    await expect(close).toBeVisible();
    const colors = await close.evaluate((el) => ({
      color: getComputedStyle(el).color,
      background: getComputedStyle(el).backgroundColor,
    }));
    expect(colors.color).toBe("rgb(250, 240, 213)");
    expect(colors.background).toBe("rgb(42, 32, 56)");
    const card = await page.locator(".parliament-private").boundingBox(),
      button = await close.boundingBox(),
      stage = await page.locator(".parliament-stage").boundingBox();
    expect(card!.height).toBeLessThan(590);
    const artwork = await page
      .locator(".parliament-private .parliament-cover")
      .boundingBox();
    expect(artwork!.height).toBeGreaterThanOrEqual(120);
    expect(button!.height).toBeLessThanOrEqual(50);
    expect(stage!.height).toBeLessThan(760);
    expect(button!.y + button!.height).toBeLessThan(800);
    const audit = await new AxeBuilder({ page })
      .include(".parliament-stage")
      .withTags(["wcag2a", "wcag2aa"])
      .analyze();
    expect(audit.violations).toEqual([]);
    await page.screenshot({
      path: `.impeccable/review/private-compact-${dark ? "dark" : "light"}.png`,
      fullPage: true,
    });
    await close.click();
    await expect(page.locator(".parliament-private h2")).toHaveCount(0);
  });
test("Friends 18+ category uses supplied topic questions and finishes five prompts", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await start(page, "Most Likely To", 3);
  await expect(
    page.getByRole("option", { name: "Friends 18+", exact: true }),
  ).toHaveAttribute("disabled", "");
  await page
    .getByRole("checkbox", { name: "Enable 18+ prompts for this adult group" })
    .check();
  await page
    .getByRole("combobox", { name: "Intensity", exact: true })
    .selectOption("Friends 18+");
  await page
    .getByRole("combobox", { name: "Friends 18+ topic", exact: true })
    .selectOption("Public chaos");
  await page.getByRole("button", { name: "Quick start", exact: true }).click();
  await expect(page.locator(".lede")).toContainText(
    "Friends 18+ · Public chaos",
  );
  const expected = [
    "slap someone in public",
    "get kicked out of a restaurant",
    "start a fight at a wedding",
    "get banned from a shop",
    "start an argument with a stranger for no reason",
    "cause a scene at a family event",
    "get into a fight with a taxi driver",
    "film a stranger's meltdown instead of helping",
    "shout at a cashier over something tiny",
    "get into a screaming match online",
    "cry in public over something stupid",
    "get stuck in a lift and panic",
    "steal something from a hotel room",
  ];
  for (let i = 0; i < 5; i++) {
    const prompt = await page.locator(".prompt-card h2").innerText();
    expect(expected).toContain(prompt.replace(/\?$/, ""));
    expect(prompt).not.toContain("??");
    await page
      .getByRole("button", { name: "Skip this prompt", exact: true })
      .click();
  }
  await expect(page.locator(".results-stage")).toBeVisible();
});
