import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
test("actual screen loading deals branded cards, then yields to content; reduced motion is static", async ({
  page,
}) => {
  await page.setViewportSize({width:390,height:844});
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
    page.getByRole("heading", { name: "Your words. Their chaos.", exact:true }).first(),
  ).toBeVisible();
});
