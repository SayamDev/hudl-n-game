import { chromium } from "playwright";
import fs from "node:fs";
const browser = await chromium.launch({ channel: "chrome", headless: true });
const page = await browser.newPage();
for (const [name, width, height] of [
  ["desktop", 1440, 1000],
  ["mobile", 390, 844],
  ["small-phone", 320, 740],
]) {
  await page.setViewportSize({ width, height });
  await page.goto("http://127.0.0.1:4173");
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(800);
  await page.screenshot({
    path: `.impeccable/review/${name}.png`,
    fullPage: true,
  });
}
await page.setViewportSize({ width: 390, height: 844 });
await page.goto("http://127.0.0.1:4173");
await page.getByRole("button", { name: "Switch to dark mode" }).click();
await page.screenshot({
  path: ".impeccable/review/mobile-dark.png",
  fullPage: true,
});
await page.getByRole("button", { name: "Switch to light mode" }).click();
await page
  .locator("article")
  .filter({ has: page.getByRole("heading", { name: "Imposter", exact: true }) })
  .getByRole("button", { name: "Let’s play" })
  .click();
for (const name of ["Maya", "Noah", "Zara", "Leo", "Amira"]) {
  await page.getByLabel("Player name", { exact: true }).fill(name);
  await page.getByRole("button", { name: "Add player", exact: true }).click();
}
await page.waitForTimeout(800);
await page.screenshot({ path: ".impeccable/review/crew.png", fullPage: true });
await page.getByRole("button", { name: "Let’s play, all 5 of us" }).click();
await page.waitForTimeout(800);
await page.screenshot({
  path: ".impeccable/review/settings.png",
  fullPage: true,
});
await page.getByRole("button", { name: "Quick start" }).click();
await page.waitForTimeout(3300);
await page.screenshot({ path: ".impeccable/review/peek.png", fullPage: true });
await page.getByRole("button", { name: "Hold to peek" }).focus();
await page.keyboard.down("Space");
await page.screenshot({
  path: ".impeccable/review/peek-held.png",
  fullPage: true,
});
await page.keyboard.up("Space");
await page.setViewportSize({ width: 1200, height: 850 });
for (const frame of [0, 16, 37, 74]) {
  await page.goto(`http://127.0.0.1:3030/hudl/scene-1?frame=${frame}`);
  await page.locator("#main-canvas").waitFor();
  await page.waitForTimeout(1400);
  await page.screenshot({ path: `.impeccable/review/lottie-${frame}.png` });
}
fs.writeFileSync(
  "docs/verification/skottie-context.json",
  await (await page.request.get("http://127.0.0.1:3030/__context")).text(),
);
await browser.close();
