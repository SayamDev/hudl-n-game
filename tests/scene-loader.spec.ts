import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
test("actual screen loading deals branded cards, then yields to content; reduced motion is static", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.addInitScript(() =>
    localStorage.setItem("hudl-welcome-v1", "true"),
  );
  let release = () => {};
  const gate = new Promise<void>((r) => (release = r));
  await page.route("**/Packs-*.js", async (route) => {
    await gate;
    await route.continue();
  });
  await page.goto("/");
  await page.getByRole("button", { name: "Packs", exact: true }).last().click();
  const loader = page
    .getByRole("status")
    .filter({ hasText: "Setting the scene" });
  await expect(loader).toBeVisible();
  const box = await page.locator(".scene-transition").boundingBox();
  expect(box).toEqual({ x: 0, y: 0, width: 390, height: 844 });
  await expect(page.locator(".loader-card")).toHaveCount(3);
  const before = await page
    .locator(".loader-card-2")
    .evaluate((el) => getComputedStyle(el).transform);
  await page.waitForTimeout(400);
  expect(
    await page
      .locator(".loader-card-2")
      .evaluate((el) => getComputedStyle(el).transform),
  ).not.toBe(before);
  expect(
    (await new AxeBuilder({ page }).withRules(["color-contrast"]).analyze())
      .violations,
  ).toEqual([]);
  await page.screenshot({ path: ".impeccable/review/scene-loader.png" });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(page.locator(".loader-card-2")).toHaveCSS(
    "animation-name",
    "none",
  );
  release();
  await expect(loader).toHaveCount(0);
  await expect(
    page
      .getByRole("heading", { name: "Your words. Their chaos.", exact: true })
      .first(),
  ).toBeVisible();
});

test("a short load is not flashed; a visible loader stays readable after content resolves", async ({
  page,
}) => {
  await page.addInitScript(() =>
    localStorage.setItem("hudl-welcome-v1", "true"),
  );
  let release = () => {};
  const gate = new Promise<void>((r) => (release = r));
  await page.route("**/Packs-*.js", async (route) => {
    await gate;
    await route.continue();
  });
  await page.goto("/");
  await page.getByRole("button", { name: "Packs", exact: true }).last().click();
  await expect(page.locator(".scene-transition")).toBeVisible();
  const began = Date.now();
  release();
  await page.waitForTimeout(200);
  await expect(page.locator(".scene-transition")).toBeVisible();
  await expect(page.locator(".scene-transition")).toHaveCount(0);
  expect(Date.now() - began).toBeGreaterThanOrEqual(750);
  await page.getByRole("button", { name: "Games", exact: true }).last().click();
  await page.getByRole("button", { name: "Packs", exact: true }).last().click();
  await expect(
    page.getByRole("heading", {
      name: "Your words. Their chaos.",
      exact: true,
    }),
  ).toBeVisible();
  await expect(page.locator(".scene-transition")).toHaveCount(0);
});
