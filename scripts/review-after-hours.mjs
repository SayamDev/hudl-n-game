import { chromium } from "playwright";
import AxeBuilder from "@axe-core/playwright";
import fs from "node:fs";
const dir = ".impeccable/review/after-hours";
fs.mkdirSync(dir, { recursive: true });
const browser = await chromium.launch({ channel: "chrome", headless: true });
const c = await browser.newContext(),
  p = await c.newPage();
await p.addInitScript(() => localStorage.setItem("hudl-welcome-v1", "true"));
await p.goto("http://localhost:4173");
await p
  .locator("article")
  .filter({ has: p.getByRole("heading", { name: "Imposter", exact: true }) })
  .getByRole("button", { name: "Let’s play" })
  .click();
for (const name of ["Maya", "Noah", "Zara", "Alexandria Longname", "Leo"]) {
  await p.getByLabel("Player name", { exact: true }).fill(name);
  await p.getByRole("button", { name: "Add player", exact: true }).click();
}
await p.getByRole("button", { name: "Let’s play, all 5 of us" }).click();
await p.getByRole("button", { name: "Quick start" }).click();
const saved = await p.evaluate(() =>
  JSON.parse(localStorage.getItem("hudl-game-v1")),
);
await c.close();
const results = [];
for (const [name, width, height, phase, dark, reduce] of [
  ["home-390", 390, 844, "home", true, false],
  ["home-1440", 1440, 1000, "home", false, false],
  ["crew-390", 390, 844, "crew", true, true],
  ["crew-empty-390", 390, 844, "crew-empty", true, true],
  ["setup-820", 820, 1180, "setup", true, true],
  ["sealed-320", 320, 740, "peek", true, false],
  ["held-390", 390, 844, "held", true, false],
  ["crew-held-390", 390, 844, "crew-held", true, false],
  ["verdict-390", 390, 844, "reveal", true, false],
  ["open-390", 390, 844, "open", true, false],
  ["results-820", 820, 1180, "results", true, false],
  ["acting-390", 390, 844, "acting", true, true],
]) {
  if (
    process.env.REVIEW_ONLY &&
    !process.env.REVIEW_ONLY.split(",").includes(name)
  )
    continue;
  const s = structuredClone(saved);
  s.state.preferences.dark = dark;
  if (["home", "crew", "crew-empty", "setup"].includes(phase))
    s.state.session = null;
  else {
    const g = s.state.session;
    g.phase = ["held", "crew-held"].includes(phase)
      ? "peek"
      : phase === "open"
        ? "reveal"
        : phase;
    g.paused = false;
    g.secret = "Pizza";
    g.category = "Food";
    g.accused = s.state.players[0].id;
    g.roles[g.accused] = phase === "crew-held" ? "Crew" : "Imposter";
    g.timerRunning = false;
    g.options.seconds = 0;
    g.winners = s.state.players.slice(0, 2).map((x) => x.id);
    g.result = "The crew wins!";
    g.awarded = true;
    if (phase === "acting") {
      g.game = "charades";
      g.options.charadesMode = "classic";
    }
  }
  if (phase === "crew-empty") s.state.players = [];
  if (phase === "results")
    s.state.players.forEach(
      (p) =>
        (p.score = s.state.session.winners.includes(p.id)
          ? s.state.session.options.points
          : 0),
    );
  const ctx = await browser.newContext({
      viewport: { width, height },
      reducedMotion: reduce ? "reduce" : "no-preference",
    }),
    page = await ctx.newPage();
  await ctx.addInitScript((data) => {
    localStorage.setItem("hudl-game-v1", JSON.stringify(data));
    localStorage.setItem("hudl-welcome-v1", "true");
  }, s);
  await page.goto("http://localhost:4173", { waitUntil: "networkidle" });
  const resume = page.getByRole("button", { name: "Resume game" });
  if (await resume.isVisible()) await resume.click();
  if (["crew", "crew-empty"].includes(phase))
    await page.getByRole("button", { name: "Crew", exact: true }).click();
  if (phase === "setup") {
    await page
      .locator("article")
      .filter({
        has: page.getByRole("heading", { name: "Imposter", exact: true }),
      })
      .getByRole("button", { name: "Let’s play" })
      .click();
    await page.getByRole("button", { name: "Let’s play, all 5 of us" }).click();
  }
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(800);
  let hold;
  if (["peek", "held", "crew-held"].includes(phase)) {
    hold = page.getByRole("button", { name: "Hold to peek" });
    await hold.waitFor();
    await page.waitForFunction(
      () => !document.querySelector(".hold-button").disabled,
    );
    if (["held", "crew-held"].includes(phase)) {
      await hold.focus();
      await page.keyboard.down("Space");
      await page.waitForTimeout(250);
    }
  }
  if (phase === "open") {
    await page.getByRole("button", { name: "Reveal identity" }).click();
    await page.waitForTimeout(550);
  }
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
  await page.screenshot({ path: `${dir}/${name}.png`, fullPage: true });
  const violations = (await new AxeBuilder({ page }).analyze()).violations.map(
    (v) => ({
      id: v.id,
      nodes: v.nodes.map((n) => ({
        target: n.target,
        message: n.failureSummary,
      })),
    }),
  );
  results.push({
    name,
    overflow: await page.evaluate(
      () => document.documentElement.scrollWidth > innerWidth,
    ),
    violations,
    hold: hold ? await hold.boundingBox() : undefined,
  });
  if (["held", "crew-held"].includes(phase)) await page.keyboard.up("Space");
  await ctx.close();
}
const checkFile = `${dir}/${process.env.REVIEW_ONLY ? "correction-checks" : "checks"}.json`;
fs.writeFileSync(checkFile, JSON.stringify(results, null, 2));
console.log(JSON.stringify(results));
await browser.close();
