import { test, expect } from "@playwright/test";
test("Charades cards stay readable after release, scroll without hiding and a chosen two-round game finishes", async ({
  page,
}) => {
  page.on("pageerror", (e) => console.log("BROWSER_ERROR", e.stack));
  page.on("console", (m) => {
    if (m.type() === "error") console.log("BROWSER_CONSOLE", m.text());
  });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.addInitScript(() =>
    localStorage.setItem("hudl-welcome-v1", "true"),
  );
  await page.goto("/");
  await page
    .locator("article")
    .filter({
      has: page.getByRole("heading", { name: "Charades", exact: true }),
    })
    .getByRole("button", { name: "Play Charades", exact: true })
    .click();
  for (const name of ["Maya", "Noah", "Zara", "Leo"]) {
    await page.getByLabel("Player name", { exact: true }).fill(name);
    await page.getByRole("button", { name: "Add player", exact: true }).click();
  }
  await page.getByRole("button", { name: "Let’s play, all 4 of us" }).click();
  await page.getByLabel("Rounds per team").selectOption("2");
  await page.getByLabel("Turn timer").selectOption("0");
  await page.getByRole("button", { name: "Quick start" }).click();
  for (let turn = 0; turn < 4; turn++) {
    await page.getByRole("button", { name: "Draw your prompt" }).click();
    const reveal = page.getByRole("button", {
      name: "Reveal card",
      exact: true,
    });
    await expect(reveal).toBeEnabled();
    await reveal.click();
    await expect(page.locator(".secret-word")).toBeVisible();
    await page.waitForTimeout(500);
    await expect(page.locator(".secret-word")).toBeVisible();
    await page.evaluate(() =>
      window.dispatchEvent(
        new PointerEvent("pointercancel", { bubbles: true }),
      ),
    );
    await expect(page.locator(".secret-word")).toBeVisible();
    await page.getByRole("button", { name: "Hide & start acting" }).click();
    await expect(page.locator(".secret-word")).toHaveCount(0);
    const finish = await page
      .getByRole("button", { name: "Finish this turn", exact: true })
      .boundingBox();
    expect(finish!.y + finish!.height).toBeLessThanOrEqual(844);
    const colors = await page
      .locator(".charades-acting p")
      .evaluate((el) => ({ color: getComputedStyle(el).color }));
    expect(colors.color).toBe("rgb(245, 236, 204)");
    await page.getByRole("button", { name: "Correct", exact: true }).click();
    if (turn === 3)
      await page.getByRole("button", { name: "See the winners" }).click();
    else await page.locator(".stage > .button.primary").click();
  }
  await expect(
    page.getByRole("heading", { name: "A glorious draw!" }),
  ).toBeVisible();
  const saved = await page.evaluate(() =>
    JSON.parse(localStorage.getItem("hudl-game-v1")!),
  );
  for (const game of ["mafia", "spy"]) {
    saved.state.session.game = game;
    saved.state.session.awarded = false;
    saved.state.session.team = 0;
    saved.state.session.roles = Object.fromEntries(
      saved.state.players.map((p: any) => [p.id, "Villager"]),
    );
    saved.state.session.phase = "peek";
    saved.state.session.peekIndex = 0;
    saved.state.session.paused = false;
    if (game === "spy")
      saved.state.session.roles[saved.state.players[3].id] = "Spy";
    saved.state.session.secret =
      "An exceptionally long location name that must remain readable while scrolling";
    saved.state.session.roles[saved.state.players[0].id] =
      game === "mafia" ? "Mafia" : "Crew";
    await page.addInitScript(
      (data) => localStorage.setItem("hudl-game-v1", JSON.stringify(data)),
      saved,
    );
    await page.reload();
    const resume = page.getByRole("button", { name: "Resume game" });
    if (await resume.isVisible()) await resume.click();
    const reveal = page.getByRole("button", {
      name: "Reveal card",
      exact: true,
    });
    await expect(reveal).toBeEnabled();
    await reveal.click();
    await expect(page.locator(".secret-word")).toBeVisible();
    await page.evaluate(() =>
      window.dispatchEvent(
        new PointerEvent("pointercancel", { bubbles: true }),
      ),
    );
    await expect(page.locator(".secret-word")).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(page.locator(".secret-word")).toHaveCount(0);
  }
});
