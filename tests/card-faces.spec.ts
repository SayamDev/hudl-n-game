import { test, expect } from "@playwright/test";
import fs from "node:fs";
const shots = ".impeccable/review/approved-cards";
fs.mkdirSync(shots, { recursive: true });
test("approved faces keep words away from ornament across all six games", async ({
  page,
}) => {
  test.setTimeout(150000);
  await page.addInitScript(() =>
    localStorage.setItem("hudl-welcome-v1", "true"),
  );
  await page.goto("/");
  await page
    .locator("article")
    .filter({
      has: page.getByRole("heading", { name: "Imposter", exact: true }),
    })
    .getByRole("button", { name: "Let’s play" })
    .click();
  for (const name of ["Maya", "Noah", "Zara", "Leo", "Amira"]) {
    await page.getByLabel("Player name", { exact: true }).fill(name);
    await page.getByRole("button", { name: "Add player", exact: true }).click();
  }
  await page.getByRole("button", { name: "Let’s play, all 5 of us" }).click();
  await page.getByRole("button", { name: "Quick start" }).click();
  const saved = await page.evaluate(() =>
    JSON.parse(localStorage.getItem("hudl-game-v1")!),
  );
  for (const [game, mode, phase, world] of [
    ["imposter", "heads-up", "peek", "imposter"],
    ["mafia", "heads-up", "peek", "mafia"],
    ["spy", "heads-up", "peek", "spy"],
    ["charades", "classic", "actor-peek", "charades"],
    ["charades", "heads-up", "acting", "heads-up"],
    ["party", "heads-up", "prompt", "party"],
  ]) {
    const fixture = structuredClone(saved),
      session = fixture.state.session;
    Object.assign(session, {
      game,
      phase,
      peekIndex: 0,
      paused: false,
      secret: "International airport",
      category: "Places",
      timerRunning: false,
      deck: ["Walking on the moon"],
      cardIndex: 0,
      actorIndex: 0,
    });
    session.options.charadesMode = mode;
    session.options.seconds = 0;
    session.options.chaos = false;
    session.options.hint = true;
    session.roles[fixture.state.players[0].id] =
      game === "imposter" ? "Imposter" : game === "spy" ? "Spy" : "Mafia";
    await page.addInitScript(
      (s) => localStorage.setItem("hudl-game-v1", JSON.stringify(s)),
      fixture,
    );
    await page.reload();
    const resume = page.getByRole("button", { name: "Resume game" });
    if (await resume.isVisible()) await resume.click();
    const privateCard = ["peek", "actor-peek"].includes(phase);
    const hold =
      game === "imposter"
        ? page.getByRole("button", { name: "Read private card" })
        : page.getByRole("button", { name: "Hold to peek" });
    if (privateCard) await expect(hold).toBeEnabled();
    for (const [width, height] of [
      [320, 568],
      [390, 844],
      [820, 1024],
      [1440, 900],
      [844, 390],
    ]) {
      await page.setViewportSize({ width, height });
      await page.evaluate(async () => {
        scrollTo(0, 0);
        await document.fonts.ready;
        await new Promise((r) =>
          requestAnimationFrame(() => requestAnimationFrame(r)),
        );
      });
      if (privateCard) {
        await hold.focus();
        await page.keyboard.down("Space");
      }
      await expect(page.locator(`[data-card-world="${world}"]`)).toBeVisible();
      if (game === "imposter" && width === 390) {
        const size = await page.locator(".private-secret").evaluate((el) => ({
          role: parseFloat(getComputedStyle(el.querySelector("h2")!).fontSize),
          hint: parseFloat(
            getComputedStyle(el.querySelector(".private-hint strong")!)
              .fontSize,
          ),
        }));
        expect(size.role).toBeGreaterThan(size.hint * 2);
      }
      const geometry = await page.locator(".card-copy").evaluate((el) => {
        const copy = el.getBoundingClientRect(),
          card = el.parentElement!.getBoundingClientRect();
        const text = [...el.querySelectorAll("h2, p, strong, span, small")]
          .map((node) => {
            const range = document.createRange();
            range.selectNodeContents(node);
            return [...range.getClientRects()].map((rect) => ({
              left: rect.left,
              right: rect.right,
            }));
          })
          .flat();
        return {
          cardHeight: card.height,
          leftMargin: (copy.left - card.left) / card.width,
          rightMargin: (card.right - copy.right) / card.width,
          fits: text.every(
            (rect) =>
              rect.left >= copy.left - 1 && rect.right <= copy.right + 1,
          ),
        };
      });
      if (height >= 700)
        expect
          .soft(geometry.cardHeight, `${world} artwork height ${width}`)
          .toBeGreaterThan(height * 0.3);
      expect
        .soft(geometry.leftMargin, `${world} left ${width}`)
        .toBeGreaterThanOrEqual(0.22);
      expect
        .soft(geometry.rightMargin, `${world} right ${width}`)
        .toBeGreaterThanOrEqual(0.22);
      expect.soft(geometry.fits, `${world} text ${width}`).toBe(true);
      expect
        .soft(
          await page.evaluate(
            () => document.documentElement.scrollWidth <= innerWidth,
          ),
          `${world} width ${width}`,
        )
        .toBe(true);
      expect
        .soft(
          await page.evaluate(() => document.documentElement.scrollHeight),
          `${world} height ${width}x${height}`,
        )
        .toBeLessThanOrEqual(height + 2);
      if (width === 390 || width === 1440)
        await page.screenshot({
          path: `${shots}/${world}-${width}.png`,
          animations: "disabled",
        });
      if (privateCard) {
        await page.keyboard.up("Space");
        await expect(page.locator(".card-copy")).toHaveCount(0);
      }
    }
  }
});
