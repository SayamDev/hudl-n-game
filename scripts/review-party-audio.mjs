import { chromium } from "playwright";
import AxeBuilder from "@axe-core/playwright";
import fs from "node:fs";
const dir = ".impeccable/review/party-audio";
fs.mkdirSync(dir, { recursive: true });
const b = await chromium.launch({ channel: "chrome", headless: true });
const c = await b.newContext({ reducedMotion: "reduce" });
const p = await c.newPage();
await p.addInitScript(() => localStorage.setItem("hudl-welcome-v1", "true"));
await p.goto("http://localhost:4173");
await p
  .locator("article")
  .filter({ has: p.getByRole("heading", { name: "Heads Up!", exact: true }) })
  .getByRole("button", { name: "Let’s play" })
  .click();
for (const name of ["Maya", "Noah", "Zara"]) {
  await p.getByLabel("Player name", { exact: true }).fill(name);
  await p.getByRole("button", { name: "Add player", exact: true }).click();
}
await p.getByRole("button", { name: "Let’s play, all 3 of us" }).click();
await p.getByRole("button", { name: "Quick start" }).click();
await p.getByRole("button", { name: "Start the clock" }).waitFor();
const checks = [];
async function shot(name) {
  await p.screenshot({ path: `${dir}/${name}.png`, fullPage: true });
  checks.push({
    name,
    overflow: await p.evaluate(
      () => document.documentElement.scrollWidth > innerWidth,
    ),
    violations: (await new AxeBuilder({ page: p }).analyze()).violations.map(
      (x) => x.id,
    ),
  });
}
for (const [width, height] of [
  [390, 844],
  [320, 740],
  [820, 1180],
  [1440, 1000],
]) {
  await p.setViewportSize({ width, height });
  await shot(`ready-final-${width}`);
}
await p.setViewportSize({ width: 390, height: 844 });
await p.getByRole("button", { name: "Start the clock" }).click();
await shot("acting-final-390");
await p.keyboard.press("Escape");
await p.getByRole("button", { name: "Leave this game", exact: true }).click();
await p.getByRole("button", { name: "Leave round", exact: true }).click();
await p.getByRole("button", { name: "Settings", exact: true }).click();
await p
  .locator(".voice-studio")
  .screenshot({ path: `${dir}/voice-final-390.png` });
const lines = JSON.parse(fs.readFileSync("src/content/narration.json", "utf8"));
const clips = await p.evaluate(async (ids) => {
  const ctx = new AudioContext();
  const result = [];
  for (const voice of ["storyteller", "host"])
    for (const id of ids) {
      const url = `/audio/narrator/${voice}-${id}.mp3`;
      const response = await fetch(url);
      if (!response.ok) throw Error(url);
      const audio = await ctx.decodeAudioData(await response.arrayBuffer());
      const a = audio.getChannelData(0);
      const rms = Math.sqrt(a.reduce((s, v) => s + v * v, 0) / a.length);
      if (audio.duration < 2 || rms < 0.005) throw Error(`Empty audio: ${url}`);
      result.push({ voice, id, duration: audio.duration, rms });
    }
  await ctx.close();
  return result;
}, Object.keys(lines));
await p.evaluate(() => navigator.serviceWorker.ready);
await p.reload();
await p.waitForFunction(() => navigator.serviceWorker.controller !== null);
await c.setOffline(true);
const offlineVoice = await p.evaluate(async () => {
  const r = await fetch("/audio/narrator/host-preview.mp3");
  return r.ok && (await r.arrayBuffer()).byteLength > 1000;
});
if (!offlineVoice) throw Error("Voice recording not available offline");
fs.writeFileSync(
  `${dir}/checks.json`,
  JSON.stringify({ checks, clips, offlineVoice }, null, 2),
);
console.log(JSON.stringify({ checks, decodedClips: clips.length }));
await b.close();
