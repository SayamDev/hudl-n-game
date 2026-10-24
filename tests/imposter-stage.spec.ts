import { test, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import fs from "node:fs";
const directory = ".impeccable/review/imposter-stage";
fs.mkdirSync(directory, { recursive: true });
async function seed(page: Page) {
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
  for (const name of ["Alexandria-Rose", "Noah", "Zara"]) {
    await page.getByLabel("Player name", { exact: true }).fill(name);
    await page.getByRole("button", { name: "Add player", exact: true }).click();
  }
  await page.getByRole("button", { name: "Let’s play, all 3 of us" }).click();
  await page.getByRole("button", { name: "Quick start" }).click();
  return page.evaluate(() => JSON.parse(localStorage.getItem("hudl-game-v1")!));
}
async function restore(page: Page, saved: any) {
  await page.addInitScript(
    (s) => localStorage.setItem("hudl-game-v1", JSON.stringify(s)),
    saved,
  );
  await page.reload();
  await page.getByRole("button", { name: "Resume game" }).click();
}
test("private words, hints and decoys fit without clipping or moving the hold target", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  const saved = await seed(page);
  const session = saved.state.session;
  session.options.hint = true;
  session.options.hintStyle = "category";
  session.category = "Movie characters and superheroes";
  session.secret = "The extraordinary adventures of a superhero";
  for (const [width, height] of [
    [320, 740],
    [390, 844],
    [820, 1024],
    [1440, 900],
  ]) {
    await page.setViewportSize({ width, height });
    for (const role of ["Crew", "Imposter"]) {
      session.roles[saved.state.players[0].id] = role;
      await restore(page, saved);
      const hold = page.getByRole("button", { name: "Hold to reveal" });
      await expect(hold).toBeEnabled();
      await hold.focus();
      const before = await hold.boundingBox();
      await page.keyboard.down("Space");
      const card = page.locator(".private-secret");
      await expect(card).toBeVisible();
      expect(
        await card.evaluate((el) => el.scrollHeight <= el.clientHeight + 1),
        `${role} at ${width}px`,
      ).toBe(true);
      await expect(
        card.getByRole("heading", {
          name: role === "Crew" ? session.secret : "IMPOSTER",
          exact: true,
        }),
      ).toBeVisible();
      const name = card.getByRole("heading");
      const bounds = await card.boundingBox();
      const text = await name.boundingBox();
      expect(text!.y).toBeGreaterThanOrEqual(bounds!.y);
      expect(text!.y + text!.height).toBeLessThan(bounds!.y + bounds!.height);
      await page.screenshot({
        path: `${directory}/private-${role}-${width}.png`,
        fullPage: true,
      });
      await page.keyboard.up("Space");
      await expect(card).toHaveCount(0);
      expect(Math.abs((await hold.boundingBox())!.y - before!.y)).toBeLessThan(
        1,
      );
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
      ).toBe(true);
      const pass = await page
        .getByRole("button", { name: "Hide & pass to Noah" })
        .boundingBox();
      expect(pass!.y + pass!.height).toBeLessThanOrEqual(height);
    }
  }
  await page.setViewportSize({ width: 320, height: 740 });
  session.options.chaos = true;
  session.decoy = "An unexpectedly elaborate birthday party";
  await restore(page, saved);
  const hold = page.getByRole("button", { name: "Hold to reveal" });
  await expect(hold).toBeEnabled();
  await hold.focus();
  await page.keyboard.down("Space");
  await expect(page.getByText(session.decoy, { exact: true })).toBeVisible();
  expect(
    await page
      .locator(".private-secret")
      .evaluate((el) => el.scrollHeight <= el.clientHeight + 1),
  ).toBe(true);
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
  await page.keyboard.up("Space");
});
test("clue turns show the actual speaker and one main group-vote action within the viewport", async ({
  page,
}) => {
  const saved = await seed(page),
    session = saved.state.session;
  session.phase = "discuss";
  session.options.voteMode = "point";
  session.options.seconds = 0;
  session.startingPlayer = saved.state.players[0].id;
  session.direction = "clockwise";
  for (const [width, height] of [
    [320, 740],
    [390, 844],
    [820, 1024],
    [1440, 900],
  ]) {
    await page.setViewportSize({ width, height });
    await restore(page, saved);
    await expect(page.locator(".clue-speaker strong")).toHaveText(
      "Alexandria-Rose",
    );
    await expect(page.locator(".clue-next strong")).toHaveText("Noah");
    await expect(
      page.getByRole("button", { name: "We voted out loud" }),
    ).toHaveCount(0);
    const vote = page.getByRole("button", { name: "Choose a suspect" });
    const bounds = await vote.boundingBox();
    expect(bounds!.y + bounds!.height).toBeLessThanOrEqual(height);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    await page.screenshot({
      path: `${directory}/clues-${width}.png`,
      fullPage: true,
    });
    expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
  }
  for (const name of ["Noah", "Zara", "Alexandria-Rose"]) {
    await page.getByRole("button", { name: "Next clue", exact: true }).click();
    await expect(page.locator(".clue-speaker strong")).toHaveText(name);
  }
  await expect(page.getByText("Clue round 2", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Choose a suspect" }).click();
  await expect(
    page.getByRole("heading", { name: "Who did you choose?" }),
  ).toBeVisible();
  session.options.voteMode = "secret";
  session.direction = "anticlockwise";
  await restore(page, saved);
  await expect(page.locator(".clue-next strong")).toHaveText("Zara");
  await page.getByRole("button", { name: "We voted out loud" }).click();
  await expect(
    page.getByRole("heading", { name: "Who did you choose?" }),
  ).toBeVisible();
  await restore(page, saved);
  await page.getByRole("button", { name: "Start secret voting" }).click();
  await expect(
    page.getByRole("heading", { name: "Pass to Alexandria-Rose" }),
  ).toBeVisible();
});
test("public verdict has skippable suspense, immediate keyboard/reduced motion, and cancels on pause", async ({
  page,
}) => {
  const saved = await seed(page),
    session = saved.state.session;
  session.phase = "reveal";
  session.accused = saved.state.players[0].id;
  session.roles[session.accused] = "Imposter";
  await restore(page, saved);
  await page.getByRole("button", { name: "Reveal identity" }).click();
  await expect(page.getByText("The room goes quiet…")).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "THE IMPOSTER!" }),
  ).toHaveCount(0);
  await page.getByRole("button", { name: "Reveal now" }).click();
  await expect(
    page.getByRole("heading", { name: "THE IMPOSTER!" }),
  ).toBeVisible();
  await expect(page.locator(".verdict-envelope")).toHaveCSS("opacity", "0");
  await page.screenshot({ path: `${directory}/verdict.png`, fullPage: true });
  await restore(page, saved);
  await page.getByRole("button", { name: "Reveal identity" }).click();
  await expect(
    page.getByRole("heading", { name: "THE IMPOSTER!" }),
  ).toBeVisible();
  await restore(page, saved);
  await page.getByRole("button", { name: "Reveal identity" }).focus();
  await page.keyboard.press("Enter");
  await expect(
    page.getByRole("heading", { name: "THE IMPOSTER!" }),
  ).toBeVisible();
  await expect(page.getByRole("button", { name: "Reveal now" })).toHaveCount(0);
  await restore(page, saved);
  await page.getByRole("button", { name: "Reveal identity" }).click();
  await page.keyboard.press("Escape");
  await page.getByRole("button", { name: "Resume game" }).click();
  await expect(
    page.getByRole("button", { name: "Reveal identity" }),
  ).toBeVisible();
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.getByRole("button", { name: "Reveal identity" }).click();
  await expect(
    page.getByRole("heading", { name: "THE IMPOSTER!" }),
  ).toBeVisible();
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
});
