import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import fs from "node:fs";
test("private swipe and hold conceal on release, including keyboard and named handoff", async ({
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
    await page
      .getByRole("textbox", { name: "Player name", exact: true })
      .fill(name);
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
    page.getByRole("button", { name: "Read private card" }),
  ).toBeEnabled();
  await expect(
    page.getByRole("button", { name: "Pass to Noah" }),
  ).toBeDisabled();
  await expect(page.getByText("Hold to reveal", { exact: true })).toHaveCount(
    0,
  );
  const gesture = await page.locator(".private-swipe p").boundingBox();
  const gestureX = gesture!.x + 20;
  const gestureY = gesture!.y + gesture!.height / 2;
  await page.mouse.move(gestureX, gestureY);
  await page.mouse.down();
  await expect(page.locator(".private-secret")).toHaveCount(0);
  await page.mouse.move(gestureX, gestureY - 100, { steps: 12 });
  await expect(
    page.getByRole("heading", { name: "IMPOSTER", exact: true }),
  ).toBeVisible();
  const ground = await page
    .locator(".private-secret")
    .evaluate((el) => getComputedStyle(el).backgroundColor);
  await page.mouse.up();
  await expect(page.locator(".private-secret")).toHaveCount(0);
  const firstPortrait = await page
    .locator(".private-portrait [data-portrait]")
    .getAttribute("data-portrait");
  await page.getByRole("button", { name: "Pass to Noah" }).click();
  await expect(
    page.getByRole("heading", { name: "Your turn Noah" }),
  ).toBeVisible();
  expect(
    await page
      .locator(".private-portrait [data-portrait]")
      .getAttribute("data-portrait"),
  ).not.toBe(firstPortrait);
  const hold = page.getByRole("button", { name: "Read private card" });
  await expect(hold).toBeEnabled();
  await hold.focus();
  const before = await hold.boundingBox();
  await page.keyboard.down("Space");
  await expect(
    page.getByRole("heading", { name: "Pizza", exact: true }),
  ).toBeVisible();
  expect(
    await page
      .locator(".private-secret")
      .evaluate((el) => getComputedStyle(el).backgroundColor),
  ).toBe(ground);
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
  await page.keyboard.up("Space");
  await expect(page.locator(".private-secret")).toHaveCount(0);
  await expect(hold).toBeVisible();
  const after = await hold.boundingBox();
  expect(Math.abs(before!.y - after!.y)).toBeLessThan(1);
  await hold.focus();
  await page.keyboard.down("Enter");
  await expect(page.locator(".private-secret")).toBeVisible();
  await page.keyboard.press("Escape");
  await page.keyboard.up("Enter");
  await expect(page.locator(".private-secret")).toHaveCount(0);
  await page.getByRole("button", { name: "Resume game" }).click();
  for (const width of [320, 390, 820, 1440]) {
    await page.setViewportSize({ width, height: width > 700 ? 1000 : 844 });
    await page.evaluate(() => scrollTo({ top: 0, behavior: "instant" }));
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth > innerWidth,
      ),
    ).toBe(false);
    const box = await page
      .getByRole("button", { name: "Pass to Zara" })
      .boundingBox();
    expect(box!.y + box!.height).toBeLessThanOrEqual(width > 700 ? 1000 : 844);
    fs.mkdirSync(".impeccable/review/private-swipe", { recursive: true });
    await page.screenshot({
      path: `.impeccable/review/private-swipe/${width}.png`,
      fullPage: true,
    });
  }
  await page.getByRole("button", { name: "Pass to Zara" }).click();
  const last = page.getByRole("button", { name: "Read private card" });
  await expect(last).toBeEnabled();
  await last.focus();
  await page.keyboard.down("Space");
  await page.keyboard.up("Space");
  await page.getByRole("button", { name: "Start the clues" }).click();
  const turn = await page.locator(".start-player strong").textContent();
  await page.getByRole("button", { name: /Next clue/ }).click();
  expect(await page.locator(".start-player strong").textContent()).not.toBe(
    turn,
  );
});
