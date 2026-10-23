import { test, expect } from "@playwright/test";
test.beforeEach(async ({ page }) => {
  await page.addInitScript(() =>
    localStorage.setItem("hudl-welcome-v1", "true"),
  );
});
import AxeBuilder from "@axe-core/playwright";
const crew = ["Maya", "Noah", "Zara", "Leo", "Amira"];
async function addCrew(page: any, game = "Imposter") {
  await page.goto("/");
  await page
    .locator("article")
    .filter({ has: page.getByRole("heading", { name: game, exact: true }) })
    .getByRole("button", { name: "Let’s play" })
    .click();
  for (const n of crew) {
    await page.getByLabel("Player name", { exact: true }).fill(n);
    await page.getByRole("button", { name: "Add player", exact: true }).click();
  }
  await page.getByRole("button", { name: "Let’s play, all 5 of us" }).click();
}
async function peekAll(page: any) {
  for (let i = 0; i < 5; i++) {
    const hold = page.getByRole("button", { name: "Hold to peek" });
    await expect(hold).toBeEnabled({ timeout: 6000 });
    await hold.focus();
    await page.keyboard.down("Space");
    await expect(
      page
        .getByText("Keep it to yourself.", { exact: true })
        .or(page.getByText(/^Hint:/))
        .or(page.getByText(/^Your team:/)),
    ).toBeVisible();
    await page.keyboard.up("Space");
    await expect(
      page.getByText("Your secret stays hidden until you hold."),
    ).toBeVisible();
    await page
      .getByRole("button", {
        name: i === 4 ? "Everyone’s ready" : "Hide & pass",
        exact: true,
      })
      .click();
  }
}
test("phone Imposter round, hold privacy, voting, results and replay", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await addCrew(page);
  await page.getByLabel("Voting style").selectOption("point");
  await page.getByRole("button", { name: "Quick start" }).click();
  await peekAll(page);
  await page.getByRole("button", { name: "Time to vote" }).click();
  await page.getByRole("button", { name: /Maya/ }).click();
  await page.getByRole("button", { name: "Reveal the accused" }).click();
  await page.getByRole("button", { name: "Reveal identity" }).click();
  if (await page.getByRole("button", { name: "One last guess" }).isVisible()) {
    await page.getByRole("button", { name: "One last guess" }).click();
    await page.getByLabel("Your guess").fill("Definitely incorrect");
    await page.getByRole("button", { name: "Lock it in" }).click();
  } else await page.getByRole("button", { name: "See results" }).click();
  await expect(
    page.getByRole("button", { name: "Play again", exact: true }),
  ).toBeVisible();
  await expect(page.getByText(/The secret was/)).toBeVisible();
  await page.getByRole("button", { name: "Play again", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Who’s in the huddle?" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Let’s play, all 5 of us" }).click();
  await page.getByRole("button", { name: "Quick start" }).click();
  await expect(
    page.getByRole("heading", { name: "Pass to Maya" }),
  ).toBeVisible();
});
test("refresh restores a paused game and hides secrets", async ({ page }) => {
  await addCrew(page);
  await page.getByRole("button", { name: "Quick start" }).click();
  await expect(page.getByRole("button", { name: "Hold to peek" })).toBeEnabled({
    timeout: 6000,
  });
  await page.reload();
  await expect(
    page.getByRole("heading", { name: "Chaos, on hold." }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Resume game" }).click();
  await expect(
    page.getByText("Your secret stays hidden until you hold."),
  ).toBeVisible();
});
test("pack creation, link import and bad links", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Packs", exact: true }).click();
  await page
    .getByRole("button", { name: "Write your own", exact: true })
    .click();
  await page.getByLabel("Pack name").fill("Picnic crew");
  await page
    .getByLabel("Words", { exact: true })
    .fill("Blanket\nBasket\nSandwich\nJuice\nFrisbee\nAnt");
  await page.getByRole("button", { name: "Save pack" }).click();
  await page.getByRole("button", { name: "Share", exact: true }).click();
  const link = await page.getByLabel("Shareable pack link").inputValue();
  await page.goto(link);
  await page.reload();
  await expect(
    page.getByRole("heading", { name: "Import “Picnic crew”?" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Import pack", exact: true }).click();
  await expect(
    page.getByText("Pack imported. Find it in game settings."),
  ).toBeVisible();
  await page.goto("/#pack=broken");
  await page.reload();
  await expect(page.getByRole("alert")).toBeVisible();
});
test("responsive home and accessibility in both themes", async ({ page }) => {
  for (const width of [320, 390, 768, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/");
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
  }
  await page.getByRole("button", { name: "Switch to dark mode" }).click();
  let scan = await new AxeBuilder({ page }).analyze();
  expect(scan.violations).toEqual([]);
  await page.getByRole("button", { name: "Switch to light mode" }).click();
  scan = await new AxeBuilder({ page }).analyze();
  expect(scan.violations).toEqual([]);
});
test("offline reload and lazy game start work from precache", async ({
  page,
  context,
}) => {
  await page.goto("/");
  await page.evaluate(async () => {
    await navigator.serviceWorker.ready;
  });
  await page.reload();
  await expect
    .poll(() => page.evaluate(() => !!navigator.serviceWorker.controller))
    .toBe(true);
  await context.setOffline(true);
  await addCrew(page, "Where Are We?");
  await page.getByRole("button", { name: "Quick start" }).click();
  await expect(
    page.getByRole("heading", { name: "Pass to Maya" }),
  ).toBeVisible();
  await page.reload();
  await expect(page.getByRole("button", { name: "Resume game" })).toBeVisible();
  await context.setOffline(false);
});
test("Heads Up teams finish and score", async ({ page }) => {
  await addCrew(page, "Heads Up!");
  await page.getByRole("button", { name: "Quick start" }).click();
  for (let team = 0; team < 2; team++) {
    await page.getByRole("button", { name: "Start the clock" }).click();
    await page.getByRole("button", { name: "Correct", exact: true }).click();
    await page.getByRole("button", { name: "Skip", exact: true }).click();
    await page.getByRole("button", { name: "Finish turn early" }).click();
    await page
      .getByRole("button", {
        name: team === 0 ? "Pass to Team 2" : "See the winners",
      })
      .click();
  }
  await expect(
    page.getByRole("heading", { name: "A glorious draw!" }),
  ).toBeVisible();
});
test("Most Likely To completes five prompts", async ({ page }) => {
  await addCrew(page, "Most Likely To");
  await page.getByRole("button", { name: "Quick start" }).click();
  for (let i = 0; i < 5; i++) {
    await page
      .getByRole("button", { name: "Point on three", exact: true })
      .click();
    await page.getByRole("button", { name: /Maya/ }).click();
    await page
      .getByRole("button", { name: i === 4 ? "See results" : "Next prompt" })
      .click();
  }
  await expect(
    page.getByRole("button", { name: "Play again", exact: true }),
  ).toBeVisible();
});
test("Mafia night actions, private detective finding and village win", async ({
  page,
}) => {
  await addCrew(page, "Mafia");
  await page.getByLabel("Voting style").selectOption("point");
  await page.getByRole("button", { name: "Quick start" }).click();
  await peekAll(page);
  const data = await page.evaluate(
    () => JSON.parse(localStorage.getItem("hudl-game-v1")!).state,
  );
  const mafia = data.players.find(
    (p: any) => data.session.roles[p.id] === "Mafia",
  );
  const victim = data.players.find(
    (p: any) => data.session.roles[p.id] === "Villager",
  );
  await page.getByRole("button", { name: "Begin night" }).click();
  await page.getByRole("button", { name: "Mafia is ready" }).click();
  await page.getByRole("button", { name: new RegExp(victim.name) }).click();
  await page.getByRole("button", { name: "Confirm team choice" }).click();
  await page.getByRole("button", { name: "Doctor is ready" }).click();
  await page.getByRole("button", { name: new RegExp(victim.name) }).click();
  await page.getByRole("button", { name: "Confirm choice" }).click();
  await page.getByRole("button", { name: "Detective is ready" }).click();
  await page.getByRole("button", { name: new RegExp(mafia.name) }).click();
  await page.getByRole("button", { name: "Confirm choice" }).click();
  await expect(page.getByText("Your finding is hidden.")).toBeVisible();
  await page.getByRole("button", { name: "Hold to see finding" }).focus();
  await page.keyboard.down("Space");
  await expect(
    page.getByText(`${mafia.name} is Mafia.`, { exact: true }),
  ).toBeVisible();
  await page.keyboard.up("Space");
  await page.getByRole("button", { name: "Hide result & close eyes" }).click();
  await expect(page.getByText("Night 1: Everyone survived.")).toBeVisible();
  await page.getByRole("button", { name: "Gather the village" }).click();
  await page.getByRole("button", { name: "Vote someone out" }).click();
  await page.getByRole("button", { name: new RegExp(mafia.name) }).click();
  await page.getByRole("button", { name: "Reveal the accused" }).click();
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Village wins!" }),
  ).toBeVisible();
});
test("Hot Takes keeps each rating private until the group reveal", async ({
  page,
}) => {
  await addCrew(page, "Most Likely To");
  await page.getByLabel("Play style").selectOption("takes");
  await page.getByRole("button", { name: "Quick start" }).click();
  await page.getByRole("button", { name: "Pass & rate it" }).click();
  for (let i = 0; i < 5; i++) {
    await expect(
      page.getByRole("heading", { name: `Pass to ${crew[i]}` }),
    ).toBeVisible();
    await page.getByRole("button", { name: "I’m ready", exact: true }).click();
    await page.getByRole("slider").fill(String(i * 20));
    await page.getByRole("button", { name: "Lock my take" }).click();
  }
  await expect(
    page.getByRole("heading", { name: "The group split" }),
  ).toBeVisible();
  await expect(page.getByText("80% agree")).toBeVisible();
});

test("optional secret voting keeps ballots private and reaches a reveal", async ({
  page,
}) => {
  await addCrew(page);
  await page.getByLabel("Voting style").selectOption("secret");
  await page.getByRole("button", { name: "Quick start" }).click();
  await peekAll(page);
  await page.getByRole("button", { name: "Time to vote" }).click();
  for (let i = 0; i < 5; i++) {
    await expect(
      page.getByRole("heading", { name: `Pass to ${crew[i]}` }),
    ).toBeVisible();
    const ready = page.getByRole("button", { name: "I’m ready to vote" });
    await expect(ready).toBeEnabled({ timeout: 6000 });
    await ready.click();
    await page.getByRole("button", { name: /Maya/ }).click();
    await page.getByRole("button", { name: "Lock my vote" }).click();
  }
  await expect(page.getByRole("heading", { name: "Maya was…" })).toBeVisible();
});

test("Spy final guess resolves a full round", async ({ page }) => {
  await addCrew(page, "Where Are We?");
  await page.getByRole("button", { name: "Quick start" }).click();
  for (let i = 0; i < 5; i++) {
    const hold = page.getByRole("button", { name: "Hold to peek" });
    await expect(hold).toBeEnabled({ timeout: 6000 });
    await hold.focus();
    await page.keyboard.down("Space");
    await expect(
      page.getByText("YOUR LOCATION", { exact: true }),
    ).toBeVisible();
    await page.keyboard.up("Space");
    await page
      .getByRole("button", {
        name: i === 4 ? "Everyone’s ready" : "Hide & pass",
        exact: true,
      })
      .click();
  }
  const secret = await page.evaluate(
    () =>
      JSON.parse(localStorage.getItem("hudl-game-v1")!).state.session.secret,
  );
  await page.getByRole("button", { name: "Spy wants to guess" }).click();
  await page.getByRole("button", { name: secret, exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "The spy found the place!" }),
  ).toBeVisible();
});

test("landscape controls, reduced motion and large text remain usable", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.setViewportSize({ width: 844, height: 390 });
  await addCrew(page, "Heads Up!");
  await page.getByRole("button", { name: "Quick start" }).click();
  await page.getByRole("button", { name: "Start the clock" }).click();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await expect(
    page.getByRole("button", { name: "Correct", exact: true }),
  ).toBeInViewport();
  await expect(
    page.getByRole("button", { name: "Skip", exact: true }),
  ).toBeInViewport();
  await page.screenshot({
    path: ".impeccable/review/alibis-confirm/landscape-viewport.png",
  });
  await page.getByRole("button", { name: "Correct", exact: true }).click();
  await page.getByRole("button", { name: "Pause game" }).click();
  await page
    .getByRole("button", { name: "Leave this game", exact: true })
    .click();
  await page.getByRole("button", { name: "Leave round", exact: true }).click();
  await page.getByRole("button", { name: "Settings", exact: true }).click();
  await page.getByLabel("Larger text").check();
  await page.getByLabel("High contrast").check();
  await page.setViewportSize({ width: 390, height: 844 });
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  const scan = await new AxeBuilder({ page }).analyze();
  expect(scan.violations).toEqual([]);
  await page.getByLabel("Dark party mode").check();
  expect(
    await page.evaluate(() =>
      getComputedStyle(document.documentElement)
        .getPropertyValue("--muted")
        .trim(),
    ),
  ).toBe("#f3f4ed");
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
});

test("design can be reverted and the explicit Imposter role stays private", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await addCrew(page);
  await page.getByRole("button", { name: "Quick start" }).click();
  const saved = await page.evaluate(() =>
    JSON.parse(localStorage.getItem("hudl-game-v1")!),
  );
  saved.state.session.roles[saved.state.players[0].id] = "Imposter";
  saved.state.session.options.chaos = true;
  saved.state.session.decoy = "Moonlight";
  await page.addInitScript((data) => {
    if (!sessionStorage.getItem("role-seeded")) {
      localStorage.setItem("hudl-game-v1", JSON.stringify(data));
      sessionStorage.setItem("role-seeded", "yes");
    }
  }, saved);
  await page.reload();
  await page.getByRole("button", { name: "Resume game" }).click();
  const hold = page.getByRole("button", { name: "Hold to peek" });
  await expect(hold).toBeEnabled({ timeout: 6000 });
  await expect(
    page.getByRole("heading", { name: "IMPOSTER", exact: true }),
  ).toHaveCount(0);
  await hold.focus();
  await page.keyboard.down("Space");
  await expect(
    page.getByRole("heading", { name: "IMPOSTER", exact: true }),
  ).toBeVisible();
  await expect(page.getByText("Your decoy word: Moonlight")).toBeVisible();
  const box = await page
    .getByRole("button", { name: "Hold to peek" })
    .boundingBox();
  expect(box!.y + box!.height).toBeLessThanOrEqual(844);
  await page.keyboard.up("Space");
  await expect(
    page.getByRole("heading", { name: "IMPOSTER", exact: true }),
  ).toHaveCount(0);
  await expect(page.getByText("Your decoy word: Moonlight")).toHaveCount(0);
  await page.getByRole("button", { name: "Pause game" }).click();
  await page
    .getByRole("button", { name: "Leave this game", exact: true })
    .click();
  await page.getByRole("button", { name: "Leave round", exact: true }).click();
  await page.getByRole("button", { name: "Settings", exact: true }).click();
  await page.getByRole("button", { name: "Classic", exact: true }).click();
  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("data-design", "classic");
  await expect(
    page.getByRole("heading", { name: /Less scrolling/ }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Settings", exact: true }).click();
  await page.getByRole("button", { name: "Social Club", exact: true }).click();
  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("data-design", "club");
  await expect(
    page.getByRole("heading", { name: /Good company/ }),
  ).toBeVisible();
  expect(
    await page.evaluate(
      () =>
        JSON.parse(localStorage.getItem("hudl-game-v1")!).state.players.length,
    ),
  ).toBe(5);
});

test("branded identities, round controls, visible motion and original design fallback", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await expect(page.locator(".alibi-lineup .identity")).toHaveCount(3);
  await expect(
    page.getByRole("button", { name: "Replay the card animation" }),
  ).toHaveCount(0);
  const cast = await page
    .locator(".alibi-lineup .identity")
    .evaluateAll((nodes) => nodes.map((n) => n.innerHTML));
  expect(new Set(cast).size).toBe(3);
  await addCrew(page);
  await page.getByRole("button", { name: "More imposters" }).click();
  await expect(
    page.getByRole("status", { name: "Number of imposters", exact: true }),
  ).toHaveText("2");
  await page
    .getByLabel("Surprise number of imposters", { exact: false })
    .check();
  await expect(
    page.getByRole("button", { name: "More imposters" }),
  ).toBeDisabled();
  await page
    .getByLabel("Surprise number of imposters", { exact: false })
    .uncheck();
  await page.locator(".time-options button").nth(2).click();
  await expect(page.locator(".time-options button").nth(2)).toHaveAttribute(
    "aria-pressed",
    "true",
  );
  await page.getByRole("checkbox", { name: /Food/ }).uncheck();
  await expect(
    page.getByText("1 selected. Tap a pack to add or remove it."),
  ).toBeVisible();
  // Let the pack selection colour transition finish before measuring contrast.
  await page.waitForTimeout(200);
  const scan = await new AxeBuilder({ page }).analyze();
  expect(scan.violations).toEqual([]);
  await page.getByRole("button", { name: "Your crew", exact: true }).click();
  const identities = await page
    .locator(".identity-avatar svg")
    .evaluateAll((nodes) => nodes.map((n) => n.innerHTML));
  expect(new Set(identities).size).toBe(5);
  await page.getByRole("button", { name: "Settings", exact: true }).click();
  await page
    .getByRole("button", { name: "Social Club original", exact: true })
    .click();
  await page.reload();
  await expect(page.locator("html")).toHaveAttribute(
    "data-edition",
    "original",
  );
  await expect(page.locator(".brand-motion")).toHaveCount(0);
  await page.getByRole("button", { name: "Settings", exact: true }).click();
  await page.getByRole("button", { name: "Social Club", exact: true }).click();
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.getByRole("button", { name: "hudl n game home" }).click();
  await expect(
    page.getByRole("button", { name: "Replay the card animation" }),
  ).toHaveCount(0);
  await expect(page.locator(".motion-stage>div svg")).toHaveCount(0);
  await expect(page.getByText("© 2026 Sayam")).toBeVisible();
});

test("round variety survives reload without changing the current secret", async ({
  page,
}) => {
  await addCrew(page, "Imposter");
  await page.getByRole("button", { name: "Quick start" }).click();
  const saved = await page.evaluate(
    () => JSON.parse(localStorage.getItem("hudl-game-v1")!).state,
  );
  expect(saved.variety.imposter).toContain(saved.session.secret);
  expect(saved.variety.starters).toContain(saved.session.startingPlayer);
  await page.reload();
  await expect(page.getByRole("button", { name: "Resume game" })).toBeVisible();
  const restored = await page.evaluate(
    () => JSON.parse(localStorage.getItem("hudl-game-v1")!).state,
  );
  expect(restored.variety).toEqual(saved.variety);
  expect(restored.session.secret).toBe(saved.session.secret);
});
