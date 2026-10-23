import { chromium } from "playwright";
import AxeBuilder from "@axe-core/playwright";
import fs from "node:fs";
const dir = ".impeccable/review/faster-party";
fs.mkdirSync(dir, { recursive: true });
const b = await chromium.launch({ channel: "chrome", headless: true });
const setupContext = await b.newContext();
const p = await setupContext.newPage();
await p.addInitScript(() => localStorage.setItem("hudl-welcome-v1", "true"));
await p.goto("http://localhost:4173");
await p
  .locator("article")
  .filter({ has: p.getByRole("heading", { name: "Imposter", exact: true }) })
  .getByRole("button", { name: "Let’s play" })
  .click();
for (const name of ["Maya", "Noah", "Zara", "Leo"]) {
  await p.getByLabel("Player name", { exact: true }).fill(name);
  await p.getByRole("button", { name: "Add player", exact: true }).click();
}
await p.getByRole("button", { name: "Let’s play, all 4 of us" }).click();
await p.getByRole("button", { name: "Quick start" }).click();
const saved = await p.evaluate(() =>
  JSON.parse(localStorage.getItem("hudl-game-v1")),
);
await setupContext.close();
const checks = [];
async function capture(
  name,
  width,
  height,
  phase,
  dark = false,
  reduce = true,
) {
  const seed = structuredClone(saved);
  seed.state.preferences.dark = dark;
  seed.state.options.seconds = 0;
  seed.state.options.voteMode = "point";
  seed.state.session.options.seconds = 0;
  seed.state.session.timerRemaining = 0;
  seed.state.session.timerRunning = false;
  seed.state.session.paused = false;
  seed.state.session.phase = phase;
  seed.state.session.secret = "Pizza";
  seed.state.session.category = "Food";
  seed.state.session.roles[seed.state.players[0].id] = "Imposter";
  seed.state.session.accused = seed.state.players[0].id;
  if (["setup", "home"].includes(phase)) seed.state.session = null;
  if (phase === "acting") {
    seed.state.session.game = "charades";
    seed.state.session.options.charadesMode = "classic";
  }
  const c = await b.newContext({
    viewport: { width, height },
    reducedMotion: reduce ? "reduce" : "no-preference",
  });
  await c.addInitScript((data) => {
    localStorage.setItem("hudl-game-v1", JSON.stringify(data));
    localStorage.setItem("hudl-welcome-v1", "true");
  }, seed);
  const page = await c.newPage();
  await page.goto("http://localhost:4173");
  if (phase === "setup")
    await page
      .locator("article")
      .filter({
        has: page.getByRole("heading", { name: "Imposter", exact: true }),
      })
      .getByRole("button", { name: "Let’s play" })
      .click();
  if (phase === "home") {
    const card = page.locator("article.club-charades");
    await card.scrollIntoViewIfNeeded();
    await page.waitForTimeout(600);
  } else {
    await page.locator(".stage h1").waitFor();
    await page.waitForFunction(
      () => getComputedStyle(document.querySelector(".stage")).opacity === "1",
    );
  }
  if (phase === "peek") {
    const hold = page.getByRole("button", { name: "Hold to peek" });
    await hold.waitFor({ state: "visible" });
    await page.waitForFunction(
      () => !document.querySelector(".hold-button").disabled,
    );
    await hold.focus();
    await page.keyboard.down("Space");
  }
  if (name.startsWith("open")) {
    await page.getByRole("button", { name: "Reveal identity" }).click();
    await page.waitForTimeout(300);
  }
  await page.screenshot({ path: `${dir}/${name}.png`, fullPage: true });
  const violations = (await new AxeBuilder({ page }).analyze()).violations.map(
    (x) => ({ id: x.id, targets: x.nodes.map((n) => n.target) }),
  );
  checks.push({
    name,
    overflow: await page.evaluate(
      () => document.documentElement.scrollWidth > innerWidth,
    ),
    violations,
  });
  if (phase === "peek") await page.keyboard.up("Space");
  await c.close();
}
for (const args of [
  ["setup-320", 320, 740, "setup"],
  ["setup-820-dark", 820, 1180, "setup", true],
  ["sealed-390", 390, 844, "reveal"],
  ["open-390", 390, 844, "reveal", false, true],
  ["classic-390", 390, 844, "acting"],
  ["classic-820-dark", 820, 1180, "acting", true],
  ["hint-320-dark", 320, 740, "peek", true],
  ["scroll-art-390", 390, 844, "home", false, false],
  ["scroll-art-1440", 1440, 1000, "home", false, false],
])
  await capture(...args);
fs.writeFileSync(`${dir}/checks.json`, JSON.stringify(checks, null, 2));
console.log(JSON.stringify(checks));
await b.close();
