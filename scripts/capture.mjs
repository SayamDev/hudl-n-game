import { chromium } from "playwright";
import fs from "node:fs";
const browser = await chromium.launch({ channel: "chrome", headless: true });
const page = await browser.newPage({
  viewport: { width: 512, height: 512 },
  deviceScaleFactor: 1,
});
const svg = fs.readFileSync("public/icon.svg", "utf8");
for (const size of [192, 512]) {
  await page.setViewportSize({ width: size, height: size });
  await page.setContent(
    `<style>*{margin:0}svg{width:100vw;height:100vh;display:block}</style>${svg}`,
  );
  await page.screenshot({ path: `public/icon-${size}.png` });
}
await page.setViewportSize({ width: 1200, height: 630 });
await page.setContent(
  `<style>*{box-sizing:border-box}body{margin:0;background:#7c3aed;color:#fffdf9;font-family:Arial,sans-serif;padding:80px;display:flex;align-items:center;gap:80px;height:630px}h1{font-size:82px;letter-spacing:-3px;margin:0 0 26px;font-weight:900}p{font-size:30px;line-height:1.4;margin:0;max-width:580px}.pill{font-size:20px;margin-top:36px;font-weight:bold;color:#1b1033;background:#ffd60a;border:3px solid #1b1033;border-radius:16px;display:inline-block;padding:18px 24px}svg{width:290px;flex-shrink:0;transform:rotate(8deg)}</style><div><h1>Hudl N Game</h1><p>Huddle up. Pass the phone.<br>Cause chaos.</p><div class="pill">5 party games. One phone. Zero sign-ups.</div></div>${svg}`,
);
await page.screenshot({ path: "public/social.png" });
fs.mkdirSync(".impeccable/review", { recursive: true });
const errors = [];
page.on("pageerror", (e) => errors.push(e.message));
for (const [name, width, height, dark] of [
  ["desktop", 1440, 1000, false],
  ["mobile", 390, 844, false],
  ["mobile-dark", 390, 844, true],
]) {
  await page.setViewportSize({ width, height });
  await page.goto("http://127.0.0.1:5173");
  await page.evaluate((dark) => {
    const raw = localStorage.getItem("hudl-game-v1");
    if (raw) {
      const data = JSON.parse(raw);
      data.state.preferences.dark = dark;
      localStorage.setItem("hudl-game-v1", JSON.stringify(data));
    }
  }, dark);
  await page.reload();
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(700);
  await page.screenshot({
    path: `.impeccable/review/${name}.png`,
    fullPage: true,
  });
  console.log(
    name,
    await page.evaluate(() => ({
      scrollWidth: document.documentElement.scrollWidth,
      width: innerWidth,
    })),
  );
}
console.log("browser errors", errors);
await page.setViewportSize({ width: 1200, height: 850 });
for (const frame of [0, 16, 37, 74]) {
  await page.goto(`http://127.0.0.1:3030/hudl/scene-1?frame=${frame}`);
  await page.locator("#main-canvas").waitFor();
  await page.waitForTimeout(1500);
  await page.screenshot({ path: `.impeccable/review/lottie-${frame}.png` });
}
console.log(
  "Skottie context",
  await (await page.request.get("http://127.0.0.1:3030/__context")).text(),
);
await browser.close();
