import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import fs from "node:fs";
const shots = ".impeccable/review/party-audio";
fs.mkdirSync(shots, { recursive: true });
test.beforeEach(async ({ page }) => {
  await page.addInitScript(() =>
    localStorage.setItem("hudl-welcome-v1", "true"),
  );
});
async function crew(page: any, game = "Imposter") {
  await page.goto("/");
  await page
    .locator("article")
    .filter({ has: page.getByRole("heading", { name: game, exact: true }) })
    .getByRole("button", { name: "Let’s play" })
    .click();
  for (const name of ["Maya", "Noah", "Zara"]) {
    await page.getByLabel("Player name", { exact: true }).fill(name);
    await page.getByRole("button", { name: "Add player", exact: true }).click();
  }
  await page.getByRole("button", { name: "Let’s play, all 3 of us" }).click();
}
test("release cue is above the finger and controls stay stable at phone sizes", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await crew(page);
  await expect(page.getByText("40 words", { exact: true })).toHaveCount(0);
  await expect(page.getByText("Celebrities", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Quick start" }).click();
  const hold = page.getByRole("button", { name: "Hold to peek", exact: true });
  await expect(hold).toBeEnabled({ timeout: 6000 });
  await hold.scrollIntoViewIfNeeded();
  await hold.focus();
  const before = await hold.boundingBox();
  await page.keyboard.down("Space");
  const cue = page.getByText("Lift your finger to hide your secret", {
    exact: true,
  });
  await expect(cue).toBeVisible();
  const box = await cue.boundingBox(),
    after = await hold.boundingBox();
  expect(box!.y + box!.height).toBeLessThan(after!.y);
  expect(Math.abs(after!.y - before!.y)).toBeLessThan(1);
  await page.screenshot({ path: `${shots}/peek-held-390.png`, fullPage: true });
  await page.keyboard.up("Space");
  await expect(page.locator(".secret-word,.imposter-role")).toHaveCount(0);
  for (const width of [320, 820]) {
    await page.setViewportSize({ width, height: width === 820 ? 1180 : 740 });
    await page.screenshot({
      path: `${shots}/peek-${width}.png`,
      fullPage: true,
    });
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth > innerWidth,
      ),
    ).toBe(false);
  }
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
});
test("natural voice assets play, stop, switch and decode with speech energy", async ({
  page,
}) => {
  await page.addInitScript(() => {
    const OriginalAudio = window.Audio;
    window.Audio = class extends OriginalAudio {
      constructor(src?: string) {
        super(src);
        (window as any).lastNarration = this;
      }
    };
  });
  await page.goto("/");
  await page.getByRole("button", { name: "Settings", exact: true }).click();
  await page.getByRole("button", { name: "Test narrator" }).click();
  await expect
    .poll(() =>
      page.evaluate(() => (window as any).lastNarration?.currentTime || 0),
    )
    .toBeGreaterThan(0.1);
  expect(
    await page.evaluate(() => (window as any).lastNarration.src),
  ).toContain("storyteller-night.mp3");
  await page.getByRole("button", { name: "Stop preview" }).click();
  expect(await page.evaluate(() => (window as any).lastNarration.paused)).toBe(
    true,
  );
  await page
    .getByRole("combobox", { name: "Narrator voice", exact: true })
    .selectOption("studio:host");
  await page.getByLabel("Preview scene").selectOption("dawn");
  await page.getByRole("button", { name: "Test narrator" }).click();
  await expect
    .poll(() =>
      page.evaluate(() => (window as any).lastNarration?.currentTime || 0),
    )
    .toBeGreaterThan(0.1);
  expect(
    await page.evaluate(() => (window as any).lastNarration.src),
  ).toContain("host-dawn.mp3");
  await page.evaluate(() => window.dispatchEvent(new Event("blur")));
  expect(await page.evaluate(() => (window as any).lastNarration.paused)).toBe(
    true,
  );
  const energy = await page.evaluate(async () => {
    const c = new AudioContext();
    const b = await c.decodeAudioData(
      await (await fetch("/audio/narrator/host-dawn.mp3")).arrayBuffer(),
    );
    const a = b.getChannelData(0);
    const rms = Math.sqrt(a.reduce((s, v) => s + v * v, 0) / a.length);
    await c.close();
    return { duration: b.duration, rms };
  });
  expect(energy.duration).toBeGreaterThan(3);
  expect(energy.rms).toBeGreaterThan(0.005);
  await page
    .getByRole("heading", { name: "Voice studio" })
    .scrollIntoViewIfNeeded();
  await page.screenshot({ path: `${shots}/voice-studio.png`, fullPage: true });
});
test("offline batches grow without duplicates and celebrity mix is available", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Packs", exact: true }).click();
  await page.getByRole("button", { name: "Famous faces", exact: true }).click();
  await page.getByRole("button", { name: "Mix my pack", exact: true }).click();
  const first = await page.locator(".draft-words li").allTextContents();
  await page
    .getByRole("button", { name: "Add another batch", exact: true })
    .click();
  const next = await page.locator(".draft-words li").allTextContents();
  expect(next.length).toBeGreaterThan(first.length);
  expect(new Set(next.map((w) => w.toLowerCase())).size).toBe(next.length);
  await page.screenshot({ path: `${shots}/growing-pack.png`, fullPage: true });
});

test("countdown stages schedule increasingly urgent notes and pause stops audio", async ({
  page,
}) => {
  await page.addInitScript(() => {
    (window as any).notes = [];
    const Original = window.AudioContext;
    window.AudioContext = class extends Original {
      createOscillator() {
        const o = super.createOscillator();
        const start = o.start.bind(o);
        o.start = (when?: number) => {
          (window as any).notes.push({ frequency: o.frequency.value, when });
          start(when);
        };
        return o;
      }
    };
  });
  await crew(page);
  await page.getByRole("button", { name: "Quick start" }).click();
  const saved = await page.evaluate(() =>
    JSON.parse(localStorage.getItem("hudl-game-v1")!),
  );
  saved.state.session.phase = "discuss";
  saved.state.session.timerRemaining = 61;
  saved.state.session.timerRunning = false;
  saved.state.session.paused = true;
  saved.state.preferences.sound = true;
  saved.state.preferences.countdown = true;
  await page.addInitScript(
    (data) => localStorage.setItem("hudl-game-v1", JSON.stringify(data)),
    saved,
  );
  await page.reload();
  await page.bringToFront();
  await page.getByRole("button", { name: "Resume game" }).click();
  await page.clock.install();
  await page.getByRole("button", { name: "Start timer", exact: true }).click();
  await page.clock.runFor(1100);
  expect(
    await page.evaluate(() =>
      (window as any).notes.some((n: any) => n.frequency === 330),
    ),
  ).toBe(true);
  await page.clock.runFor(30000);
  expect(
    await page.evaluate(() =>
      (window as any).notes.some((n: any) => n.frequency === 440),
    ),
  ).toBe(true);
  await page.clock.runFor(20000);
  expect(
    await page.evaluate(() =>
      (window as any).notes.some((n: any) => n.frequency === 880),
    ),
  ).toBe(true);
  await page.getByRole("button", { name: "Pause timer", exact: true }).click();
  const count = await page.evaluate(() => (window as any).notes.length);
  await page.clock.runFor(4000);
  expect(await page.evaluate(() => (window as any).notes.length)).toBe(count);
  saved.state.preferences.volume = 0;
  await page.addInitScript(
    (data) => localStorage.setItem("hudl-game-v1", JSON.stringify(data)),
    saved,
  );
  await page.reload();
  await page.getByRole("button", { name: "Resume game" }).click();
  await page.getByRole("button", { name: "Start timer", exact: true }).click();
  await page.clock.runFor(5100);
  expect(
    await page.evaluate(() =>
      (window as any).notes.filter(
        (n: any) =>
          n.when !== undefined &&
          [220, 330, 440, 660, 770, 880].includes(n.frequency),
      ),
    ),
  ).toEqual([]);
});
