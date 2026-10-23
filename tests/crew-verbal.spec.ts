import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import fs from "node:fs";
const dir = ".impeccable/review/crew-verbal";
fs.mkdirSync(dir, { recursive: true });
async function initial(page: any) {
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
  for (const name of ["Maya", "Noah", "Zara"]) {
    await page.getByLabel("Player name", { exact: true }).fill(name);
    await page.getByRole("button", { name: "Add player", exact: true }).click();
  }
  await page.getByRole("button", { name: "Let’s play, all 3 of us" }).click();
  await page.getByRole("button", { name: "Quick start" }).click();
  return page.evaluate(() => JSON.parse(localStorage.getItem("hudl-game-v1")!));
}
async function restore(page: any, saved: any) {
  await page.addInitScript(
    (s: any) => localStorage.setItem("hudl-game-v1", JSON.stringify(s)),
    saved,
  );
  await page.reload();
  const resume = page.getByRole("button", { name: "Resume game" });
  if (await resume.isVisible()) await resume.click();
}
test("replay and game selection ask for crew; setup edits preserve remaining identities and scores", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  const saved = await initial(page);
  saved.state.players[0].score = 8;
  saved.state.session.phase = "results";
  saved.state.session.awarded = true;
  saved.state.session.result = "The crew wins!";
  const maya = saved.state.players[0].id;
  await restore(page, saved);
  await page.getByRole("button", { name: "Play again", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Who’s in the huddle?" }),
  ).toBeVisible();
  await expect(page.getByText(/Same crew this round/)).toBeVisible();
  await page.getByRole("button", { name: "Remove Noah", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Add 1 more to play" }),
  ).toBeDisabled();
  await page.getByLabel("Player name", { exact: true }).fill("Leo");
  await page.getByRole("button", { name: "Add player", exact: true }).click();
  await page.screenshot({ path: `${dir}/replay-crew-390.png`, fullPage: true });
  await page.getByRole("button", { name: "Let’s play, all 3 of us" }).click();
  await page
    .getByRole("button", { name: "Edit crew · 3 players", exact: true })
    .click();
  await expect(
    page.getByRole("button", { name: "Remove Leo", exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Let’s play, all 3 of us" }).click();
  await page.getByRole("button", { name: "Quick start" }).click();
  const current = await page.evaluate(
    () => JSON.parse(localStorage.getItem("hudl-game-v1")!).state,
  );
  expect(current.players.find((p: any) => p.id === maya).score).toBe(8);
  expect(current.players.map((p: any) => p.name)).toEqual([
    "Maya",
    "Zara",
    "Leo",
  ]);
  expect(Object.keys(current.session.roles).sort()).toEqual(
    current.players.map((p: any) => p.id).sort(),
  );
  // A new game from the lobby also reviews an already saved crew.
  current.session = null;
  await restore(page, { ...saved, state: current });
  await page
    .locator("article")
    .filter({
      has: page.getByRole("heading", { name: "Where Are We?", exact: true }),
    })
    .getByRole("button", { name: "Let’s play" })
    .click();
  await expect(
    page.getByRole("heading", { name: "Who’s in the huddle?" }),
  ).toBeVisible();
});
test("verbal voting selects one accused without individual ballots or exposing other roles", async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 740 });
  const saved = await initial(page),
    accused = saved.state.players[0].id;
  saved.state.session.phase = "discuss";
  saved.state.session.timerRunning = false;
  saved.state.session.options.voteMode = "secret";
  saved.state.session.roles[accused] = "Imposter";
  await restore(page, saved);
  await page
    .getByRole("button", { name: "We voted out loud", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "Who did you choose?" }),
  ).toBeVisible();
  await expect(page.getByRole("button", { name: "Lock my vote" })).toHaveCount(
    0,
  );
  await page.getByRole("button", { name: "Maya", exact: true }).click();
  await page.screenshot({ path: `${dir}/verbal-320.png`, fullPage: true });
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth > innerWidth,
    ),
  ).toBe(false);
  await page.getByRole("button", { name: "Reveal the accused" }).click();
  await expect(page.getByRole("heading", { name: "Maya was…" })).toBeVisible();
  await expect(page.getByText("THE IMPOSTER!", { exact: true })).toHaveCount(0);
  await page.getByRole("button", { name: "Reveal identity" }).click();
  await expect(
    page.getByRole("heading", { name: "THE IMPOSTER!", exact: true }),
  ).toBeVisible();
});
test("switching a private ballot to verbal voting clears its partial votes and selection", async ({
  page,
}) => {
  const saved = await initial(page);
  saved.state.session.phase = "vote";
  saved.state.session.options.voteMode = "secret";
  saved.state.session.votes = {
    [saved.state.players[0].id]: saved.state.players[1].id,
  };
  saved.state.session.voterIndex = 1;
  await restore(page, saved);
  await expect(
    page.getByRole("button", { name: "I’m ready to vote" }),
  ).toBeEnabled({ timeout: 6000 });
  await page.getByRole("button", { name: "I’m ready to vote" }).click();
  await page.getByRole("button", { name: "Zara", exact: true }).click();
  await page
    .getByRole("button", { name: "We voted out loud", exact: true })
    .click();
  await expect(
    page.getByRole("button", { name: "Reveal the accused" }),
  ).toBeDisabled();
  const session = await page.evaluate(
    () => JSON.parse(localStorage.getItem("hudl-game-v1")!).state.session,
  );
  expect(session.votes).toEqual({});
  expect(session.voterIndex).toBe(0);
  expect(session.options.voteMode).toBe("point");
});
