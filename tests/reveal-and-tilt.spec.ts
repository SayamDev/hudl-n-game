import { test, expect, type Page } from "@playwright/test";
import fs from "node:fs";
const shots = ".impeccable/review/reveal-and-tilt";
fs.mkdirSync(shots, { recursive: true });
async function seed(page: Page, game = "Imposter", count = 3) {
  await page.addInitScript(() =>
    localStorage.setItem("hudl-welcome-v1", "true"),
  );
  await page.goto("/");
  await page
    .locator("article")
    .filter({ has: page.getByRole("heading", { name: game, exact: true }) })
    .getByRole("button", {
      name: game === "Charades" ? "Play Charades" : "Let’s play",
      exact: true,
    })
    .click();
  for (const name of ["Sayam", "Abdul", "Alexandria-Rose", "Maya"].slice(
    0,
    count,
  )) {
    await page.getByLabel("Player name", { exact: true }).fill(name);
    await page.getByRole("button", { name: "Add player", exact: true }).click();
  }
  await page
    .getByRole("button", { name: `Let’s play, all ${count} of us` })
    .click();
  await page.getByRole("button", { name: "Quick start" }).click();
  return page.evaluate(() => JSON.parse(localStorage.getItem("hudl-game-v1")!));
}
async function restore(page: Page, data: any) {
  await page.addInitScript(
    (data) => localStorage.setItem("hudl-game-v1", JSON.stringify(data)),
    data,
  );
  await page.reload();
  await page.getByRole("button", { name: "Resume game" }).click();
}
async function pose(page: Page, beta: number, gamma = 0, dwell = 300) {
  await page.bringToFront();
  for (let elapsed = 0; elapsed <= dwell; elapsed += 30) {
    await page.evaluate(
      ({ beta, gamma }) =>
        window.dispatchEvent(
          new DeviceOrientationEvent("deviceorientation", { beta, gamma }),
        ),
      { beta, gamma },
    );
    await page.waitForTimeout(30);
  }
}

test("real touch reaches private artwork, holds the role, and conceals on release and cancellation without overlapping handoff", async ({
  browser,
}) => {
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true,
  });
  const page = await context.newPage();
  await page.goto("http://127.0.0.1:4173/");
  const saved = await seed(page);
  saved.state.session.roles[saved.state.players[0].id] = "Imposter";
  await restore(page, saved);
  const gesture = page.getByRole("button", { name: "Read private card" });
  await expect(gesture).toBeEnabled();
  const hint = await page.locator(".private-swipe p").boundingBox();
  const pass = await page
    .getByRole("button", { name: "Pass to Abdul" })
    .boundingBox();
  expect(hint!.y + hint!.height + 6).toBeLessThan(pass!.y);
  expect(pass!.y + pass!.height).toBeLessThanOrEqual(844);
  const point = { x: hint!.x + hint!.width / 2, y: hint!.y + hint!.height / 2 };
  expect(
    await page.evaluate(
      ({ x, y }) =>
        document.elementFromPoint(x, y)?.classList.contains("private-gesture"),
      point,
    ),
  ).toBe(true);
  const cdp = await context.newCDPSession(page);
  await cdp.send("Input.dispatchTouchEvent", {
    type: "touchStart",
    touchPoints: [point],
  });
  await cdp.send("Input.dispatchTouchEvent", {
    type: "touchMove",
    touchPoints: [{ x: point.x, y: point.y - 80 }],
  });
  await expect(
    page.getByRole("heading", { name: "IMPOSTER", exact: true }),
  ).toBeVisible();
  await cdp.send("Input.dispatchTouchEvent", {
    type: "touchEnd",
    touchPoints: [],
  });
  await expect(page.locator(".private-secret")).toHaveCount(0);
  await cdp.send("Input.dispatchTouchEvent", {
    type: "touchStart",
    touchPoints: [point],
  });
  await cdp.send("Input.dispatchTouchEvent", {
    type: "touchMove",
    touchPoints: [{ x: point.x, y: point.y - 80 }],
  });
  await expect(page.locator(".private-secret")).toBeVisible();
  await cdp.send("Input.dispatchTouchEvent", {
    type: "touchCancel",
    touchPoints: [],
  });
  await expect(page.locator(".private-secret")).toHaveCount(0);
  await page.waitForTimeout(260);
  await page.screenshot({ path: `${shots}/private-phone.png` });
  await context.close();
});
test("public accusation and animated verdict are compact, suspense hides the outcome, swipe and skip both work", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  const saved = await seed(page);
  saved.state.session.phase = "vote";
  saved.state.session.options.voteMode = "point";
  await restore(page, saved);
  const option = page.getByRole("button", { name: "Sayam", exact: true });
  await expect(option).toBeVisible();
  await option.click();
  await page.screenshot({ path: `${shots}/vote-phone.png` });
  await page.getByRole("button", { name: "Reveal the accused" }).click();
  const cover = page.getByRole("button", { name: "Open sealed alibi" });
  const box = await cover.boundingBox();
  await page.mouse.move(box!.x + box!.width / 2, box!.y + box!.height * 0.8);
  await page.mouse.down();
  await page.mouse.move(
    box!.x + box!.width / 2,
    box!.y + box!.height * 0.8 - 65,
    { steps: 6 },
  );
  await page.mouse.up();
  await expect(page.getByText("The room goes quiet…")).toBeVisible();
  await expect(page.locator(".verdict-copy")).toHaveCount(0);
  await expect(page.locator(".reveal-seal > div > svg")).toBeVisible();
  await page.screenshot({ path: `${shots}/verdict-suspense-phone.png` });
  await expect(page.locator(".verdict-copy")).toBeVisible({ timeout: 3000 });
  await page.screenshot({ path: `${shots}/verdict-open-phone.png` });
  const proceed = await page
    .locator(".imposter-verdict > .button")
    .boundingBox();
  expect(proceed!.y + proceed!.height).toBeLessThanOrEqual(844);
  saved.state.session.phase = "reveal";
  saved.state.session.accused = saved.state.players[0].id;
  await restore(page, saved);
  await page
    .getByRole("button", { name: "Reveal identity", exact: true })
    .click();
  await page.getByRole("button", { name: "Reveal now", exact: true }).click();
  await expect(page.locator(".verdict-copy")).toBeVisible();
});
test("mobile tilt defaults on, readable word is fixed, gestures show large distinct public signals and off really disables scoring", async ({
  browser,
}) => {
  const context = await browser.newContext({
    viewport: { width: 844, height: 390 },
    isMobile: true,
    hasTouch: true,
  });
  const page = await context.newPage();
  await page.goto("http://127.0.0.1:4173/");
  await seed(page, "Heads Up!", 4);
  await expect(
    page.getByRole("button", { name: "Turn off tilt", exact: true }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Start the clock", exact: true })
    .click();
  await pose(page, 90);
  await pose(page, 170, 0, 190);
  await expect(page.locator(".answer-correct")).toContainText("CORRECT!");
  const feedback = await page.locator(".answer-correct").boundingBox();
  const card = await page.locator(".charades-word").boundingBox();
  expect(feedback!.width).toBeCloseTo(card!.width, 0);
  expect(feedback!.height).toBeCloseTo(card!.height, 0);
  await page.screenshot({ path: `${shots}/correct-landscape.png` });
  await pose(page, 170);
  await expect(
    page.getByText("1 correct · 0 skipped", { exact: true }),
  ).toBeVisible();
  await pose(page, 90);
  await pose(page, 0, 0, 190);
  await expect(page.locator(".answer-skip")).toContainText("SKIP!");
  await page.screenshot({ path: `${shots}/skip-landscape.png` });
  await page
    .getByRole("button", { name: "Turn off tilt", exact: true })
    .click();
  await expect(
    page.getByRole("button", { name: "Enable tilt controls", exact: true }),
  ).toBeVisible();
  await pose(page, 90);
  await pose(page, 170, 0, 190);
  await expect(
    page.getByText("1 correct · 1 skipped", { exact: true }),
  ).toBeVisible();
  await expect(page.locator(".charades-word h2")).toHaveCSS(
    "transform",
    "none",
  );
  const rects = await page
    .locator(".acting-status > *:visible")
    .evaluateAll((els) =>
      els.map((el) => {
        const r = el.getBoundingClientRect();
        return { x: r.x, y: r.y, w: r.width, h: r.height };
      }),
    );
  for (let i = 0; i < rects.length; i++)
    for (let j = i + 1; j < rects.length; j++) {
      const a = rects[i],
        b = rects[j];
      expect(
        Math.max(0, Math.min(a.x + a.w, b.x + b.w) - Math.max(a.x, b.x)) *
          Math.max(0, Math.min(a.y + a.h, b.y + b.h) - Math.max(a.y, b.y)),
      ).toBeLessThan(1);
    }
  await expect(page.locator(".answer-signal")).toHaveCount(0);
  await page.screenshot({ path: `${shots}/word-fixed-landscape.png` });
  await context.close();
});
test("classic Charades requests required motion permission on start and never scores on private actor cards", async ({
  browser,
}) => {
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true,
  });
  const page = await context.newPage();
  await page.addInitScript(() => {
    (window as any).motionRequests = 0;
    (DeviceOrientationEvent as any).requestPermission = async () => {
      (window as any).motionRequests++;
      return "granted";
    };
  });
  await page.goto("http://127.0.0.1:4173/");
  await seed(page, "Charades", 4);
  await expect(
    page.getByRole("button", { name: "Turn off tilt", exact: true }),
  ).toBeVisible();
  expect(await page.evaluate(() => (window as any).motionRequests)).toBe(0);
  await page.getByRole("button", { name: "Draw your prompt" }).click();
  expect(await page.evaluate(() => (window as any).motionRequests)).toBe(1);
  await pose(page, 90);
  await pose(page, 170, 0, 190);
  const saved = await page.evaluate(() =>
    JSON.parse(localStorage.getItem("hudl-game-v1")!),
  );
  expect(saved.state.session.phase).toBe("actor-peek");
  expect(saved.state.session.correct).toBe(0);
  const hold = page.getByRole("button", { name: "Hold to peek" });
  await expect(hold).toBeEnabled();
  await hold.focus();
  await page.keyboard.down("Space");
  await expect(page.locator(".secret-word")).toBeVisible();
  await page.keyboard.up("Space");
  await page.getByRole("button", { name: "Hide & start acting" }).click();
  await expect(
    page.getByRole("button", { name: "Turn off tilt", exact: true }),
  ).toBeVisible();
  await context.close();
});
test("private, vote and verdict controls stay reachable at compact phone, tablet, desktop and short landscape sizes", async ({
  page,
}) => {
  const saved = await seed(page);
  saved.state.session.options.voteMode = "point";
  saved.state.session.accused = saved.state.players[0].id;
  for (const [width, height] of [
    [320, 568],
    [412, 915],
    [820, 1024],
    [1440, 900],
    [844, 320],
  ]) {
    await page.setViewportSize({ width, height });
    for (const phase of ["peek", "vote", "reveal"]) {
      saved.state.session.phase = phase;
      await restore(page, saved);
      if (phase === "reveal")
        await page
          .getByRole("button", { name: "Reveal identity", exact: true })
          .focus()
          .then(() => page.keyboard.press("Enter"));
      const control =
        phase === "peek"
          ? page.getByRole("button", { name: "Pass to Abdul" })
          : phase === "vote"
            ? page.getByRole("button", { name: "Reveal the accused" })
            : page.locator(".imposter-verdict > .button");
      const rect = await control.boundingBox();
      expect(
        rect!.y + rect!.height,
        `${phase} ${width}x${height}`,
      ).toBeLessThanOrEqual(height + 1);
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
      ).toBe(true);
      await page.screenshot({ path: `${shots}/fit-${phase}-${width}.png` });
    }
  }
});
