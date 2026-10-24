import { test, expect, type Page } from "@playwright/test";
import fs from "node:fs";
const people = ["Maya", "Noah", "Zara", "Leo", "Amira", "Eli"];
const shots = ".impeccable/review/party-controls";
fs.mkdirSync(shots, { recursive: true });
async function setup(page: Page, game = "Imposter", count = 3) {
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
  for (const name of people.slice(0, count)) {
    await page.getByLabel("Player name", { exact: true }).fill(name);
    await page.getByRole("button", { name: "Add player", exact: true }).click();
  }
  await page
    .getByRole("button", { name: `Let’s play, all ${count} of us` })
    .click();
}
async function readActor(page: Page) {
  const hold = page.getByRole("button", { name: "Hold to peek" });
  await expect(hold).toBeEnabled();
  await hold.focus();
  await page.keyboard.down("Space");
  await expect(page.locator(".secret-word")).toBeVisible();
  await page.keyboard.up("Space");
  await page.getByRole("button", { name: "Hide & start acting" }).click();
}
test("chosen pairs persist, take three Charades turns and receive the correct win", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await setup(page, "Charades", 6);
  await page.getByRole("button", { name: "Choose teams", exact: true }).click();
  await page.getByLabel("Name of group 1", { exact: true }).fill("Night Owls");
  await page
    .getByLabel("Name of group 2", { exact: true })
    .fill("Velvet Foxes");
  await page.getByRole("button", { name: "Add group", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Quick start" }),
  ).toBeDisabled();
  await page.getByLabel("Name of group 3", { exact: true }).fill("Plot Twist");
  for (let i = 0; i < 6; i++)
    await page
      .getByLabel(`Group for ${people[i]}`, { exact: true })
      .selectOption({
        label: ["Night Owls", "Velvet Foxes", "Plot Twist"][Math.floor(i / 2)],
      });
  await page.screenshot({
    path: `${shots}/chosen-teams-phone.png`,
    fullPage: true,
  });
  await page.getByRole("button", { name: "Quick start" }).click();
  await expect(
    page.getByRole("heading", { name: "Night Owls, you’re up!" }),
  ).toBeVisible();
  await expect(page.locator(".team-list strong")).toHaveText(["Maya", "Noah"]);
  await page.getByRole("button", { name: "Draw your prompt" }).click();
  await readActor(page);
  await page.getByRole("button", { name: "Correct", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Pass to Noah" }),
  ).toBeVisible();
  await readActor(page);
  await page.getByRole("button", { name: "Finish turn early" }).click();
  await page.getByRole("button", { name: "Pass to Velvet Foxes" }).click();
  await expect(page.locator(".team-list strong")).toHaveText(["Zara", "Leo"]);
  await page.getByRole("button", { name: "Draw your prompt" }).click();
  await readActor(page);
  await page.getByRole("button", { name: "Finish turn early" }).click();
  await page.getByRole("button", { name: "Pass to Plot Twist" }).click();
  await expect(page.locator(".team-list strong")).toHaveText(["Amira", "Eli"]);
  await page.getByRole("button", { name: "Draw your prompt" }).click();
  await readActor(page);
  await page.getByRole("button", { name: "Finish turn early" }).click();
  await page.getByRole("button", { name: "See the winners" }).click();
  await expect(
    page.getByRole("heading", { name: "Night Owls wins!" }),
  ).toBeVisible();
  await expect(page.getByRole("list", { name: "Team scores" })).toContainText(
    "Night Owls",
  );
  const saved = await page.evaluate(() =>
    JSON.parse(localStorage.getItem("hudl-game-v1")!),
  );
  expect(
    saved.state.session.teams.map(
      (t: { playerIds: string[] }) => t.playerIds.length,
    ),
  ).toEqual([2, 2, 2]);
  expect(saved.state.players.map((p: { score: number }) => p.score)).toEqual([
    2, 2, 0, 0, 0, 0,
  ]);
  await page.reload();
  const resume = page.getByRole("button", { name: "Resume game" });
  if (await resume.isVisible()) await resume.click();
  await expect(
    page.getByRole("heading", { name: "Night Owls wins!" }),
  ).toBeVisible();
  expect(
    (
      await page.evaluate(() =>
        JSON.parse(localStorage.getItem("hudl-game-v1")!),
      )
    ).state.players[0].score,
  ).toBe(2);
});
test("swipe anticipation follows the cover and cancels without leaking or marking an unread card", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await setup(page);
  await page.getByRole("button", { name: "Quick start" }).click();
  const card = page.getByRole("button", { name: "Read private card" });
  await expect(card).toBeEnabled();
  const b = await card.boundingBox(),
    x = b!.x + b!.width / 2,
    y = b!.y + b!.height * 0.75;
  await page.mouse.move(x, y);
  await page.mouse.down();
  await page.mouse.move(x, y - 35, { steps: 5 });
  await expect(page.locator(".private-secret")).toHaveCount(0);
  expect(
    await page
      .locator(".private-reveal-cover")
      .evaluate((el) => getComputedStyle(el).transform),
  ).not.toBe("none");
  await page.mouse.move(x, y - 90, { steps: 4 });
  await page.waitForTimeout(70);
  await expect(page.locator(".private-secret")).toHaveCount(0);
  await page.screenshot({ path: `${shots}/lift-anticipation.png` });
  await page.mouse.up();
  await page.waitForTimeout(300);
  await expect(page.locator(".private-secret")).toHaveCount(0);
  await expect(
    page.getByRole("button", { name: "Pass to Noah", exact: true }),
  ).toBeDisabled();
  await page.mouse.move(x, y);
  await page.mouse.down();
  await page.mouse.move(x, y - 90, { steps: 5 });
  await expect(page.locator(".private-secret")).toBeVisible();
  await page.mouse.move(x, y - 10, { steps: 5 });
  await expect(page.locator(".private-secret")).toHaveCount(0);
  await page.mouse.up();
  await card.focus();
  await page.keyboard.down("Space");
  await expect(page.locator(".private-secret")).toHaveClass(/is-instant/);
  await expect(page.locator(".private-secret .card-copy")).toHaveCSS(
    "animation-name",
    "none",
  );
  await page.keyboard.up("Space");
  await expect(page.locator(".private-secret")).toHaveCount(0);
  await page.mouse.move(x, y);
  await page.mouse.down();
  await page.mouse.move(x, y - 90, { steps: 4 });
  await page.keyboard.press("Escape");
  await page.mouse.up();
  await page.getByRole("button", { name: "Resume game" }).click();
  await page.waitForTimeout(300);
  await expect(page.locator(".private-secret")).toHaveCount(0);
});
test("orientation turns only the word, correct and skip have separate single sounds", async ({
  page,
}) => {
  await page.addInitScript(() => {
    (window as any).partyTones = [];
    class AudioMock {
      state = "running";
      currentTime = 0;
      destination = {};
      resume() {
        return Promise.resolve();
      }
      createOscillator() {
        return {
          type: "sine",
          connect() {},
          disconnect() {},
          start() {},
          stop() {},
          frequency: {
            setValueAtTime(v: number) {
              (window as any).partyTones.push(v);
            },
            exponentialRampToValueAtTime(v: number) {
              (window as any).partyTones.push(v);
            },
          },
        };
      }
      createGain() {
        return {
          connect() {},
          disconnect() {},
          gain: { setValueAtTime() {}, exponentialRampToValueAtTime() {} },
        };
      }
    }
    (window as any).AudioContext = AudioMock;
  });
  await page.setViewportSize({ width: 390, height: 844 });
  await setup(page, "Heads Up!", 4);
  await page.getByRole("button", { name: "Quick start" }).click();
  await page.getByRole("button", { name: "Enable tilt controls" }).click();
  await page.evaluate(() =>
    window.dispatchEvent(
      new DeviceOrientationEvent("deviceorientation", { beta: 90, gamma: 0 }),
    ),
  );
  await page.getByRole("button", { name: "Start the clock" }).click();
  await page.evaluate(() =>
    window.dispatchEvent(
      new DeviceOrientationEvent("deviceorientation", { beta: 0, gamma: 90 }),
    ),
  );
  await expect(page.locator(".charades-word h2")).toHaveAttribute(
    "style",
    /rotate\(-90deg\)/,
  );
  const fits = await page.locator(".charades-word h2").evaluate((el) => {
    const a = el.getBoundingClientRect(),
      b = el.parentElement!.getBoundingClientRect();
    return (
      a.left >= b.left - 1 &&
      a.right <= b.right + 1 &&
      a.top >= b.top - 1 &&
      a.bottom <= b.bottom + 1
    );
  });
  expect(fits).toBe(true);
  await page.screenshot({ path: `${shots}/word-turned-phone.png` });
  await page.evaluate(() => {
    Object.defineProperty(screen.orientation, "angle", {
      value: 90,
      configurable: true,
    });
    screen.orientation.dispatchEvent(new Event("change"));
    window.dispatchEvent(
      new DeviceOrientationEvent("deviceorientation", { beta: 0, gamma: 90 }),
    );
  });
  await expect(page.locator(".charades-word .word-turned")).toHaveCount(0);
  await page.evaluate(() => ((window as any).partyTones = []));
  await page.getByRole("button", { name: "Correct", exact: true }).click();
  expect(await page.evaluate(() => (window as any).partyTones)).toEqual([
    523, 1046,
  ]);
  await page.evaluate(() => ((window as any).partyTones = []));
  await page.getByRole("button", { name: "Skip", exact: true }).click();
  expect(await page.evaluate(() => (window as any).partyTones)).toEqual([
    660, 330,
  ]);
  await expect(
    page.getByText("1 correct · 1 skipped", { exact: true }),
  ).toBeVisible();
});
